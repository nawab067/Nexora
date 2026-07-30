"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PdfSuccessDialog from "@/components/pdfSuccess";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  ArrowLeft,
  Download,
  Save,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Loader2,
  Landmark,
  Hash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function money(n: number) {
  return n.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ── Pakistan banks + mobile wallets, for the "Account name" dropdown ──
const PK_ACCOUNTS = [
  "HBL - Habib Bank Limited",
  "UBL - United Bank Limited",
  "MCB Bank",
  "Allied Bank",
  "Bank Alfalah",
  "Meezan Bank",
  "National Bank of Pakistan",
  "Askari Bank",
  "Bank Al Habib",
  "Faysal Bank",
  "Standard Chartered Pakistan",
  "JS Bank",
  "Soneri Bank",
  "The Bank of Punjab",
  "Bank of Khyber",
  "Silk Bank",
  "Summit Bank",
  "Habib Metropolitan Bank",
  "Dubai Islamic Bank Pakistan",
  "Al Baraka Bank Pakistan",
  "First Women Bank",
  "JazzCash",
  "Easypaisa",
  "NayaPay",
  "SadaPay",
  "UPaisa",
];

// ── Status options for the invoice lifecycle ──
const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  draft:
    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  sent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function Stepper({ step }: { step: "form" | "preview" }) {
  const steps = [
    { key: "form", label: "Details" },
    { key: "preview", label: "Preview" },
  ];
  return (
    <div className="flex items-center gap-2 shrink-0">
      {steps.map((s, i) => {
        const active = s.key === step;
        const done = step === "preview" && s.key === "form";
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : done
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-4 sm:w-6 h-px bg-border shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

export default function InvoiceGeneratorView({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [step, setStep] = useState<"form" | "preview">("form");
  const [userid, setUserid] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [fetching, setFetching] = useState(isEdit);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState<{
    open: boolean;
    invoiceNo?: string;
    pdfUrl?: string;
  }>({ open: false });

  const [invoice, setInvoice] = useState({
    customer_name: "",
    lead_name: "",
    price: "",
    discount: "",
    Accountnumber: "",
    AccountName: "",
    status: "draft",
  });

  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  // ── Resolve current user — needed for the customer/lead dropdowns to load ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${baseurl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserid(res.data.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleGeneratePDF = async () => {
    if (!generatedInvoice?._id) {
      alert("Generate the invoice first.");
      return;
    }

    try {
      setGeneratingPDF(true);
      const res = await axios.get(
        `${baseurl}/invoice/pdf/${generatedInvoice._id}`,
      );

      // Update local state with the returned URL
      setGeneratedInvoice((prev: any) => ({
        ...prev,
        pdf_url: res.data.pdf_url,
      }));

      setPdfSuccess({
        open: true,
        invoiceNo: generatedInvoice.invoice_no,
        pdfUrl: res.data.pdf_url,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const fetchInvoice = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${baseurl}/get-invoice/${id}`);
      const invoiceData = res.data.invoice;

      setGeneratedInvoice(invoiceData);

      setInvoice({
        customer_name: invoiceData.customer_name,
        lead_name: invoiceData.lead_name,
        price: String(invoiceData.price),
        discount: String(invoiceData.discount),
        AccountName: invoiceData.AccountName ?? "",
        Accountnumber: invoiceData.Accountnumber ?? "",
        status: invoiceData.status ?? "draft",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    if (customers.length === 0 || leads.length === 0) return;

    fetchInvoice();
  }, [id, customers, leads]);

  useEffect(() => {
    if (!userid) return;
    const getCustomers = async () => {
      try {
        const res = await axios.get(
          `${baseurl}/get-all-customername/${userid}`,
        );
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        setCustomers(data);
      } catch (err) {
        console.error(err);
        setCustomers([]);
      }
    };
    getCustomers();
  }, [userid]);

  useEffect(() => {
    if (!userid) return;
    const getLeads = async () => {
      try {
        const res = await axios.get(`${baseurl}/get-all-leadname/${userid}`);
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        setLeads(data);
      } catch (err) {
        console.error(err);
        setLeads([]);
      }
    };
    getLeads();
  }, [userid]);

  // ── Generate (create) or Update (edit) ──
  // NOTE on schema: /get-ai-invoice only accepts AIInvoiceRequest
  // (userid, customer_name, lead_name, price, discount) — it has no
  // AccountName / Accountnumber / status fields. Sending them there
  // gets ignored/rejected, so on create we (1) create with the base
  // fields only, then (2) immediately PATCH the new invoice with the
  // account + status fields, which the full InvoiceModel does support.
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const token = sessionStorage.getItem("token");
      const me = await axios.get(`${baseurl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const extras = {
        AccountName: invoice.AccountName,
        Accountnumber: invoice.Accountnumber,
        status: invoice.status,
      };

      let invoiceId = id;
      let res;

      if (isEdit) {
        // Update endpoint accepts the full InvoiceModel shape, so send everything together.
        await axios.patch(`${baseurl}/update-invoice/${id}`, {
          customer_name: invoice.customer_name,
          lead_name: invoice.lead_name,
          price: Number(invoice.price),
          discount: Number(invoice.discount || 0),
          ...extras,
        });
      } else {
        const create = await axios.post(`${baseurl}/get-ai-invoice`, {
          userid: me.data.id,
          customer_name: invoice.customer_name,
          lead_name: invoice.lead_name,
          price: Number(invoice.price),
          discount: Number(invoice.discount || 0),
          status: invoice.status,
          AccountName: invoice.AccountName,
          Accountnumber: invoice.Accountnumber,
        });

        console.log(create.data);

        invoiceId = create.data.invoice_id;

        // Follow-up PATCH to attach the account/status fields the create endpoint can't accept.
        await axios.patch(`${baseurl}/update-invoice/${invoiceId}`, extras);
      }

      res = await axios.get(`${baseurl}/get-invoice/${invoiceId}`);

      setGeneratedInvoice(res.data.invoice);

      setStep("preview");
    } catch (err: any) {
      console.log(err);

      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);
        console.log(err.response?.status);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);

      router.push("/admin/invoice");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Backend already computes and returns everything below — no client-side math needed.
  const price = Number(generatedInvoice?.price ?? invoice.price ?? 0);
  const discount = Number(generatedInvoice?.discount ?? invoice.discount ?? 0);
  const taxPercentage = Number(generatedInvoice?.tax_percentage ?? 0);
  const taxAmount = Number(generatedInvoice?.tax_amount ?? 0);
  const total = Number(generatedInvoice?.grand_total ?? 0);
  const discountAmount = (price * discount) / 100;

  const customerName = generatedInvoice?.customer_name ?? invoice.customer_name;
  const leadName = generatedInvoice?.lead_name ?? invoice.lead_name;
  const accountNumber =
    generatedInvoice?.Accountnumber ?? invoice.Accountnumber;
  const accountName = generatedInvoice?.AccountName ?? invoice.AccountName;
  const status = generatedInvoice?.status ?? invoice.status ?? "draft";
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;

  if (fetching) {
    return (
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-10 max-w-2xl w-full mx-auto space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background min-h-[calc(100vh-3.5rem)]">
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 shrink-0 max-w-2xl w-full mx-auto">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase mb-1">
            {isEdit ? "Edit Invoice" : "New Invoice"}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            AI Invoice Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pick a customer and lead — the draft is assembled for you.
          </p>
        </div>
        <Stepper step={step} />
      </div>

      <div className="px-4 sm:px-6 pb-10 max-w-2xl w-full mx-auto">
        {step === "form" ? (
          <Card className="bg-card border border-border shadow-sm rounded-xl">
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Customer <span className="text-rose-600">*</span>
                </Label>
                <Select
                  value={invoice.customer_name}
                  onValueChange={(value) =>
                    setInvoice((prev) => ({ ...prev, customer_name: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(customers) &&
                      customers.map((c) => (
                        <SelectItem key={c._id} value={c.customer_name}>
                          {c.customer_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Lead <span className="text-rose-600">*</span>
                </Label>
                <Select
                  value={invoice.lead_name}
                  onValueChange={(value) =>
                    setInvoice((prev) => ({ ...prev, lead_name: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(leads) &&
                      leads.map((l) => (
                        <SelectItem key={l._id} value={l.lead_name}>
                          {l.lead_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Price <span className="text-rose-600">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      Rs
                    </span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      className="pl-8"
                      value={invoice.price}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Discount
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      className="pr-8"
                      value={invoice.discount}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Account Name <span className="text-rose-600">*</span>
                  </Label>
                  <Select
                    value={invoice.AccountName}
                    onValueChange={(value) =>
                      setInvoice((prev) => ({ ...prev, AccountName: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <Landmark className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Select bank / wallet" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {PK_ACCOUNTS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Account Number
                  </Label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      inputMode="numeric"
                      placeholder="e.g. 03001234567"
                      className="pl-8"
                      value={invoice.Accountnumber}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          Accountnumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Status
                </Label>
                <Select
                  value={invoice.status}
                  onValueChange={(value) =>
                    setInvoice((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-1/2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              s.value === "draft" && "bg-slate-400",
                              s.value === "sent" && "bg-indigo-500",
                              s.value === "pending" && "bg-amber-500",
                              s.value === "paid" && "bg-emerald-500",
                            )}
                          />
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full h-11 text-sm gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEdit ? "Updating…" : "Generating…"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isEdit ? "Update Invoice" : "Generate Invoice"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2.5">
                  AI pulls customer &amp; lead details automatically — nothing
                  is sent until you approve it.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit details
            </button>

            <Card className="bg-card border border-border shadow-sm rounded-xl">
              <CardContent className="p-4 sm:p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Invoice number
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {generatedInvoice?.invoice_no ?? "—"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize shrink-0",
                      STATUS_STYLES[status] ?? STATUS_STYLES.draft,
                    )}
                  >
                    {statusLabel}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-semibold shrink-0">
                    {getInitials(customerName || "?")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {customerName}
                    </p>
                    {generatedInvoice?.customer_email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {generatedInvoice.customer_email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {generatedInvoice?.customer_phone && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3 shrink-0" />
                      {generatedInvoice.customer_phone}
                    </span>
                  )}
                  {generatedInvoice?.customer_address && (
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {generatedInvoice.customer_address}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  {leadName}
                </div>

                {generatedInvoice?.title && (
                  <p className="text-sm font-medium text-foreground border-t border-border pt-3">
                    {generatedInvoice.title}
                  </p>
                )}

                <Separator />

                {(accountName || accountNumber) && (
                  <>
                    <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Payment account
                      </p>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Landmark className="w-3.5 h-3.5 shrink-0" />
                          Account name
                        </span>
                        <span className="text-foreground font-medium text-right truncate">
                          {accountName || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Hash className="w-3.5 h-3.5 shrink-0" />
                          Account number
                        </span>
                        <span className="text-foreground font-medium text-right truncate">
                          {accountNumber || "—"}
                        </span>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Price</span>
                    <span className="text-foreground">Rs {money(price)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Discount ({discount}%)
                    </span>
                    <span className="text-rose-600">
                      -Rs {money(discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Tax ({taxPercentage}%)
                    </span>
                    <span className="text-foreground">
                      Rs {money(taxAmount)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-3 font-semibold">
                    <span className="text-foreground">Grand total</span>
                    <span className="text-foreground">Rs {money(total)}</span>
                  </div>
                </div>

                {generatedInvoice?.payment_terms && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    {generatedInvoice.payment_terms}
                  </p>
                )}

                {generatedInvoice?.notes && (
                  <p className="text-xs text-muted-foreground">
                    {generatedInvoice.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex-1 h-10 gap-2 rounded-lg"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Draft
              </Button>
              <Button
                className="flex-1 h-10 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
              >
                {generatingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {generatingPDF ? "Generating…" : "Generate PDF"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <PdfSuccessDialog
        open={pdfSuccess.open}
        onOpenChange={(open) => {
          setPdfSuccess((prev) => ({ ...prev, open }));
          if (!open) {
            router.push("/admin/invoice");
          }
        }}
        invoiceNo={pdfSuccess.invoiceNo}
        pdfUrl={pdfSuccess.pdfUrl}
      />
    </div>
  );
}
