'use client';

import { useState, useEffect } from "react";
import InvoiceListView, { InvoiceRow } from "@/components/invoiceview";
import axios from "axios";
import { useRouter } from "next/navigation";
import InvoicePreviewView, {
  InvoiceDetail,
} from "@/components/invoicepreview";

import InvoiceEmailDialog, {
  InvoiceEmailDialogState,
} from "@/components/invoiceemaildialogue";

interface InvoicePdf {
  customerid: string;
  name: string;
  email?: string | null;
}

const DEFAULT_EMAIL_STATE: InvoiceEmailDialogState = {
  open: false,
  loading: false,
  sending: false,
  sent: false,
  error: null,
  _id: "",
  recipientName: "",
  recipientEmail: "",
  subject: "",
  body: "",
  invoiceNo: "",
  amount: "",
  pdfUrl: undefined,
};

export default function InvoicePage() {
  const [search, setSearch] = useState("");

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  const [userid, setUserid] = useState<string | null>(null);
  const router = useRouter();
  const [aiEmail, setAiEmail] = useState<InvoiceEmailDialogState>(DEFAULT_EMAIL_STATE);
  const setEmail = setAiEmail;


const [previewOpen, setPreviewOpen] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
const [previewLoading, setPreviewLoading] = useState(false);
const [generatepdf, setgeneratepdf] = useState(false);
const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
const [countstats, setcountstats] = useState({
  totalInvoices: 0,
  paidThisMonth: 0,
  overdueInvoices: 0,
});
                 

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

  const fetch_Invoice= async() =>{
    try{
        const response=  await axios.get(`${baseurl}/get-user-invoices/${userid}`);
        setInvoices(response.data.data);
        console.log(response.data.data);

    }catch(err){
        console.error(err);
    }
  }

useEffect(()=>{
    if(!userid)
    {
        return;
    }
    fetch_Invoice();
},[userid])

const handleedit=(id:string)=>{
    console.log(id);
    router.push(`/admin/invoice/edit/${id}`);
}


const generate_pdf = async (invoice: InvoiceDetail) => {
  try {
    const res = await axios.get(
      `${baseurl}/invoice/pdf/${invoice._id}`
    );

    alert("PDF Generated Successfully");

    // Refresh invoice details so pdf_url is updated
    handleView(invoice);

  } catch (err) {
    console.log(err);
  }
};

const handleView = async (invoice: any) => {
  try {
    const res = await axios.get(
      `${baseurl}/get-invoice/${invoice._id}`
    );
    const data = res.data.invoice;
    setSelectedInvoice({
  _id: data._id,
  invoiceNo: data.invoice_no,
  status: data.status,
  createdDate: data.issue_date,
  customerName: data.customer_name,
  customerEmail: data.customer_email,
  customerPhone: data.customer_phone,
  customerAddress: data.customer_address,
  leadTitle: data.lead_name,
  leadDescription: data.lead_description,
  price: data.price,
  discountPercent: data.discount,
  taxPercent: data.tax_percentage,
  paymentTerms: data.payment_terms,
  notes: data.notes,
  pdf_url: data.pdf_url,
  account_name: data.AccountName,
  account_number: data.Accountnumber,
});
    setPreviewOpen(true);
  } catch (err) {
    console.log(err);
  }
};


const handleAIEmail = async (invoice: InvoiceRow) => {
  setAiEmail({
    ...DEFAULT_EMAIL_STATE,
    open: true,
    loading: true,
    _id: invoice._id,
    recipientName: invoice.customer_name,
    recipientEmail: invoice.customer_email ?? "",
    invoiceNo: invoice.invoice_no,
    amount: `£${invoice.grand_total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  });

  try {
    const response = await axios.get(
      `${baseurl}/invoice/email-preview/${invoice._id}`
    );
    const data = response.data;

    if (data.success === false) {
      setAiEmail((prev) => ({
        ...prev,
        loading: false,
        error: data.message ?? "Failed to generate email. Please try again.",
      }));
      return;
    }

    // Actual response shape: { success, to, subject, body, attachment }
    setAiEmail((prev) => ({
      ...prev,
      loading: false,
      subject: data.subject ?? prev.subject,
      body: data.body ?? "",
      recipientEmail: data.to ?? prev.recipientEmail,
      pdfUrl: data.attachment ?? prev.pdfUrl,
    }));
  } catch (error: any) {
    console.error("AI email error:", error);
    const msg =
      error?.response?.data?.message ??
      error?.response?.data?.detail ??
      "Failed to generate email. Please try again.";
    setAiEmail((prev) => ({ ...prev, loading: false, error: msg }));
  }
};
  // ── Send the email ────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
  if (!userid) {
    setAiEmail((prev) => ({ ...prev, error: "User ID not found." }));
    return;
  }
  if (!aiEmail._id) {
    setAiEmail((prev) => ({ ...prev, error: "No invoice selected." }));
    return;
  }

  setAiEmail((prev) => ({ ...prev, sending: true, error: null }));

  try {
    const response = await axios.post(
      `${baseurl}/send-invoice-email/${aiEmail._id}`
    );
    const data = response.data;

    if (!data.success) {
      setAiEmail((prev) => ({
        ...prev,
        sending: false,
        error: data.message || "Failed to send email.",
      }));
      return;
    }

    setAiEmail((prev) => ({ ...prev, sending: false, sent: true }));
  } catch (error: any) {
    console.error("Send email error:", error);
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      "Failed to send email.";
    setAiEmail((prev) => ({ ...prev, sending: false, error: message }));
  }
};
  const handleCloseEmailDialog = () => setEmail(DEFAULT_EMAIL_STATE);

  const handleEmailSubjectChange = (value: string) =>
    setAiEmail((prev) => ({ ...prev, subject: value }));

  const handleEmailBodyChange = (value: string) =>
    setAiEmail((prev) => ({ ...prev, body: value }));

const handledelete= async(id:string) =>{

  try{
     await axios.delete(`${baseurl}/delete-invoice/${id}`);  
    fetch_Invoice();
  }catch(err){
    console.log(err);
  }
}

const countstat = async() =>{
  try{
    const response = await axios.get(`${baseurl}/count-totalinvoice-overdue-paidthismonth/${userid}`)
    setcountstats(response.data.data);
    console.log(response.data);

  }catch(err){
    console.error(err);
  }
}

useEffect(()=>{
  if(!userid){
    return;
  }
  countstat();
},[userid])

  return (
  <>
    <InvoiceListView
      invoices={invoices}
      loading={false}
      stats= {countstats}
      search={search}
      onSearchChange={setSearch}
      page={1}
      totalPages={1}
      pageSize={10}
      onSendEmail={handleAIEmail}     
      onPageChange={() => {}}
      selectedIds={new Set()}
      allSelected={false}
      onToggleAll={() => {}}
      onToggleOne={() => {}}
      onCreateInvoice={() => {}}
      onView={handleView}
      onEdit={handleedit}
      onDelete={handledelete}
     
    />

    <InvoicePreviewView
      open={previewOpen}
      onOpenChange={setPreviewOpen}
      invoice={selectedInvoice}
      loading={false}
      onEdit={handleedit}
      onDelete={handledelete}
      onGeneratePDF={(id) => {
        if (selectedInvoice) generate_pdf(selectedInvoice);
      }}
    />

    {/* ← was completely missing */}
    <InvoiceEmailDialog
      invoiceEmail={aiEmail}
      onClose={handleCloseEmailDialog}
      onSend={handleSendEmail}
      onSubjectChange={handleEmailSubjectChange}
      onBodyChange={handleEmailBodyChange}
    />
  </>
);
}