import { Package, FileText, TrendingUp, Clock, Plus, Upload, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportForm } from "@/components/import/ImportForm";
import { ExportForm } from "@/components/export/ExportForm";
import { ExcelUploadModal } from "@/components/shared/ExcelUploadModal";
import { useToast } from "@/hooks/use-toast";
import { dashboardService, DashboardStats, RecentActivity } from "@/services/dashboardService";
import { importService } from "@/services/importService";
import { exportService } from "@/services/exportService";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isImportFormOpen, setIsImportFormOpen] = useState(false);
  const [isExportFormOpen, setIsExportFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"import" | "export">("import");

  // State for real data from API
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, activityData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(5)
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Refresh data function
  const refreshData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(5)
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
    }
  };

  const handleImportSubmit = async (data: any) => {
    try {
      await importService.createImport({
        job_no: data.jobNo,
        shipper_name: data.shipperName,
        invoice_no_dt: data.invoiceNoDate,
        fc_value: data.fcValue,
        description: data.description,
        forwarder_name: data.forwarderName,
        hbl_no_dt: data.hblNoDate,
        mbl_no_dt: data.mblNoDate,
        s_line: data.shippingLine,
        pol: data.pol,
        pod: data.pod,
        terms: data.terms,
        container_nos: data.containerNos,
        size: data.size,
        nn_copy_rcvd: data.nnCopyReceived,
        original_docs_rcvd: data.originalDocsReceived,
        eta_date: data.etaDate,
        remarks: data.remarks,
      });
      toast({
        title: "Success",
        description: "Import record added successfully",
      });
      setIsImportFormOpen(false);
      refreshData();
    } catch (error) {
      console.error("Failed to create import:", error);
      toast({
        title: "Error",
        description: "Failed to create import record",
        variant: "destructive",
      });
    }
  };

  const handleExportSubmit = async (data: any) => {
    try {
      await exportService.createExport({
        job_no: data.jobNo,
        inv_no: data.invoiceNo,
        date: data.invoiceDate,
        s_bill_no: data.sBillNo,
        s_bill_date: data.sBillDate,
        leo_date: data.leoDate,
        forwarder_name: data.forwarderName,
        booking_no: data.bookingNo,
        container_no: data.containerNo,
        size: data.size,
        s_line: data.shippingLine,
        pod: data.pod,
      });
      toast({
        title: "Success",
        description: "Export record added successfully",
      });
      setIsExportFormOpen(false);
      refreshData();
    } catch (error) {
      console.error("Failed to create export:", error);
      toast({
        title: "Error",
        description: "Failed to create export record",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = (type: "import" | "export") => {
    setUploadType(type);
    setIsUploadOpen(true);
  };

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
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <StatsCard
              title="Total Import Records"
              value={stats?.totalImports?.toLocaleString() || "0"}
              icon={Package}
              trend={{ value: stats?.importTrend || 0, isPositive: (stats?.importTrend || 0) >= 0 }}
            />
          )}
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/export")}>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <StatsCard
              title="Total Export Records"
              value={stats?.totalExports?.toLocaleString() || "0"}
              icon={FileText}
              trend={{ value: stats?.exportTrend || 0, isPositive: (stats?.exportTrend || 0) >= 0 }}
            />
          )}
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/analytics")}>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <StatsCard
              title="This Month"
              value={stats?.thisMonthTotal?.toLocaleString() || "0"}
              icon={TrendingUp}
              description="Records added this month"
            />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <StatsCard
            title="Pending Reviews"
            value={stats?.pendingReviews?.toLocaleString() || "0"}
            icon={Clock}
            description="Awaiting documentation"
          />
        )}
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
            onClick={() => handleUploadClick("import")}
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ImportForm
        open={isImportFormOpen}
        onClose={() => setIsImportFormOpen(false)}
        onSubmit={handleImportSubmit}
      />

      <ExportForm
        open={isExportFormOpen}
        onClose={() => setIsExportFormOpen(false)}
        onSubmit={handleExportSubmit}
      />

      <ExcelUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        type={uploadType}
        onUpload={async (file) => {
          if (uploadType === "import") {
            await importService.uploadImport(file);
          } else {
            await exportService.uploadExport(file);
          }
        }}
        onUploadComplete={() => {
          refreshData();
        }}
      />
    </div>
  );
};

export default Dashboard;
