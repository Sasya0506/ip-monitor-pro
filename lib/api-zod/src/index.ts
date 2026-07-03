import { z } from "zod";

export const HealthCheckResponse = z.object({
  status: z.literal("ok"),
});

export const CreateTrademarkBody = z.object({
  applicationNumber: z.string().min(1),
  trademarkName: z.string().min(1),
  clientName: z.string().optional(),
  currentStatus: z.string().min(1),
  lastUpdatedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateTrademarkBody = z.object({
  trademarkName: z.string().min(1).optional(),
  clientName: z.string().optional(),
  currentStatus: z.string().min(1).optional(),
  lastUpdatedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const GetTrademarkParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const UpdateTrademarkParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const DeleteTrademarkParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const ListTrademarksQueryParams = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(50),
});

export const BulkImportTrademarksBody = z.object({
  applications: z.array(
    z.object({
      applicationNumber: z.string().min(1),
      trademarkName: z.string().min(1),
      clientName: z.string().optional(),
      currentStatus: z.string().min(1),
      lastUpdatedDate: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
});

export const ExportReportQueryParams = z.object({
  priority: z.string().optional(),
  status: z.string().optional(),
});
