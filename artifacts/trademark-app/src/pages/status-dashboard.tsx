import { useState } from "react";
import { useListTrademarks } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrademarkStatusBadge } from "@/components/trademark-status-badge";
import { TrademarkPriorityBadge } from "@/components/trademark-priority-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

export default function StatusDashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { data, isLoading } = useListTrademarks({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Status Tracking</h1>
        <p className="text-muted-foreground mt-1">Full registry of trademark applications and current status.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by trademark, application no, or client..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex w-full sm:w-auto items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Formalities Check Pass">Formalities Check Pass</SelectItem>
                  <SelectItem value="Marked for Examination">Marked for Exam</SelectItem>
                  <SelectItem value="Examination Report Issued">Exam Report Issued</SelectItem>
                  <SelectItem value="Objected">Objected</SelectItem>
                  <SelectItem value="Hearing">Hearing</SelectItem>
                  <SelectItem value="Opposed">Opposed</SelectItem>
                  <SelectItem value="Accepted and Advertised">Accepted & Advertised</SelectItem>
                  <SelectItem value="Registered">Registered</SelectItem>
                  <SelectItem value="Refused">Refused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">App No.</TableHead>
                  <TableHead>Trademark</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No trademark applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((tm) => (
                    <TableRow key={tm.id}>
                      <TableCell className="font-mono text-xs">{tm.applicationNumber}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/trademarks/${tm.id}`} className="hover:underline text-primary">
                          {tm.trademarkName}
                        </Link>
                      </TableCell>
                      <TableCell>{tm.clientName || "-"}</TableCell>
                      <TableCell>
                        <TrademarkStatusBadge status={tm.currentStatus} />
                      </TableCell>
                      <TableCell>
                        <TrademarkPriorityBadge priority={tm.priorityLevel} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {tm.lastUpdatedDate ? format(new Date(tm.lastUpdatedDate), 'MMM d, yyyy') : format(new Date(tm.updatedAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {data?.total ? (
             <div className="mt-4 text-xs text-muted-foreground text-right">
               Showing {data.data.length} of {data.total} applications
             </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
