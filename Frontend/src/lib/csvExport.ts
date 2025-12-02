import Papa from "papaparse";

interface ExportOptions {
  filename: string;
  data: any[];
  columns?: string[];
}

export function exportToCSV({ filename, data, columns }: ExportOptions) {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  // If columns are specified, filter the data to only include those columns
  const filteredData = columns
    ? data.map((row) => {
        const filteredRow: any = {};
        columns.forEach((col) => {
          filteredRow[col] = row[col];
        });
        return filteredRow;
      })
    : data;

  // Convert to CSV
  const csv = Papa.unparse(filteredData);

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatImportDataForExport(records: any[]) {
  return records.map((record) => ({
    "Job No": record.jobNo || "",
    "Shipper Name": record.shipperName || "",
    "Invoice No & Date": record.invoiceNo || "",
    "FC Value": record.fcValue || "",
    "Description": record.description || "",
    "Forwarder Name": record.forwarder || "",
    "HBL No & Date": record.hblNo || "",
    "MBL No & Date": record.mblNo || "",
    "Shipping Line": record.shippingLine || "",
    "POL - Port of Loading": record.pol || "",
    "Terms": record.terms || "",
    "Container Nos": record.containerNos || "",
    "Size": record.containerSize || "",
    "N.N Copy Received": record.nnCopyReceived ? "Yes" : "No",
    "Original Docs Received": record.originalDocsReceived ? "Yes" : "No",
    "Arrival Status": record.arrivalStatus || "",
    "R/O Date": record.roDate || "",
    "DO Status": record.doStatus || "",
    "BE No": record.beNo || "",
    "BE Date": record.beDate || "",
    "Assessment Date": record.assessmentDate || "",
    "HS Code": record.hsCode || "",
    "Assessed Value": record.assessedValue || "",
    "Duty Paid": record.dutyPaid || "",
    "OOC Date": record.oocDate || "",
    "Destuffed Date": record.destuffedDate || "",
    "Remarks": record.remarks || "",
  }));
}

export function formatExportDataForExport(records: any[]) {
  return records.map((record) => ({
    "Job No": record.jobNo || "",
    "Invoice No": record.invoiceNo || "",
    "Invoice Date": record.invoiceDate || "",
    "S/Bill No - Shipping Bill No": record.sBillNo || "",
    "S/Bill Date": record.sBillDate || "",
    "LEO Date": record.leoDate || "",
    "Forwarder Name": record.forwarder || "",
    "Booking No": record.bookingNo || "",
    "Container No": record.containerNo || "",
    "Size": record.containerSize || "",
    "Shipping Line": record.shippingLine || "",
    "POD - Port of Discharge": record.pod || "",
    "Train No": record.trainNo || "",
    "Wagon No": record.wagonNo || "",
    "Reward": record.reward || "",
    "Invoice Value (FC)": record.invoiceValue || "",
    "FOB Value (INR)": record.fobValue || "",
    "DBK Amount (INR)": record.dbkAmount || "",
    "IGST Amount (INR)": record.igstAmount || "",
    "EGM No": record.egmNo || "",
    "EGM Date": record.egmDate || "",
    "DBK Scroll No": record.dbkScrollNo || "",
    "Scroll Date": record.scrollDate || "",
    "Remarks": record.remarks || "",
  }));
}
