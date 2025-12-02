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
import { ImportForm } from "@/components/import/ImportForm";
import { ImportDetailModal } from "@/components/import/ImportDetailModal";
import { ExcelUploadModal } from "@/components/shared/ExcelUploadModal";
import AdvancedFilters, { ImportFilters } from "@/components/import/AdvancedFilters";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, formatImportDataForExport } from "@/lib/csvExport";
import { importService } from "@/services/importService";
import { useEffect } from "react";
import { format } from "date-fns";

const Import = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ImportFilters>({});
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
        const response = await importService.getImports(currentPage, recordsPerPage);

        const mappedData = response.data.map(item => ({
          id: item.id,
          jobNo: item.job_no,
          shipperName: item.shipper_name,
          invoiceNo: item.invoice_no_dt,
          fcValue: item.fc_value,
          description: item.description,
          forwarder: item.forwarder_name,
          hblNo: item.hbl_no_dt,
          mblNo: item.mbl_no_dt,
          shippingLine: item.s_line,
          pol: item.pol,
          pod: item.pod,
          terms: item.terms,
          containerNos: item.container_nos,
          containerSize: item.size,
          nnCopyReceived: item.nn_copy_rcvd,
          originalDocsReceived: item.original_docs_rcvd,
          etaDate: item.eta_date,
          remarks: item.remarks,
          status: "Pending", // Default as not in DB
          // Fields missing in DB but used in UI (defaulting to null/undefined)
          arrivalStatus: "Pending",
          roDate: null,
          doStatus: null,
          beNo: null,
          beDate: null,
          assessmentDate: null,
          hsCode: null,
          assessedValue: null,
          dutyPaid: null,
          oocDate: null,
          destuffedDate: null
        }));

        setData(mappedData);
        setTotalRecords(response.total);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load import data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, toast]);

  // Filter data based on search query and advanced filters (Client-side filtering for now as API doesn't support search yet)
  const filteredData = data.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (record.jobNo?.toLowerCase() || "").includes(searchLower) ||
      (record.shipperName?.toLowerCase() || "").includes(searchLower) ||
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
  // Since we are doing server side pagination but client side filtering (mixed approach for now due to API limitations), 
  // we might have issues. But assuming the API returns the page we asked for, we display that.
  // However, the existing code was doing client side pagination on mockData.
  // If we want to keep client side filtering working perfectly, we'd need to fetch ALL data or implement search on backend.
  // For now, let's assume we display what we get from backend, and filter ONLY that page (which is suboptimal but safe) 
  // OR we rely on backend pagination and remove client side slicing.

  // Let's use the data from backend directly as "currentRecords" if we assume backend handles pagination.
  // But wait, the previous code sliced `filteredData`.
  // If we want to support search, we really should do it on backend. 
  // Given the constraints, I will use the fetched data as the source.

  const currentRecords = filteredData; // We display what we have after filtering locally.

  const handleExportCSV = () => {
    try {
      const formattedData = formatImportDataForExport(filteredData);
      exportToCSV({
        filename: "import_data",
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
      await importService.deleteImport(record.id);
      toast({
        title: "Record Deleted",
        description: `Import record ${record.jobNo} has been deleted.`,
      });
      // Refresh data
      const response = await importService.getImports(currentPage, recordsPerPage);
      const mappedData = response.data.map(item => ({
        id: item.id,
        jobNo: item.job_no,
        shipperName: item.shipper_name,
        invoiceNo: item.invoice_no_dt,
        fcValue: item.fc_value,
        description: item.description,
        forwarder: item.forwarder_name,
        hblNo: item.hbl_no_dt,
        mblNo: item.mbl_no_dt,
        shippingLine: item.s_line,
        pol: item.pol,
        pod: item.pod,
        terms: item.terms,
        containerNos: item.container_nos,
        containerSize: item.size,
        nnCopyReceived: item.nn_copy_rcvd,
        originalDocsReceived: item.original_docs_rcvd,
        etaDate: item.eta_date,
        remarks: item.remarks,
        status: "Pending",
        arrivalStatus: "Pending",
        roDate: null,
        doStatus: null,
        beNo: null,
        beDate: null,
        assessmentDate: null,
        hsCode: null,
        assessedValue: null,
        dutyPaid: null,
        oocDate: null,
        destuffedDate: null
      }));
      setData(mappedData);
      setTotalRecords(response.total);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete import record",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-success/10 text-success hover:bg-success/20";
      case "In Transit":
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Import Data</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your import shipment records</p>
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
                placeholder="Search by Job No, Shipper, Invoice..."
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Job No</TableHead>
                  <TableHead className="font-semibold">Shipper Name</TableHead>
                  <TableHead className="font-semibold">Invoice No & Date</TableHead>
                  <TableHead className="font-semibold">FC Value</TableHead>
                  <TableHead className="font-semibold">Forwarder</TableHead>
                  <TableHead className="font-semibold">HBL No & Date</TableHead>
                  <TableHead className="font-semibold">MBL No & Date</TableHead>
                  <TableHead className="font-semibold">Shipping Line</TableHead>
                  <TableHead className="font-semibold">POL</TableHead>
                  <TableHead className="font-semibold">Container Size</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{record.jobNo}</TableCell>
                    <TableCell>{record.shipperName}</TableCell>
                    <TableCell>{record.invoiceNo}</TableCell>
                    <TableCell>${record.fcValue}</TableCell>
                    <TableCell>{record.forwarder}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{record.forwarder}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{record.containerSize}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(record)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

      <ImportForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRecord(null);
        }}
        initialData={selectedRecord ? {
          jobNo: selectedRecord.jobNo,
          shipperName: selectedRecord.shipperName,
          invoiceNoDate: selectedRecord.invoiceNo,
          fcValue: selectedRecord.fcValue,
          description: selectedRecord.description,
          forwarderName: selectedRecord.forwarder,
          hblNoDate: selectedRecord.hblNo,
          mblNoDate: selectedRecord.mblNo,
          shippingLine: selectedRecord.shippingLine,
          pol: selectedRecord.pol,
          terms: selectedRecord.terms,
          containerNos: selectedRecord.containerNos,
          size: selectedRecord.containerSize,
          nnCopyReceived: selectedRecord.nnCopyReceived,
          originalDocsReceived: selectedRecord.originalDocsReceived,
          arrivalStatus: selectedRecord.arrivalStatus,
          roDate: selectedRecord.roDate ? new Date(selectedRecord.roDate) : undefined,
          doStatus: selectedRecord.doStatus,
          beNo: selectedRecord.beNo,
          beDate: selectedRecord.beDate ? new Date(selectedRecord.beDate) : undefined,
          assessmentDate: selectedRecord.assessmentDate ? new Date(selectedRecord.assessmentDate) : undefined,
          hsCode: selectedRecord.hsCode,
          assessedValue: selectedRecord.assessedValue,
          dutyPaid: selectedRecord.dutyPaid,
          oocDate: selectedRecord.oocDate ? new Date(selectedRecord.oocDate) : undefined,
          destuffedDate: selectedRecord.destuffedDate ? new Date(selectedRecord.destuffedDate) : undefined,
          remarks: selectedRecord.remarks,
        } : undefined}
        onSubmit={async (data) => {
          try {
            const payload = {
              job_no: data.jobNo,
              shipper_name: data.shipperName,
              invoice_no_dt: data.invoiceNoDate,
              fc_value: parseFloat(data.fcValue) || 0,
              description: data.description,
              forwarder_name: data.forwarderName,
              hbl_no_dt: data.hblNoDate,
              mbl_no_dt: data.mblNoDate,
              s_line: data.shippingLine,
              pol: data.pol,
              pod: "Chennai", // Default or add to form if needed
              terms: data.terms,
              container_nos: data.containerNos,
              size: data.size,
              nn_copy_rcvd: data.nnCopyReceived,
              original_docs_rcvd: data.originalDocsReceived,
              eta_date: new Date().toISOString(), // Placeholder or add to form
              remarks: data.remarks,
              // Add other fields as needed by backend
            };

            if (selectedRecord) {
              await importService.updateImport(selectedRecord.id, payload);
              toast({
                title: "Success",
                description: "Import record updated successfully",
              });
            } else {
              await importService.createImport(payload);
              toast({
                title: "Success",
                description: "Import record added successfully",
              });
            }

            // Refresh data
            const response = await importService.getImports(currentPage, recordsPerPage);
            const mappedData = response.data.map(item => ({
              id: item.id,
              jobNo: item.job_no,
              shipperName: item.shipper_name,
              invoiceNo: item.invoice_no_dt,
              fcValue: item.fc_value,
              description: item.description,
              forwarder: item.forwarder_name,
              hblNo: item.hbl_no_dt,
              mblNo: item.mbl_no_dt,
              shippingLine: item.s_line,
              pol: item.pol,
              pod: item.pod,
              terms: item.terms,
              containerNos: item.container_nos,
              containerSize: item.size,
              nnCopyReceived: item.nn_copy_rcvd,
              originalDocsReceived: item.original_docs_rcvd,
              etaDate: item.eta_date,
              remarks: item.remarks,
              status: "Pending",
              arrivalStatus: "Pending",
              roDate: null,
              doStatus: null,
              beNo: null,
              beDate: null,
              assessmentDate: null,
              hsCode: null,
              assessedValue: null,
              dutyPaid: null,
              oocDate: null,
              destuffedDate: null
            }));
            setData(mappedData);
            setTotalRecords(response.total);

            setIsFormOpen(false);
            setSelectedRecord(null);
          } catch (error) {
            console.error("Operation failed:", error);
            toast({
              title: "Error",
              description: "Failed to save import record",
              variant: "destructive",
            });
          }
        }}
      />

      <ImportDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        record={selectedRecord}
        onEdit={() => handleEdit(selectedRecord!)}
        onDelete={() => handleDelete(selectedRecord!)}
      />

      <ExcelUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        type="import"
        onUpload={async (file) => {
          await importService.uploadImport(file);
        }}
        onUploadComplete={async () => {
          // Refresh data
          const response = await importService.getImports(currentPage, recordsPerPage);
          const mappedData = response.data.map(item => ({
            id: item.id,
            jobNo: item.job_no,
            shipperName: item.shipper_name,
            invoiceNo: item.invoice_no_dt,
            fcValue: item.fc_value,
            description: item.description,
            forwarder: item.forwarder_name,
            hblNo: item.hbl_no_dt,
            mblNo: item.mbl_no_dt,
            shippingLine: item.s_line,
            pol: item.pol,
            pod: item.pod,
            terms: item.terms,
            containerNos: item.container_nos,
            containerSize: item.size,
            nnCopyReceived: item.nn_copy_rcvd,
            originalDocsReceived: item.original_docs_rcvd,
            etaDate: item.eta_date,
            remarks: item.remarks,
            status: "Pending",
            arrivalStatus: "Pending",
            roDate: null,
            doStatus: null,
            beNo: null,
            beDate: null,
            assessmentDate: null,
            hsCode: null,
            assessedValue: null,
            dutyPaid: null,
            oocDate: null,
            destuffedDate: null
          }));
          setData(mappedData);
          setTotalRecords(response.total);
        }}
      />
    </div>
  );
};

export default Import;
