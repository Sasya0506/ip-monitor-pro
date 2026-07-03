import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getListTrademarksQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AddTrademark() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = applicationNumber.trim();
    if (!trimmed) {
      setError("Application number is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trademarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          applicationNumber: trimmed,
          trademarkName: trimmed,
          currentStatus: "Formalities Check Pass",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to add application");
      }
      const result = await res.json();
      toast({
        title: "Application Added",
        description: `Application ${trimmed} has been added successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: getListTrademarksQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      setLocation(`/trademarks/${result.id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add Application</h1>
        <p className="text-muted-foreground mt-1">Enter a trademark application number to add it to the tracking system.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Number</CardTitle>
          <CardDescription>Enter the official IP India application number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appNum" className="text-sm font-medium">
                Application Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appNum"
                type="text"
                value={applicationNumber}
                onChange={(e) => {
                  setApplicationNumber(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. 4812345"
                className="text-lg h-12"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                The record will be created with status "Formalities Check Pass" by default. You can update further details from the application detail page.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/status-dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                {loading ? "Adding..." : "Add Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
