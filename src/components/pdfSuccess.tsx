"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download } from "lucide-react";

interface PdfSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNo?: string;
  pdfUrl?: string;
}

export default function PdfSuccessDialog({
  open,
  onOpenChange,
  invoiceNo,
  pdfUrl,
}: PdfSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-border rounded-2xl gap-0">
        <VisuallyHidden>
          <DialogTitle>PDF Generated</DialogTitle>
          <DialogDescription>
            The invoice PDF was generated successfully.
          </DialogDescription>
        </VisuallyHidden>

        <div className="flex flex-col items-center text-center px-6 pt-9 pb-6">
          <div className="relative w-16 h-16 mb-4">
            <span className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2
                className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-foreground tracking-tight">
            PDF Generated
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {invoiceNo
              ? `Invoice ${invoiceNo} has been generated successfully.`
              : "Your invoice has been generated successfully."}
          </p>
        </div>

        <div className="flex items-center gap-2 px-6 pb-6">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-lg text-sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {pdfUrl && (
            <Button
              className="flex-1 h-10 rounded-lg gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={() => window.open(pdfUrl, "_blank")}
            >
              <Download className="w-4 h-4" />
              View PDF
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}