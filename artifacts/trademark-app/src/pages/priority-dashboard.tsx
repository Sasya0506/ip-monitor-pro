import { useState } from "react";
import { useListTrademarks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrademarkStatusBadge } from "@/components/trademark-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PriorityDashboard() {
  const { data: highPriorityData, isLoading: isLoadingHigh } = useListTrademarks({ priority: "high", limit: 50 });
  const { data: mediumPriorityData, isLoading: isLoadingMedium } = useListTrademarks({ priority: "medium", limit: 50 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Priority Queue</h1>
        <p className="text-muted-foreground mt-1">Focus on items requiring immediate action or pending deadlines.</p>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-bold text-destructive">High Priority Action Items</h2>
          </div>
          
          <div className="grid gap-4">
            {isLoadingHigh ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))
            ) : highPriorityData?.data.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <p>No high priority items. Excellent work.</p>
                </CardContent>
              </Card>
            ) : (
              highPriorityData?.data.map(tm => (
                <Card key={tm.id} className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                      <div className="space-y-1 w-full sm:w-auto flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/trademarks/${tm.id}`} className="text-lg font-bold hover:underline text-primary">
                            {tm.trademarkName}
                          </Link>
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {tm.applicationNumber}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Client: <span className="font-medium text-foreground">{tm.clientName || "Unknown"}</span>
                        </div>
                        {tm.recommendedAction && (
                          <div className="mt-2 text-sm bg-destructive/10 text-destructive-foreground px-3 py-2 rounded-md border border-destructive/20 inline-block font-medium">
                            Action: {tm.recommendedAction}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                        <TrademarkStatusBadge status={tm.currentStatus} className="text-sm px-3 py-1" />
                        <Link href={`/trademarks/${tm.id}`}>
                          <Button size="sm" variant="outline" className="w-full sm:w-auto">
                            Review <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <h2 className="text-xl font-semibold">Medium Priority / Pending</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingMedium ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
              ))
            ) : mediumPriorityData?.data.length === 0 ? (
              <div className="col-span-full text-muted-foreground py-8">No medium priority items.</div>
            ) : (
              mediumPriorityData?.data.map(tm => (
                <Card key={tm.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base truncate">
                        <Link href={`/trademarks/${tm.id}`} className="hover:underline">
                          {tm.trademarkName}
                        </Link>
                      </CardTitle>
                    </div>
                    <CardDescription className="font-mono text-xs">{tm.applicationNumber}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TrademarkStatusBadge status={tm.currentStatus} className="w-full justify-center mb-3" />
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {tm.recommendedAction || "Monitor for updates from registry."}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
