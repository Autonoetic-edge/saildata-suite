import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ImportFilters {
  jobNo?: string;
  invoiceNo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  forwarder?: string;
  containerSize?: string;
  status?: string;
}

interface AdvancedFiltersProps {
  onApply: (filters: ImportFilters) => void;
  onReset: () => void;
}

const AdvancedFilters = ({ onApply, onReset }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<ImportFilters>({});

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Advanced Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Job No */}
        <div className="space-y-2">
          <Label htmlFor="jobNo">Job No</Label>
          <Input
            id="jobNo"
            placeholder="e.g., IMP-2024-001"
            value={filters.jobNo || ""}
            onChange={(e) => setFilters({ ...filters, jobNo: e.target.value })}
          />
        </div>

        {/* Invoice No */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNo">Invoice No</Label>
          <Input
            id="invoiceNo"
            placeholder="e.g., INV-001"
            value={filters.invoiceNo || ""}
            onChange={(e) => setFilters({ ...filters, invoiceNo: e.target.value })}
          />
        </div>

        {/* Forwarder */}
        <div className="space-y-2">
          <Label htmlFor="forwarder">Forwarder</Label>
          <Select
            value={filters.forwarder}
            onValueChange={(value) => setFilters({ ...filters, forwarder: value })}
          >
            <SelectTrigger id="forwarder">
              <SelectValue placeholder="Select forwarder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DHL">DHL</SelectItem>
              <SelectItem value="FedEx">FedEx</SelectItem>
              <SelectItem value="Maersk">Maersk</SelectItem>
              <SelectItem value="CMA CGM">CMA CGM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Container Size */}
        <div className="space-y-2">
          <Label htmlFor="containerSize">Container Size</Label>
          <Select
            value={filters.containerSize}
            onValueChange={(value) => setFilters({ ...filters, containerSize: value })}
          >
            <SelectTrigger id="containerSize">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20'">20'</SelectItem>
              <SelectItem value="40'">40'</SelectItem>
              <SelectItem value="40'HC">40'HC</SelectItem>
              <SelectItem value="45'">45'</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </div>
  );
};

export default AdvancedFilters;
