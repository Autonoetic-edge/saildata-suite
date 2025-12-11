import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Plus, Upload, Download } from "lucide-react";
import { ExportForm } from "@/components/export/ExportForm";
import { ExportDetailModal } from "@/components/export/ExportDetailModal";
import { ExcelUploadModal } from "@/components/shared/ExcelUploadModal";
import AdvancedFilters, { ExportFilters } from "@/components/export/AdvancedFilters";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, formatExportDataForExport } from "@/lib/csvExport";
import { exportService } from "@/services/exportService";
import { useEffect } from "react";
import { format } from "date-fns";

const Export = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ExportFilters>({});
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 50;
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await exportService.getExports(currentPage, recordsPerPage);

        const mappedData = response.data.map(item => ({
          id: item.id,
          sNo: item.s_no,
          jobNo: item.job_no,
          invoiceNo: item.inv_no,
          invoiceDate: item.date,
          sBillNo: item.s_bill_no,
          sBillDate: item.s_bill_date,
          leoDate: item.leo_date,
          forwarder: item.forwarder_name,
          bookingNo: item.booking_no,
          containerNo: item.container_no,
          containerSize: item.size,
          shippingLine: item.s_line,
          pod: item.pod,
          trainNo: item.train_no,
          wagonNo: item.wagon_no,
          wagonDate: item.wagon_date,
          reward: item.reward,
          invoiceValue: item.inv_value_fc || 0,
          fobValue: item.fob_value_inr || 0,
          dbkAmount: item.dbk_amount || 0,
          igstAmount: item.igst_amount || 0,
          egmNo: item.egm_no,
          egmDate: item.egm_date,
          currentQty: item.current_qty,
          dbkScrollNo: item.dbk_scroll_no,
          scrollDate: item.scroll_date,
          remarks: item.remarks,
          status: "Pending" // Default status
        }));

        setData(mappedData);
        setTotalRecords(response.total);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load export data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, toast]);

  // Filter data based on search query and advanced filters
  const filteredData = data.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (record.jobNo?.toLowerCase() || "").includes(searchLower) ||
      (record.invoiceNo?.toLowerCase() || "").includes(searchLower) ||
      (record.forwarder?.toLowerCase() || "").includes(searchLower);

    const matchesJobNo = !advancedFilters.jobNo || record.jobNo.toLowerCase().includes(advancedFilters.jobNo.toLowerCase());
    const matchesInvoiceNo = !advancedFilters.invoiceNo || record.invoiceNo.toLowerCase().includes(advancedFilters.invoiceNo.toLowerCase());
    const matchesForwarder = !advancedFilters.forwarder || record.forwarder === advancedFilters.forwarder;
    const matchesContainerSize = !advancedFilters.containerSize || record.containerSize === advancedFilters.containerSize;
    const matchesStatus = !advancedFilters.status || record.status === advancedFilters.status;

    return matchesSearch && matchesJobNo && matchesInvoiceNo && matchesForwarder && matchesContainerSize && matchesStatus;
  });

  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredData;

  const handleExportCSV = () => {
    try {
      const formattedData = formatExportDataForExport(filteredData);
      exportToCSV({
        filename: "export_data",
        data: formattedData,
      });
      toast({
        title: "Export Successful",
        description: `${filteredData.length} records exported to CSV.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDelete = async (record: any) => {
    setIsDetailOpen(false);
    try {
      await exportService.deleteExport(record.id);
      toast({
        title: "Record Deleted",
        description: `Export record ${record.jobNo} has been deleted.`,
      });
      // Refresh data
      const response = await exportService.getExports(currentPage, recordsPerPage);
      const mappedData = response.data.map(item => ({
        id: item.id,
        jobNo: item.job_no,
        invoiceNo: item.inv_no,
        invoiceDate: item.date,
        sBillNo: item.s_bill_no,
        sBillDate: item.s_bill_date,
        leoDate: item.leo_date,
        forwarder: item.forwarder_name,
        bookingNo: item.booking_no,
        containerNo: item.container_no,
        containerSize: item.size,
        shippingLine: item.s_line,
        pod: item.pod,
        status: "Pending",
        invoiceValue: "0.00",
        fobValue: "0.00",
        trainNo: null,
        wagonNo: null,
        reward: null,
        dbkAmount: null,
        igstAmount: null,
        egmNo: null,
        egmDate: null,
        dbkScrollNo: null,
        scrollDate: null,
        remarks: null
      }));
      setData(mappedData);
      setTotalRecords(response.total);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete export record",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-success/10 text-success hover:bg-success/20";
      case "Shipped":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Export Data</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your export shipment records</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => setIsUploadOpen(true)} className="gap-2 flex-1 sm:flex-initial" size="sm">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Excel</span>
            <span className="sm:hidden">Upload</span>
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 flex-1 sm:flex-initial" size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Record</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Job No, Invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedFilters
          onApply={(filters) => {
            setAdvancedFilters(filters);
            setCurrentPage(1);
          }}
          onReset={() => {
            setAdvancedFilters({});
            setCurrentPage(1);
          }}
        />
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-full">
            <Table className="min-w-[3000px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold sticky left-0 bg-muted/50 z-10 min-w-[80px]">S/NO</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Job No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Inv No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Date</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">S/Bill No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">S/Bill Date</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">LEO Date</TableHead>
                  <TableHead className="font-semibold min-w-[150px]">Forwarder Name</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">Booking No</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">Container No</TableHead>
                  <TableHead className="font-semibold min-w-[80px]">Size</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">S/Line</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">POD</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Train No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Wagon No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Wagon Date</TableHead>
                  <TableHead className="font-semibold min-w-[80px]">Reward</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">Inv Value (FC)</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">FOB Value (INR)</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">DBK Amount</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">IGST Amount</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">EGM No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">EGM Date</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Current Qty</TableHead>
                  <TableHead className="font-semibold min-w-[120px]">DBK Scroll No</TableHead>
                  <TableHead className="font-semibold min-w-[100px]">Scroll Date</TableHead>
                  <TableHead className="font-semibold min-w-[150px]">Remarks</TableHead>
                  <TableHead className="font-semibold min-w-[80px]">Status</TableHead>
                  <TableHead className="text-right font-semibold sticky right-0 bg-muted/50 z-10 min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={29} className="text-center py-10">Loading...</TableCell>
                  </TableRow>
                ) : currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={29} className="text-center py-10 text-muted-foreground">No records found</TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium sticky left-0 bg-background z-10">{record.sNo || '-'}</TableCell>
                      <TableCell>{record.jobNo || '-'}</TableCell>
                      <TableCell>{record.invoiceNo || '-'}</TableCell>
                      <TableCell>{record.invoiceDate ? format(new Date(record.invoiceDate), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>{record.sBillNo || '-'}</TableCell>
                      <TableCell>{record.sBillDate ? format(new Date(record.sBillDate), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>{record.leoDate ? format(new Date(record.leoDate), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>{record.forwarder || '-'}</TableCell>
                      <TableCell>{record.bookingNo || '-'}</TableCell>
                      <TableCell>{record.containerNo || '-'}</TableCell>
                      <TableCell>{record.containerSize || '-'}</TableCell>
                      <TableCell>{record.shippingLine || '-'}</TableCell>
                      <TableCell>{record.pod || '-'}</TableCell>
                      <TableCell>{record.trainNo || '-'}</TableCell>
                      <TableCell>{record.wagonNo || '-'}</TableCell>
                      <TableCell>{record.wagonDate ? format(new Date(record.wagonDate), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>{record.reward || '-'}</TableCell>
                      <TableCell>{record.invoiceValue ? `$${record.invoiceValue.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{record.fobValue ? `₹${record.fobValue.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{record.dbkAmount ? `₹${record.dbkAmount.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{record.igstAmount ? `₹${record.igstAmount.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{record.egmNo || '-'}</TableCell>
                      <TableCell>{record.egmDate ? format(new Date(record.egmDate), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>{record.currentQty || '-'}</TableCell>
                      <TableCell>{record.dbkScrollNo || '-'}</TableCell>
                      <TableCell>{record.scrollDate ? format(new Date(record.scrollDate), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={record.remarks}>{record.remarks || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right sticky right-0 bg-background z-10">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-primary"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(record)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 md:px-6 py-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <div className="sm:hidden text-sm font-medium">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExportForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRecord(null);
        }}
        initialData={selectedRecord ? {
          jobNo: selectedRecord.jobNo,
          invoiceNo: selectedRecord.invoiceNo,
          invoiceDate: selectedRecord.invoiceDate ? new Date(selectedRecord.invoiceDate) : undefined,
          sBillNo: selectedRecord.sBillNo,
          sBillDate: selectedRecord.sBillDate ? new Date(selectedRecord.sBillDate) : undefined,
          leoDate: selectedRecord.leoDate ? new Date(selectedRecord.leoDate) : undefined,
          forwarderName: selectedRecord.forwarder,
          bookingNo: selectedRecord.bookingNo,
          containerNo: selectedRecord.containerNo,
          size: selectedRecord.containerSize,
          shippingLine: selectedRecord.shippingLine,
          pod: selectedRecord.pod,
          // Map other fields if they exist in selectedRecord
        } : undefined}
        onSubmit={async (data) => {
          try {
            const payload = {
              job_no: data.jobNo,
              inv_no: data.invoiceNo,
              date: data.invoiceDate ? format(data.invoiceDate, 'yyyy-MM-dd') : undefined,
              s_bill_no: data.sBillNo,
              s_bill_date: data.sBillDate ? format(data.sBillDate, 'yyyy-MM-dd') : undefined,
              leo_date: data.leoDate ? format(data.leoDate, 'yyyy-MM-dd') : undefined,
              forwarder_name: data.forwarderName,
              booking_no: data.bookingNo,
              container_no: data.containerNo,
              size: data.size,
              s_line: data.shippingLine,
              pod: data.pod,
              // Add other fields as needed by backend
            };

            if (selectedRecord) {
              await exportService.updateExport(selectedRecord.id, payload);
              toast({
                title: "Success",
                description: "Export record updated successfully",
              });
            } else {
              await exportService.createExport(payload);
              toast({
                title: "Success",
                description: "Export record added successfully",
              });
            }

            // Refresh data
            const response = await exportService.getExports(currentPage, recordsPerPage);
            // ... (same mapping logic as in useEffect, maybe extract it?)
            const mappedData = response.data.map(item => ({
              id: item.id,
              jobNo: item.job_no,
              invoiceNo: item.inv_no,
              invoiceDate: item.date,
              sBillNo: item.s_bill_no,
              sBillDate: item.s_bill_date,
              leoDate: item.leo_date,
              forwarder: item.forwarder_name,
              bookingNo: item.booking_no,
              containerNo: item.container_no,
              containerSize: item.size,
              shippingLine: item.s_line,
              pod: item.pod,
              status: "Pending",
              invoiceValue: "0.00",
              fobValue: "0.00",
              trainNo: null,
              wagonNo: null,
              reward: null,
              dbkAmount: null,
              igstAmount: null,
              egmNo: null,
              egmDate: null,
              dbkScrollNo: null,
              scrollDate: null,
              remarks: null
            }));
            setData(mappedData);
            setTotalRecords(response.total);

            setIsFormOpen(false);
            setSelectedRecord(null);
          } catch (error) {
            console.error("Operation failed:", error);
            toast({
              title: "Error",
              description: "Failed to save export record",
              variant: "destructive",
            });
          }
        }}
      />

      <ExportDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        record={selectedRecord}
        onEdit={() => handleEdit(selectedRecord!)}
        onDelete={() => handleDelete(selectedRecord!)}
      />

      <ExcelUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        type="export"
        onUpload={async (file) => {
          await exportService.uploadExport(file);
        }}
        onUploadComplete={async () => {
          // Refresh data
          const response = await exportService.getExports(currentPage, recordsPerPage);
          const mappedData = response.data.map(item => ({
            id: item.id,
            jobNo: item.job_no,
            invoiceNo: item.inv_no,
            invoiceDate: item.date ? format(new Date(item.date), 'yyyy-MM-dd') : '',
            sBillNo: item.s_bill_no,
            sBillDate: item.s_bill_date ? format(new Date(item.s_bill_date), 'yyyy-MM-dd') : '',
            leoDate: item.leo_date ? format(new Date(item.leo_date), 'yyyy-MM-dd') : '',
            forwarder: item.forwarder_name,
            bookingNo: item.booking_no,
            containerNo: item.container_no,
            containerSize: item.size,
            shippingLine: item.s_line,
            pod: item.pod,
            status: "Pending", // Default status
            trainNo: "",
            wagonNo: "",
            reward: "",
            invoiceValue: "",
            fobValue: "",
            dbkAmount: "",
            igstAmount: "",
            egmNo: "",
            egmDate: "",
            dbkScrollNo: "",
            scrollDate: "",
            remarks: ""
          }));
          setData(mappedData);
          setTotalRecords(response.total);
        }}
      />
    </div>
  );
};

export default Export;
