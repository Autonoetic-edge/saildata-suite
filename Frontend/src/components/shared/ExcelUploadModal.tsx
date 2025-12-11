import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X } from "lucide-react";

interface ExcelUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "import" | "export";
  onUploadComplete: (records: any[]) => void;
  onUpload?: (file: File) => Promise<void>;
}

type UploadState = "idle" | "validating" | "processing" | "success" | "error";

export function ExcelUploadModal({ open, onOpenChange, type, onUploadComplete, onUpload }: ExcelUploadModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [recordCount, setRecordCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);

  const resetState = () => {
    setUploadState("idle");
    setFileName("");
    setFileSize("");
    setProgress(0);
    setRecordCount(0);
    setErrorMessage("");
    setPreviewData([]);
  };

  const validateHeaders = (headers: string[], expectedHeaders: string[]): boolean => {
    // Strict normalization: remove ALL non-alphanumeric characters to handle wrapped text and spacing issues
    // e.g. "Forward\ner Name" -> "forwardername", "S/Bill No." -> "sbillno"
    const normalize = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedHeaders = headers.map(normalize);
    const normalizedExpected = expectedHeaders.map(normalize);

    // Check that at least 70% of expected headers are present
    let matchCount = 0;
    for (const expected of normalizedExpected) {
      if (expected === '' || expected === 'date') continue;

      // Check for substring match (e.g. "fobvalueinr" includes "fobvalue")
      if (normalizedHeaders.some(h => h.includes(expected) || expected.includes(h))) {
        matchCount++;
      }
    }

    // Require at least 50% of unique headers to match
    const uniqueExpected = normalizedExpected.filter(h => h !== '' && h !== 'date');
    return matchCount >= uniqueExpected.length * 0.5;
  };

  const getExpectedHeaders = () => {
    if (type === "import") {
      return [
        "job no",
        "", "shipper name", "invoice no & date", "fc value", "description",
        "forwarder name", "hbl no & date", "mbl no & date", "shipping line",
        "pol - port of loading", "terms", "container nos", "size",
        "n.n copy received", "original docs received", "arrival status",
        "r/o date", "do status", "be no", "be date", "assessment date",
        "hs code", "assessed value", "duty paid", "ooc date", "destuffed date", "remarks"
      ];
    } else {
      // Export headers - key headers for validation
      // We check for key identifying headers rather than all
      return [
        "s/no",
        "job.no",
        "inv.no.",
        "s/bill no.",
        "leo date",
        "forwarder name",
        "booking no.",
        "contr.no.",
        "size",
        "s/line",
        "pod",
        "train no.",
        "wagon no.",
        "reward",
        "inv.value (fc)",
        "fob value",
        "dbk",
        "igst",
        "egm no.",
        "current",
        "dbk scroll",
        "scroll dt.",
        "remarks"
      ];
    }
  };

  const processFile = async (file: File) => {
    setUploadState("validating");
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(2)} KB`);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length === 0) {
        throw new Error("Excel file is empty");
      }

      const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
      const expectedHeaders = getExpectedHeaders();

      if (!validateHeaders(headers, expectedHeaders)) {
        throw new Error(`Invalid headers. Please use the template file.`);
      }

      const records = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""));

      if (records.length === 0) {
        throw new Error("No data rows found in the Excel file");
      }

      setRecordCount(records.length);
      setPreviewData(records.slice(0, 5));
      setUploadState("validating");

      // Wait a bit for validation visual
      setTimeout(async () => {
        setUploadState("processing");
        if (onUpload) {
          try {
            await onUpload(file);
            setUploadState("success");
            toast({
              title: "Upload Successful",
              description: `${records.length} records have been imported successfully.`,
            });
            setTimeout(() => {
              onUploadComplete(records); // Still call this to refresh parent? Or maybe parent refreshes on its own?
              onOpenChange(false);
              resetState();
            }, 2000);
          } catch (error: any) {
            setUploadState("error");
            setErrorMessage(error.message || "Failed to upload file");
            toast({
              title: "Upload Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          simulateUpload(records);
        }
      }, 1000);

    } catch (error: any) {
      setUploadState("error");
      setErrorMessage(error.message || "Failed to process file");
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const simulateUpload = (records: any[]) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadState("success");
        toast({
          title: "Upload Successful",
          description: `${records.length} records have been imported successfully.`,
        });
        setTimeout(() => {
          onUploadComplete(records);
          onOpenChange(false);
          resetState();
        }, 2000);
      }
    }, 200);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: uploadState !== "idle"
  });

  const downloadTemplate = () => {
    const headers = getExpectedHeaders();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === "import" ? "Import Data" : "Export Data");
    XLSX.writeFile(wb, `${type}_template.xlsx`);

    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload {type === "import" ? "Import" : "Export"} Data
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx) to import multiple records at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {uploadState === "idle" && (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border hover:border-primary hover:bg-accent/50"
                  }`}
              >
                <input {...getInputProps()} />
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-foreground font-medium mb-2">
                      Drag & drop your Excel file here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <p className="text-xs text-muted-foreground">.xlsx files only</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </>
          )}

          {uploadState === "validating" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{fileSize}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetState}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Validating headers...</span>
                  <CheckCircle className="h-5 w-5 text-success animate-pulse" />
                </div>
                <p className="text-sm text-foreground">
                  Found <span className="font-semibold">{recordCount}</span> records
                </p>
              </div>

              {previewData.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Preview (first 5 rows):</p>
                  <div className="bg-muted p-3 rounded-md text-xs max-h-32 overflow-auto">
                    {previewData.map((row, idx) => (
                      <div key={idx} className="text-muted-foreground">
                        Row {idx + 1}: {row.slice(0, 3).join(" | ")}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadState === "processing" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted-foreground">{fileSize}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Uploading {recordCount} records...
                  </span>
                  <span className="text-sm font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )}

          {uploadState === "success" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="h-10 w-10 text-success" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Upload Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    {recordCount} records imported successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadState === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Upload Failed</p>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
              </div>

              <Button onClick={resetState} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
