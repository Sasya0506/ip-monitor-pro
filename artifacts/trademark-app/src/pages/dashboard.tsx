import { useGetDashboardSummary, useGetStatusBreakdown, useGetPriorityBreakdown, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrademarkStatusBadge } from "@/components/trademark-status-badge";
import { TrademarkPriorityBadge } from "@/components/trademark-priority-badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Link } from "wouter";
import { format } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, FileText, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: statusBreakdown, isLoading: isLoadingStatus } = useGetStatusBreakdown();
  const { data: priorityBreakdown, isLoading: isLoadingPriority } = useGetPriorityBreakdown();
  const { data: recentActivity, isLoading: isLoadingRecent } = useGetRecentActivity();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor all trademark applications and prioritize critical actions.</p>
      </div>

      {/* Top metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold">{summary?.total.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active tracked matters</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold text-destructive">{summary?.highPriority.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Examination</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold">{summary?.examinationCases.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Pending official report</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered / Closed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold">{(summary?.registeredCases || 0) + (summary?.closed || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Completed lifecycle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Status Breakdown Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current distribution of active applications</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingStatus ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-4/5 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis 
                    dataKey="status" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 11 }} 
                    interval={0} 
                  />
                  <YAxis />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusBreakdown?.map((entry, index) => {
                      let color = "#3b82f6"; // default blue
                      if (entry.status.includes("Hearing") || entry.status.includes("Opposed") || entry.status.includes("Objected")) color = "#ef4444";
                      else if (entry.status.includes("Examination") || entry.status.includes("Formalities")) color = "#f59e0b";
                      else if (entry.status.includes("Registered") || entry.status.includes("Accepted")) color = "#10b981";
                      else if (entry.status.includes("Refused") || entry.status.includes("Abandoned")) color = "#64748b";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Applications by urgency</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {isLoadingPriority ? (
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="priority"
                  >
                    {priorityBreakdown?.map((entry, index) => {
                      const colorMap: Record<string, string> = {
                        "high": "#ef4444",
                        "medium": "#f59e0b",
                        "low": "#10b981"
                      };
                      return <Cell key={`cell-${index}`} fill={colorMap[entry.priority.toLowerCase()] || "#3b82f6"} />;
                    })}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates across your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentActivity?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity found.
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity?.map((tm) => (
                <div key={tm.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/trademarks/${tm.id}`} className="font-semibold hover:underline text-primary">
                        {tm.trademarkName}
                      </Link>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        App No. {tm.applicationNumber}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Client: {tm.clientName || "Unknown"} • Last updated: {tm.lastUpdatedDate ? format(new Date(tm.lastUpdatedDate), 'MMM d, yyyy') : format(new Date(tm.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrademarkPriorityBadge priority={tm.priorityLevel} />
                    <TrademarkStatusBadge status={tm.currentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
