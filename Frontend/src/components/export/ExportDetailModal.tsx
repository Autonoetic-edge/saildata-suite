import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Package, FileText, Ship, Calendar, DollarSign, Train } from "lucide-react";

interface ExportDetailModalProps {
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

const DetailField = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">{value || <span className="text-muted-foreground">-</span>}</p>
  </div>
);

export function ExportDetailModal({ open, onOpenChange, record, onEdit, onDelete }: ExportDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Export Record Details</DialogTitle>
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
            <DetailField label="Invoice No" value={record.invoiceNo} />
            <DetailField label="Invoice Date" value={record.invoiceDate} />
            <DetailField label="Forwarder Name" value={record.forwarder} />
          </DetailSection>

          <Separator />

          {/* Shipping Bill & Dates */}
          <DetailSection title="Shipping Bill & Dates" icon={Calendar}>
            <DetailField label="S/Bill No - Shipping Bill No" value={record.sBillNo} />
            <DetailField label="S/Bill Date" value={record.sBillDate} />
            <DetailField label="LEO Date" value={record.leoDate} />
          </DetailSection>

          <Separator />

          {/* Booking & Container */}
          <DetailSection title="Booking & Container" icon={Package}>
            <DetailField label="Booking No" value={record.bookingNo} />
            <DetailField label="Container No" value={record.containerNo} />
            <DetailField label="Size" value={record.containerSize} />
            <DetailField label="Shipping Line" value={record.shippingLine || record.forwarder} />
            <DetailField label="POD - Port of Discharge" value={record.pod} />
          </DetailSection>

          <Separator />

          {/* Transport Details */}
          <DetailSection title="Transport Details" icon={Train}>
            <DetailField label="Train No" value={record.trainNo} />
            <DetailField label="Wagon No" value={record.wagonNo} />
            <DetailField label="Reward" value={record.reward} />
          </DetailSection>

          <Separator />

          {/* Financial Details */}
          <DetailSection title="Financial Details" icon={DollarSign}>
            <DetailField label="Invoice Value (FC)" value={record.invoiceValue ? `$${record.invoiceValue}` : undefined} />
            <DetailField label="FOB Value (INR)" value={record.fobValue ? `₹${record.fobValue}` : undefined} />
            <DetailField label="DBK Amount (INR)" value={record.dbkAmount ? `₹${record.dbkAmount}` : undefined} />
            <DetailField label="IGST Amount (INR)" value={record.igstAmount ? `₹${record.igstAmount}` : undefined} />
          </DetailSection>

          <Separator />

          {/* EGM & DBK Details */}
          <DetailSection title="EGM & DBK Details" icon={FileText}>
            <DetailField label="EGM No" value={record.egmNo} />
            <DetailField label="EGM Date" value={record.egmDate} />
            <DetailField label="DBK Scroll No" value={record.dbkScrollNo} />
            <DetailField label="Scroll Date" value={record.scrollDate} />
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
