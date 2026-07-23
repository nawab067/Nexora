'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    User,
    Mail,
    MapPin,
    Megaphone,
    Tag,
    Upload,
    X,
    UserPlus,
    Pencil,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerFormData {
    name: string;
    LeadDiscription: string;
    leadsource: string;
    status: string;
}

type StatusOption = {
    value: string;
    label: string;
    activeClass: string;
    // idle uses theme tokens — bg transparent, colored text + border
    idleClass: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EMPTY_FORM: CustomerFormData = {
    name: '',
    LeadDiscription: '',
    leadsource: '',
    status: '',
};

// Active classes stay opaque-colored (intentional — same in light & dark).
// Idle classes use /10 bg tints + dark: text variants so they're readable
// on both the light card and the dark card backgrounds.
const STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'New',
        label: 'New',
        activeClass: 'bg-indigo-600 text-white border-indigo-600',
        idleClass:
            'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
    },
    {
        value: 'Contacted',
        label: 'Contacted',
        activeClass: 'bg-amber-500 text-white border-amber-500',
        idleClass:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    },
    {
        value: 'Qualified',
        label: 'Qualified',
        activeClass: 'bg-emerald-600 text-white border-emerald-600',
        idleClass:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    },
    {
        value: 'Lost',
        label: 'Lost',
        activeClass: 'bg-rose-500 text-white border-rose-500',
        idleClass:
            'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
    },
    {
        value: 'Won',
        label: 'Won',
        activeClass: 'bg-violet-600 text-white border-violet-600',
        idleClass:
            'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20',
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Labelled input row with an icon eyebrow */
function Field({
    label,
    icon: Icon,
    required,
    error,
    children,
}: {
    label: string;
    icon: React.ElementType;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                {required && (
                    <span className="text-rose-400 normal-case tracking-normal">*</span>
                )}
            </Label>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

/** Avatar preview / upload widget */
function AvatarUpload({
    preview,
    name,
    onChange,
    onClear,
}: {
    preview: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5 flex flex-row lg:flex-col items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Lead photo"
                            className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full object-cover border-2 border-border"
                        />
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={onClear}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Remove photo</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </>
                ) : (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 flex items-center justify-center">
                        <User className="w-7 h-7 lg:w-8 lg:h-8 text-indigo-400" />
                    </div>
                )}
            </div>

            {/* Live name preview + upload (stacked next to avatar on mobile, below on desktop) */}
            <div className="flex-1 min-w-0 flex flex-col lg:items-center gap-3 lg:gap-4 lg:w-full">
                <div className="text-left lg:text-center w-full overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {name || 'New Lead'}
                    </p>
                </div>

                {/* Upload button */}
                <label className="w-full cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onChange}
                    />
                    <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        {preview ? 'Change photo' : 'Upload photo'}
                    </div>
                </label>
            </div>
        </div>
    );
}

/** Status quick-pick panel */
function StatusPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Lead Status
            </p>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                            onChange(opt.value === value ? '' : opt.value)
                        }
                        className={cn(
                            'flex-1 lg:flex-none min-w-[45%] lg:min-w-0 lg:w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
                            value === opt.value ? opt.activeClass : opt.idleClass
                        )}
                    >
                        {opt.label}
                        {value === opt.value && (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerForm({ id }: { id?: string }) {
    const router = useRouter();
    const isEdit = Boolean(id);

    // ── State ──
    const [form, setForm] = useState<CustomerFormData>(EMPTY_FORM);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
    const [userid, setUserid] = useState<string | null>(null);
    const [contactname, setContactname] = useState<
        Array<{ _id: string; name: string }>
    >([]);
    const [selectedContact, setSelectedContact] = useState('');

    // ── Load existing data when editing ──
    useEffect(() => {
        if (!id) return;

        const fetchCustomer = async () => {
            try {
                setFetching(true);
                const { data } = await axios.get(`${BASE_URL}/lead/${id}`);
                setForm({
                    name: data.name ?? '',
                    LeadDiscription: data.LeadDiscription ?? '',
                    leadsource: data.leadsource ?? '',
                    status: data.status ?? '',
                });
                setSelectedContact(data.customerid ?? '');
                if (data.image_url) setPreview(data.image_url);
            } catch (err) {
                console.error('Failed to load lead', err);
            } finally {
                setFetching(false);
            }
        };

        fetchCustomer();
    }, [id]);

    // ── Resolve current user ──
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${BASE_URL}/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserid(res.data.id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    // ── Load contact dropdown once userid is known ──
    useEffect(() => {
        if (!userid) return;
        const getContactname = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/contact/${userid}`);
                setContactname(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        getContactname();
    }, [userid]);

    // ── Field handlers ──
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof CustomerFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleStatusChange = (value: string) => {
        setForm((prev) => ({ ...prev, status: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImage(null);
        setPreview('');
    };

    // ── Validation ──
    const validate = (): boolean => {
        const next: Partial<CustomerFormData> = {};
        if (!form.name.trim()) next.name = 'Name is required.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('LeadDiscription', form.LeadDiscription);
            formData.append('leadsource', form.leadsource);
            formData.append('status', form.status);
            formData.append('customerid', selectedContact);
            if (userid) formData.append('userid', userid);
            if (image) formData.append('image', image);

            if (isEdit && id) {
                await axios.put(`${BASE_URL}/lead/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(`${BASE_URL}/lead`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            router.push('/admin/Lead');
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // ─── Skeleton while loading edit data ────────────────────────────────────
    if (fetching) {
        return (
            <div className="p-4 sm:p-6 bg-background min-h-screen">
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="w-full lg:w-56 space-y-4">
                        <div className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-row lg:flex-col items-center gap-4">
                            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full shrink-0" />
                            <Skeleton className="h-3.5 flex-1 lg:w-28 lg:flex-none" />
                        </div>
                        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <div className="flex flex-wrap lg:flex-col gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-8 flex-1 lg:w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-card rounded-xl border border-border p-4 sm:p-6 space-y-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Skeleton className="h-9 rounded-lg" />
                                <Skeleton className="h-9 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)]">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
                <span
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    onClick={() => router.push('/admin/Lead')}
                >
                    Leads Management
                </span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">
                    {isEdit ? 'Edit Lead' : 'Add New Lead'}
                </span>
            </div>

            {/* Page heading */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {isEdit ? 'Edit Lead' : 'Add New Lead'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {isEdit
                        ? 'Update the details for this lead record.'
                        : 'Fill in the details below to create a new lead record.'}
                </p>
            </div>

            {/* Layout: sidebar + form — stacked on mobile, side-by-side on laptop */}
            <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-start">

                {/* ── Sidebar ── */}
                <div className="w-full lg:w-56 shrink-0 space-y-4">
                    <AvatarUpload
                        preview={preview}
                        name={form.name}
                        onChange={handleImageChange}
                        onClear={clearImage}
                    />
                    <StatusPicker
                        value={form.status}
                        onChange={handleStatusChange}
                    />
                </div>

                {/* ── Main form card ── */}
                <div className="flex-1 min-w-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden">

                    {/* Card header */}
                    <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            {isEdit
                                ? <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                : <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            }
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Lead Information
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Contact details and source
                            </p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="p-4 sm:p-6 space-y-5">

                        {/* Row 1: Lead Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Lead Name" icon={User} required error={errors.name}>
                                <Input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Sarah Johnson"
                                    className={cn(
                                        'h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500',
                                        errors.name &&
                                            'border-rose-400 focus-visible:ring-rose-400'
                                    )}
                                />
                            </Field>
                        </div>

                        {/* Row 2: Lead Description + Contact Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Lead Description" icon={User}>
                                <Input
                                    name="LeadDiscription"
                                    value={form.LeadDiscription}
                                    onChange={handleChange}
                                    placeholder="Brief description…"
                                    className="h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500"
                                />
                            </Field>

                            {/* Contact Name dropdown */}
                            <Field label="Contact Name" icon={User}>
                                <Select
                                    value={selectedContact}
                                    onValueChange={setSelectedContact}
                                >
                                    <SelectTrigger className="h-9 text-sm rounded-lg bg-muted border-border focus:ring-1 focus:ring-indigo-500 w-full">
                                        <SelectValue placeholder="Select a contact" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contactname.map((contact) => (
                                            <SelectItem
                                                key={contact._id}
                                                value={contact._id}
                                            >
                                                {contact.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        {/* Row 3: Lead Source (full width) */}
                        <Field label="Lead Source" icon={Megaphone}>
                            <Input
                                name="leadsource"
                                value={form.leadsource}
                                onChange={handleChange}
                                placeholder="e.g. LinkedIn, Referral, Website"
                                className="h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500"
                            />
                        </Field>

                        <Separator />

                        {/* Actions — stacked full-width on mobile, inline on larger screens */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/Lead')}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors text-center"
                            >
                                Cancel
                            </button>

                            <Button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="h-9 px-5 text-sm gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg w-full sm:w-auto"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {isEdit ? 'Saving…' : 'Creating…'}
                                    </>
                                ) : isEdit ? (
                                    <>
                                        <Pencil className="w-4 h-4" />
                                        Save Changes
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Add Lead
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}