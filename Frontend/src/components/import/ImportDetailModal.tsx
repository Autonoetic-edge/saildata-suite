import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, X, Package, FileText, Ship, Calendar, DollarSign, CheckCircle2, XCircle } from "lucide-react";

interface ImportDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DetailSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {title}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
      {children}
    </div>
  </div>
);

const DetailField = ({ label, value }: { label: string; value?: string | number | boolean | null }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">
      {value === true ? (
        <Badge variant="outline" className="bg-success/10 text-success">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Yes
        </Badge>
      ) : value === false ? (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" />
          No
        </Badge>
      ) : value || <span className="text-muted-foreground">-</span>}
    </p>
  </div>
);

export function ImportDetailModal({ open, onOpenChange, record, onEdit, onDelete }: ImportDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Import Record Details</DialogTitle>
              <DialogDescription>
                Job No: <span className="font-semibold text-foreground">{record.jobNo}</span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <DetailSection title="Basic Information" icon={FileText}>
            <DetailField label="Job No" value={record.jobNo} />
            <DetailField label="Shipper Name" value={record.shipperName} />
            <DetailField label="Invoice No & Date" value={record.invoiceNo} />
            <DetailField label="FC Value" value={record.fcValue ? `$${record.fcValue}` : undefined} />
            <DetailField label="Description" value={record.description} />
            <DetailField label="Forwarder Name" value={record.forwarder} />
          </DetailSection>

          <Separator />

          {/* Shipping Details */}
          <DetailSection title="Shipping Details" icon={Ship}>
            <DetailField label="HBL No & Date" value={record.hblNo} />
            <DetailField label="MBL No & Date" value={record.mblNo} />
            <DetailField label="Shipping Line" value={record.shippingLine || record.forwarder} />
            <DetailField label="POL - Port of Loading" value={record.pol} />
            <DetailField label="Terms" value={record.terms} />
            <DetailField label="Arrival Status" value={record.arrivalStatus || record.status} />
          </DetailSection>

          <Separator />

          {/* Container Information */}
          <DetailSection title="Container Information" icon={Package}>
            <DetailField label="Container Nos" value={record.containerNos} />
            <DetailField label="Size" value={record.containerSize} />
            <DetailField label="N.N Copy Received" value={record.nnCopyReceived} />
            <DetailField label="Original Docs Received" value={record.originalDocsReceived} />
          </DetailSection>

          <Separator />

          {/* Documentation & Customs */}
          <DetailSection title="Documentation & Customs" icon={FileText}>
            <DetailField label="R/O Date" value={record.roDate} />
            <DetailField label="DO Status" value={record.doStatus} />
            <DetailField label="BE No" value={record.beNo} />
            <DetailField label="BE Date" value={record.beDate} />
            <DetailField label="Assessment Date" value={record.assessmentDate} />
            <DetailField label="HS Code" value={record.hsCode} />
          </DetailSection>

          <Separator />

          {/* Financial Details */}
          <DetailSection title="Financial Details" icon={DollarSign}>
            <DetailField label="Assessed Value" value={record.assessedValue ? `$${record.assessedValue}` : undefined} />
            <DetailField label="Duty Paid" value={record.dutyPaid ? `$${record.dutyPaid}` : undefined} />
          </DetailSection>

          <Separator />

          {/* Dates & Completion */}
          <DetailSection title="Dates & Completion" icon={Calendar}>
            <DetailField label="OOC Date" value={record.oocDate} />
            <DetailField label="Destuffed Date" value={record.destuffedDate} />
          </DetailSection>

          {record.remarks && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Remarks</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{record.remarks}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
