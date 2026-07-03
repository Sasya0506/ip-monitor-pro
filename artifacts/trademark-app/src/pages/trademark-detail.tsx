import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetTrademark, 
  useUpdateTrademark, 
  useDeleteTrademark,
  getGetTrademarkQueryKey,
  getListTrademarksQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrademarkStatusBadge } from "@/components/trademark-status-badge";
import { TrademarkPriorityBadge } from "@/components/trademark-priority-badge";
import { ArrowLeft, Edit2, Save, Trash2, X, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STATUS_OPTIONS = [
  "Formalities Check Pass",
  "Marked for Examination",
  "Examination Report Issued",
  "Objected",
  "Hearing",
  "Opposed",
  "Accepted and Advertised",
  "Registered",
  "Refused",
  "Withdrawn",
  "Abandoned",
  "Show Cause Hearing",
  "Awaiting Hearing",
  "Accepted",
  "Renewed",
  "Closed"
];

const updateSchema = z.object({
  trademarkName: z.string().min(1, "Name is required"),
  clientName: z.string().optional(),
  currentStatus: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

export default function TrademarkDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);

  const { data: trademark, isLoading } = useGetTrademark(id, {
    query: { enabled: !!id, queryKey: getGetTrademarkQueryKey(id) }
  });

  const updateMutation = useUpdateTrademark();
  const deleteMutation = useDeleteTrademark();

  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    values: {
      trademarkName: trademark?.trademarkName || "",
      clientName: trademark?.clientName || "",
      currentStatus: trademark?.currentStatus || "",
      notes: trademark?.notes || "",
    }
  });

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!trademark) {
    return <div>Trademark not found.</div>;
  }

  const onSubmit = (data: z.infer<typeof updateSchema>) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: (result) => {
          toast({ title: "Updated successfully" });
          setIsEditing(false);
          // Invalidate cache
          queryClient.invalidateQueries({ queryKey: getGetTrademarkQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListTrademarksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
        onError: () => {
          toast({ title: "Update failed", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListTrademarksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setLocation("/status-dashboard");
        },
        onError: () => {
          toast({ title: "Delete failed", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
              {trademark.trademarkName}
              {!isEditing && <TrademarkStatusBadge status={trademark.currentStatus} className="ml-2" />}
            </h1>
            <p className="text-muted-foreground mt-1 font-mono">App No: {trademark.applicationNumber}</p>
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the trademark application record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form id="edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="trademarkName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trademark Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Client Name</div>
                    <div className="mt-1 text-base">{trademark.clientName || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Registry Status</div>
                    <div className="mt-1 text-base font-medium">{trademark.currentStatus}</div>
                  </div>
                  <div className="col-span-2 pt-4 border-t">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Internal Notes</div>
                    {trademark.notes ? (
                      <div className="text-base whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">{trademark.notes}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">No notes provided.</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button type="submit" form="edit-form" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" /> 
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <TrademarkPriorityBadge priority={trademark.priorityLevel} className="w-full justify-center text-sm py-1.5" />
              </div>
              <p className="text-sm leading-relaxed">
                {trademark.recommendedAction || "Monitor for updates. No immediate action required based on current status."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {trademark.lastUpdatedDate 
                    ? format(new Date(trademark.lastUpdatedDate), 'MMMM d, yyyy') 
                    : format(new Date(trademark.updatedAt), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{format(new Date(trademark.createdAt), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">System ID:</span>
                <span className="font-mono">{trademark.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
