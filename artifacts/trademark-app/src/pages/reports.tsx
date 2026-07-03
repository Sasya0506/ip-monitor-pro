import { useState } from "react";
import { useExportReport } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  const { refetch } = useExportReport(
    {
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      format: "json", // we fetch JSON and convert to CSV client side
    },
    { query: { enabled: false } }
  );

  const handleExport = async (format: "csv" | "json") => {
    try {
      if (format === "csv") setIsExportingCsv(true);
      else setIsExportingJson(true);

      const result = await refetch();
      
      if (!result.data) {
        throw new Error("No data returned");
      }

      const reportData = result.data.data;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `trademark_report_${timestamp}.${format}`;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        downloadBlob(blob, filename);
      } else {
        // Convert JSON to CSV
        const headers = ["Application Number", "Trademark Name", "Client", "Status", "Priority", "Last Updated", "Recommended Action", "Notes"];
        const csvRows = [headers.join(",")];
        
        reportData.forEach(tm => {
          const row = [
            `"${tm.applicationNumber}"`,
            `"${tm.trademarkName || ''}"`,
            `"${tm.clientName || ''}"`,
            `"${tm.currentStatus || ''}"`,
            `"${tm.priorityLevel || ''}"`,
            `"${tm.lastUpdatedDate || tm.updatedAt || ''}"`,
            `"${tm.recommendedAction || ''}"`,
            `"${(tm.notes || '').replace(/"/g, '""')}"`
          ];
          csvRows.push(row.join(","));
        });
        
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        downloadBlob(blob, filename);
      }
      
      toast({
        title: "Export Successful",
        description: `Downloaded ${reportData.length} records.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the report.",
        variant: "destructive"
      });
    } finally {
      setIsExportingCsv(false);
      setIsExportingJson(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Generate comprehensive data exports for clients or internal review.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>Filter the dataset before exporting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
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
            
            <div className="space-y-2">
              <Label>Filter by Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 gap-2" 
              size="lg"
              onClick={() => handleExport("csv")}
              disabled={isExportingCsv || isExportingJson}
            >
              {isExportingCsv ? <span className="animate-spin">⟳</span> : <FileSpreadsheet className="h-5 w-5" />}
              Export as CSV
            </Button>
            
            <Button 
              className="flex-1 gap-2" 
              variant="outline" 
              size="lg"
              onClick={() => handleExport("json")}
              disabled={isExportingCsv || isExportingJson}
            >
              {isExportingJson ? <span className="animate-spin">⟳</span> : <FileJson className="h-5 w-5" />}
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground text-center">
          <Download className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>Exports include all available metadata including internal notes and calculated priorities.</p>
          <p className="mt-1">For client-facing reports, remember to sanitize internal notes after export.</p>
        </CardContent>
      </Card>
    </div>
  );
}
