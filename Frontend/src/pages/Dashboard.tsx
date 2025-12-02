import { Package, FileText, TrendingUp, Clock, Plus, Upload, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportForm } from "@/components/import/ImportForm";
import { ExportForm } from "@/components/export/ExportForm";
import { ExcelUploadModal } from "@/components/shared/ExcelUploadModal";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isImportFormOpen, setIsImportFormOpen] = useState(false);
  const [isExportFormOpen, setIsExportFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Mock data - will be replaced with real data
  const recentActivity = [
    { id: 1, type: "import", jobNo: "IMP-2024-001", action: "Added", time: "2 hours ago" },
    { id: 2, type: "export", jobNo: "EXP-2024-045", action: "Updated", time: "3 hours ago" },
    { id: 3, type: "import", jobNo: "IMP-2024-002", action: "Added", time: "5 hours ago" },
    { id: 4, type: "export", jobNo: "EXP-2024-046", action: "Updated", time: "1 day ago" },
    { id: 5, type: "import", jobNo: "IMP-2024-003", action: "Added", time: "1 day ago" },
  ];

  return (
    <div className="container mx-auto space-y-6 md:space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's your freight management overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="cursor-pointer" onClick={() => navigate("/import")}>
          <StatsCard
            title="Total Import Records"
            value="1,234"
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/export")}>
          <StatsCard
            title="Total Export Records"
            value="856"
            icon={FileText}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/analytics")}>
          <StatsCard
            title="This Month"
            value="142"
            icon={TrendingUp}
            description="Records added this month"
          />
        </div>
        <StatsCard
          title="Pending Reviews"
          value="23"
          icon={Clock}
          description="Awaiting documentation"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg md:text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Add Import Record"
            description="Create new import shipment entry"
            icon={Plus}
            color="primary"
            onClick={() => setIsImportFormOpen(true)}
          />
          <QuickActionCard
            title="Add Export Record"
            description="Create new export shipment entry"
            icon={FileDown}
            color="secondary"
            onClick={() => setIsExportFormOpen(true)}
          />
          <QuickActionCard
            title="Upload Excel File"
            description="Bulk import records from spreadsheet"
            icon={Upload}
            color="success"
            onClick={() => setIsUploadOpen(true)}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={activity.type === "import" ? "default" : "secondary"}>
                    {activity.type.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{activity.jobNo}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground self-start sm:self-auto">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ImportForm
        open={isImportFormOpen}
        onClose={() => setIsImportFormOpen(false)}
        onSubmit={(data) => {
          console.log("Import data:", data);
          toast({
            title: "Success",
            description: "Import record added successfully",
          });
        }}
      />

      <ExportForm
        open={isExportFormOpen}
        onClose={() => setIsExportFormOpen(false)}
        onSubmit={(data) => {
          console.log("Export data:", data);
          toast({
            title: "Success",
            description: "Export record added successfully",
          });
        }}
      />

      <ExcelUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        type="import"
        onUploadComplete={(records) => {
          toast({
            title: "Bulk Import Complete",
            description: `${records.length} records have been imported successfully.`,
          });
        }}
      />
    </div>
  );
};

export default Dashboard;
