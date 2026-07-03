import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { db, trademarksTable } from "@workspace/db";
import { ExportReportQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /dashboard/summary
router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      currentStatus: trademarksTable.currentStatus,
      priorityLevel: trademarksTable.priorityLevel,
      count: sql<number>`count(*)`,
    })
    .from(trademarksTable)
    .groupBy(trademarksTable.currentStatus, trademarksTable.priorityLevel);

  let total = 0;
  let examinationCases = 0;
  let hearingCases = 0;
  let opposedCases = 0;
  let registeredCases = 0;
  let otherCases = 0;
  let highPriority = 0;
  let mediumPriority = 0;
  let lowPriority = 0;
  let closed = 0;

  const examinationStatuses = ["Marked for Examination", "Formalities Check Pass", "Examination Report Issued", "Objected"];
  const hearingStatuses = ["Hearing", "Awaiting Hearing", "Show Cause Hearing"];
  const opposedStatuses = ["Opposed"];
  const registeredStatuses = ["Registered", "Renewed"];
  const closedStatuses = ["Closed", "Withdrawn", "Refused", "Abandoned"];

  for (const row of rows) {
    const count = Number(row.count);
    total += count;

    if (examinationStatuses.includes(row.currentStatus)) examinationCases += count;
    else if (hearingStatuses.includes(row.currentStatus)) hearingCases += count;
    else if (opposedStatuses.includes(row.currentStatus)) opposedCases += count;
    else if (registeredStatuses.includes(row.currentStatus)) registeredCases += count;
    else otherCases += count;

    if (closedStatuses.includes(row.currentStatus)) closed += count;

    if (row.priorityLevel === "high") highPriority += count;
    else if (row.priorityLevel === "medium") mediumPriority += count;
    else lowPriority += count;
  }

  res.json({
    total,
    examinationCases,
    hearingCases,
    opposedCases,
    registeredCases,
    otherCases,
    highPriority,
    mediumPriority,
    lowPriority,
    closed,
  });
});

// GET /dashboard/status-breakdown
router.get("/dashboard/status-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      status: trademarksTable.currentStatus,
      count: sql<number>`count(*)`,
    })
    .from(trademarksTable)
    .groupBy(trademarksTable.currentStatus)
    .orderBy(sql`count(*) desc`);

  res.json(rows.map(r => ({ status: r.status, count: Number(r.count) })));
});

// GET /dashboard/priority-breakdown
router.get("/dashboard/priority-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      priority: trademarksTable.priorityLevel,
      count: sql<number>`count(*)`,
    })
    .from(trademarksTable)
    .groupBy(trademarksTable.priorityLevel);

  res.json(rows.map(r => ({ priority: r.priority, count: Number(r.count) })));
});

// GET /dashboard/recent-activity
router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const trademarks = await db
    .select()
    .from(trademarksTable)
    .orderBy(desc(trademarksTable.updatedAt))
    .limit(10);

  res.json(
    trademarks.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  );
});

// GET /reports/export
router.get("/reports/export", async (req, res): Promise<void> => {
  const parsed = ExportReportQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { priority, status } = parsed.data;

  let query = db.select().from(trademarksTable).$dynamic();

  const conditions = [];
  if (status) {
    const { eq } = await import("drizzle-orm");
    conditions.push(eq(trademarksTable.currentStatus, status));
  }
  if (priority) {
    const { eq } = await import("drizzle-orm");
    conditions.push(eq(trademarksTable.priorityLevel, priority as "high" | "medium" | "low"));
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const data = await query.orderBy(trademarksTable.priorityLevel, desc(trademarksTable.updatedAt));

  res.json({
    data: data.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    generatedAt: new Date().toISOString(),
    total: data.length,
  });
});

export default router;
