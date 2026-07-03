import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Trademark {
  id: number;
  applicationNumber: string;
  trademarkName: string;
  clientName: string | null;
  currentStatus: string;
  priorityLevel: "high" | "medium" | "low";
  recommendedAction: string | null;
  lastUpdatedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListTrademarksResponse {
  data: Trademark[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardSummary {
  total: number;
  examinationCases: number;
  hearingCases: number;
  opposedCases: number;
  registeredCases: number;
  otherCases: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  closed: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
}

export interface PriorityBreakdownItem {
  priority: string;
  count: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Query Keys ─────────────────────────────────────────────────────────────

export const getListTrademarksQueryKey = (params?: Record<string, unknown>) =>
  ["trademarks", params ?? {}] as const;

export const getGetTrademarkQueryKey = (id: number) =>
  ["trademarks", id] as const;

export const getGetDashboardSummaryQueryKey = () =>
  ["dashboard", "summary"] as const;

export const getGetStatusBreakdownQueryKey = () =>
  ["dashboard", "status-breakdown"] as const;

export const getGetPriorityBreakdownQueryKey = () =>
  ["dashboard", "priority-breakdown"] as const;

export const getGetRecentActivityQueryKey = () =>
  ["dashboard", "recent-activity"] as const;

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useListTrademarks(
  params?: { status?: string; priority?: string; search?: string; page?: number; limit?: number },
  options?: { query?: { enabled?: boolean } }
) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.priority) qs.set("priority", params.priority);
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));

  return useQuery<ListTrademarksResponse>({
    queryKey: getListTrademarksQueryKey(params),
    queryFn: () => apiFetch<ListTrademarksResponse>(`/api/trademarks?${qs}`),
    enabled: options?.query?.enabled ?? true,
  });
}

export function useGetTrademark(
  id: number,
  options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[] } }
) {
  return useQuery<Trademark>({
    queryKey: options?.query?.queryKey ?? getGetTrademarkQueryKey(id),
    queryFn: () => apiFetch<Trademark>(`/api/trademarks/${id}`),
    enabled: options?.query?.enabled ?? true,
  });
}

export function useCreateTrademark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Trademark>) =>
      apiFetch<Trademark>("/api/trademarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trademarks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTrademark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Trademark> }) =>
      apiFetch<Trademark>(`/api/trademarks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: getGetTrademarkQueryKey(variables.id) });
      qc.invalidateQueries({ queryKey: ["trademarks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTrademark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/trademarks/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Delete failed");
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trademarks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useGetDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => apiFetch<DashboardSummary>("/api/dashboard/summary"),
  });
}

export function useGetStatusBreakdown() {
  return useQuery<StatusBreakdownItem[]>({
    queryKey: getGetStatusBreakdownQueryKey(),
    queryFn: () => apiFetch<StatusBreakdownItem[]>("/api/dashboard/status-breakdown"),
  });
}

export function useGetPriorityBreakdown() {
  return useQuery<PriorityBreakdownItem[]>({
    queryKey: getGetPriorityBreakdownQueryKey(),
    queryFn: () => apiFetch<PriorityBreakdownItem[]>("/api/dashboard/priority-breakdown"),
  });
}

export function useGetRecentActivity() {
  return useQuery<Trademark[]>({
    queryKey: getGetRecentActivityQueryKey(),
    queryFn: () => apiFetch<Trademark[]>("/api/dashboard/recent-activity"),
  });
}

export function useExportReport(params?: { priority?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.priority) qs.set("priority", params.priority);
  if (params?.status) qs.set("status", params.status);

  return useQuery<{ data: Trademark[]; generatedAt: string; total: number }>({
    queryKey: ["reports", "export", params],
    queryFn: () =>
      apiFetch(`/api/reports/export?${qs}`),
    enabled: false,
  });
}
