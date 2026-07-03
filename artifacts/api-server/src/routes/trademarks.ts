import { Router, type IRouter } from "express";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";
import { db, trademarksTable } from "@workspace/db";
import {
  CreateTrademarkBody,
  UpdateTrademarkBody,
  GetTrademarkParams,
  UpdateTrademarkParams,
  DeleteTrademarkParams,
  ListTrademarksQueryParams,
  BulkImportTrademarksBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function computePriority(status: string): "high" | "medium" | "low" {
  const highStatuses = [
    "Hearing",
    "Awaiting Hearing",
    "Opposed",
    "Show Cause Hearing",
    "Examination Report Issued",
    "Objected",
  ];
  const mediumStatuses = [
    "Marked for Examination",
    "Formalities Check Pass",
    "Accepted",
    "Accepted and Advertised",
  ];

  if (highStatuses.includes(status)) return "high";
  if (mediumStatuses.includes(status)) return "medium";
  return "low";
}

function computeRecommendedAction(status: string): string {
  const actions: Record<string, string> = {
    "Hearing": "Prepare hearing submissions urgently",
    "Awaiting Hearing": "Monitor hearing date and prepare arguments",
    "Opposed": "File counter-statement within 2 months",
    "Show Cause Hearing": "Prepare response for show cause hearing",
    "Examination Report Issued": "Review examination report and file response within 30 days",
    "Objected": "File response to objection within 30 days",
    "Marked for Examination": "Await examination report",
    "Formalities Check Pass": "Await examination stage",
    "Accepted": "Monitor for advertisement",
    "Accepted and Advertised": "Watch for oppositions during advertisement period",
    "Registered": "Renew trademark before expiry",
    "Renewed": "Monitor next renewal date",
    "Closed": "No action required",
    "Withdrawn": "Case closed - no action required",
    "Refused": "Consider filing appeal if within limitation period",
    "Abandoned": "Consider re-filing application",
  };
  return actions[status] ?? "Monitor status";
}

// GET /trademarks
router.get("/trademarks", async (req, res): Promise<void> => {
  const parsed = ListTrademarksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, priority, search, page = 1, limit = 50 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (status) {
    conditions.push(eq(trademarksTable.currentStatus, status));
  }
  if (priority) {
    conditions.push(eq(trademarksTable.priorityLevel, priority as "high" | "medium" | "low"));
  }
  if (search) {
    conditions.push(
      or(
        ilike(trademarksTable.applicationNumber, `%${search}%`),
        ilike(trademarksTable.trademarkName, `%${search}%`),
        ilike(trademarksTable.clientName, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(trademarksTable)
      .where(where)
      .orderBy(trademarksTable.priorityLevel, desc(trademarksTable.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(trademarksTable)
      .where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    data: data.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    total,
    page,
    limit,
  });
});

// POST /trademarks
router.post("/trademarks", async (req, res): Promise<void> => {
  const parsed = CreateTrademarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { currentStatus, ...rest } = parsed.data;
  const priorityLevel = computePriority(currentStatus);
  const recommendedAction = computeRecommendedAction(currentStatus);

  const [trademark] = await db
    .insert(trademarksTable)
    .values({ ...rest, currentStatus, priorityLevel, recommendedAction })
    .returning();

  res.status(201).json({
    ...trademark,
    createdAt: trademark.createdAt.toISOString(),
    updatedAt: trademark.updatedAt.toISOString(),
  });
});

// GET /trademarks/:id
router.get("/trademarks/:id", async (req, res): Promise<void> => {
  const params = GetTrademarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [trademark] = await db
    .select()
    .from(trademarksTable)
    .where(eq(trademarksTable.id, params.data.id));

  if (!trademark) {
    res.status(404).json({ error: "Trademark not found" });
    return;
  }

  res.json({
    ...trademark,
    createdAt: trademark.createdAt.toISOString(),
    updatedAt: trademark.updatedAt.toISOString(),
  });
});

// PATCH /trademarks/:id
router.patch("/trademarks/:id", async (req, res): Promise<void> => {
  const params = UpdateTrademarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTrademarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };

  if (parsed.data.currentStatus) {
    updateData.priorityLevel = computePriority(parsed.data.currentStatus);
    updateData.recommendedAction = computeRecommendedAction(parsed.data.currentStatus);
  }

  const [trademark] = await db
    .update(trademarksTable)
    .set(updateData)
    .where(eq(trademarksTable.id, params.data.id))
    .returning();

  if (!trademark) {
    res.status(404).json({ error: "Trademark not found" });
    return;
  }

  res.json({
    ...trademark,
    createdAt: trademark.createdAt.toISOString(),
    updatedAt: trademark.updatedAt.toISOString(),
  });
});

// DELETE /trademarks/:id
router.delete("/trademarks/:id", async (req, res): Promise<void> => {
  const params = DeleteTrademarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [trademark] = await db
    .delete(trademarksTable)
    .where(eq(trademarksTable.id, params.data.id))
    .returning();

  if (!trademark) {
    res.status(404).json({ error: "Trademark not found" });
    return;
  }

  res.sendStatus(204);
});

// POST /trademarks/bulk
router.post("/trademarks/bulk", async (req, res): Promise<void> => {
  const parsed = BulkImportTrademarksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { applications } = parsed.data;
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const app of applications) {
    try {
      const priorityLevel = computePriority(app.currentStatus);
      const recommendedAction = computeRecommendedAction(app.currentStatus);
      await db.insert(trademarksTable).values({ ...app, priorityLevel, recommendedAction });
      imported++;
    } catch (err) {
      failed++;
      errors.push(`Failed to import ${app.applicationNumber}: ${err}`);
    }
  }

  res.json({ imported, failed, total: applications.length, errors });
});

export default router;
