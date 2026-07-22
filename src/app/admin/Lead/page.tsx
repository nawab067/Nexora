"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import CustomerInfoView from "@/components/leadinfo";

export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  customerid?: string;
  customername?: string;
  address: string;
  leadsource?: string;
  status?: string;
};

export type CustomerWithImage = Customer & { image_url?: string };

export interface AIEmailDialogState {
  open: boolean;
  loading: boolean;
  subject: string;
  body: string;
  recipientEmail: string;
  recipientName: string;
  sending: boolean;
  sent: boolean;
  error: string | null;
}

const DEFAULT_EMAIL_STATE: AIEmailDialogState = {
  open: false,
  loading: false,
  subject: "",
  body: "",
  recipientEmail: "",
  recipientName: "",
  sending: false,
  sent: false,
  error: null,
};

const PAGE_SIZE = 8;

export default function CustomerInfoContainer() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerWithImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my" | "team">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [aiEmail, setAiEmail] =
    useState<AIEmailDialogState>(DEFAULT_EMAIL_STATE);

  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
  const [userid, setUserid] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState({
    conversion: 0,
    winrate: 0,
    total_customer: 0,
    leads_by_userid: [],
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

  useEffect(() => {
    if (!userid) return;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`${baseurl}/dashboard/lead/${userid}`);

        setDashboard(res.data);

        setCustomerData(res.data.leads_by_userid);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userid]);

  const handleAddCustomer = () => router.push(`/admin/Lead/add`);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${baseurl}/lead/${id}`, { withCredentials: true });
      setCustomerData((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ── Open dialog and fetch AI-generated email ──────────────────────────────
  const handleAIEmail = async (customer: CustomerWithImage) => {
    // Open dialog immediately in loading state so the user sees feedback
    setAiEmail({
      ...DEFAULT_EMAIL_STATE,
      open: true,
      loading: true,
      recipientEmail: customer.email ?? "",
      recipientName: customer.name,
    });
    console.log("Clicked customer:", customer);

    try {
      const response = await axios.post(
        `${baseurl}/generate-email/${customer.customerid}`,
      );

      const data = response.data;

      // Backend returns { success: false, message: "..." } on logical errors
      if (data.success === false) {
        setAiEmail((prev) => ({
          ...prev,
          loading: false,
          error: data.message ?? "Failed to generate email. Please try again.",
        }));
        return;
      }

      // Happy path: { success: true, subject, body, recipientEmail, recipientName }
      setAiEmail((prev) => ({
        ...prev,
        loading: false,
        subject: data.subject ?? `Following up — ${customer.name}`,
        body: data.body ?? "",
        recipientEmail: data.recipientEmail ?? prev.recipientEmail,
        recipientName: data.recipientName ?? prev.recipientName,
      }));
    } catch (error: any) {
      console.error("AI email error:", error);
      const msg =
        error?.response?.data?.message ??
        error?.response?.data?.detail ??
        "Failed to generate email. Please try again.";
      setAiEmail((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
    }
  };

  // ── Send the email ────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!userid) {
      setAiEmail((prev) => ({
        ...prev,
        error: "User ID not found.",
      }));
      return;
    }

    setAiEmail((prev) => ({
      ...prev,
      sending: true,
      error: null,
    }));

    try {
      const response = await axios.post(`${baseurl}/send-email`, {
        userid,
        to: aiEmail.recipientEmail,
        subject: aiEmail.subject,
        body: aiEmail.body,
      });

      const data = response.data;

      if (!data.success) {
        setAiEmail((prev) => ({
          ...prev,
          sending: false,
          error: data.message || "Failed to send email.",
        }));
        return;
      }

      setAiEmail((prev) => ({
        ...prev,
        sending: false,
        sent: true,
      }));
    } catch (error: any) {
      console.error("Send email error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Failed to send email.";

      setAiEmail((prev) => ({
        ...prev,
        sending: false,
        error: message,
      }));
    }
  };
  const handleCloseEmailDialog = () => setAiEmail(DEFAULT_EMAIL_STATE);

  const handleEmailSubjectChange = (value: string) =>
    setAiEmail((prev) => ({ ...prev, subject: value }));

  const handleEmailBodyChange = (value: string) =>
    setAiEmail((prev) => ({ ...prev, body: value }));

  const handleEdit = (id: string) => router.push(`/admin/Lead/edit/${id}`);

  const filtered = useMemo(() => {
    return customerData.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    });
  }, [customerData, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected =
    paginated.length > 0 && paginated.every((c) => selectedIds.has(c._id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) paginated.forEach((c) => next.delete(c._id));
      else paginated.forEach((c) => next.add(c._id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <CustomerInfoView
      customerData={customerData}
      loading={loading}
      filtered={filtered}
      paginated={paginated}
      search={search}
      onSearchChange={handleSearchChange}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      page={page}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      onPageChange={setPage}
      selectedIds={selectedIds}
      allSelected={allSelected}
      onToggleAll={toggleAll}
      onToggleOne={toggleOne}
      onAddCustomer={handleAddCustomer}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onAIEmail={(c: any) => handleAIEmail(c)}
      // ── AI Email Dialog props ──
      aiEmail={aiEmail}
      onCloseEmailDialog={handleCloseEmailDialog}
      onSendEmail={handleSendEmail}
      onEmailSubjectChange={handleEmailSubjectChange}
      onEmailBodyChange={handleEmailBodyChange}
      conversion={dashboard.conversion}
      totalcount={dashboard.total_customer}
      totalWinrate={dashboard.winrate}
    />
  );
}
