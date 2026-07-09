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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Megaphone,
    Upload,
    X,
    UserPlus,
    Pencil,
    ChevronRight,
    AlertCircle,
    Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerFormData {
    name: string;
    email: string;
    address: string;
    phonenum: string;
    Designation: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EMPTY_FORM: CustomerFormData = {
    name: '',
    email: '',
    phonenum: '',
    address: '',
    Designation: '',
};

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
    email,
    onChange,
    onClear,
}: {
    preview: string;
    name: string;
    email: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col items-center gap-4">
            {/* Avatar */}
            <div className="relative">
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Lead photo"
                            className="h-24 w-24 rounded-full object-cover border-2 border-border"
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
                    <div className="h-24 w-24 rounded-full bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 flex items-center justify-center">
                        <User className="w-8 h-8 text-indigo-400" />
                    </div>
                )}
            </div>

            {/* Live name / email preview */}
            <div className="text-center w-full overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">
                    {name || 'New Lead'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {email || 'No email set'}
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
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

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

    // ── Load existing record when editing ──
    useEffect(() => {
        if (!id) return;

        const fetchCustomer = async () => {
            try {
                setFetching(true);
                const { data } = await axios.get(
                    `${BASE_URL}/contactinfo/user/${id}`
                );
                setForm({
                    name: data.name ?? '',
                    email: data.email ?? '',
                    address: data.address ?? '',
                    phonenum: data.phonenum ?? '',
                    Designation: data.Designation ?? '',
                });
                if (data.image_url) setPreview(data.image_url);
            } catch (err) {
                console.error('Failed to load customer', err);
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
                const token = localStorage.getItem('token');
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

    // ── Field handlers ──
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof CustomerFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
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
        if (!form.email.trim()) next.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            next.email = 'Enter a valid email address.';
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
            formData.append('email', form.email);
            formData.append('address', form.address);
            formData.append('Designation', form.Designation);
            formData.append('phonenum', form.phonenum);
            if (userid) formData.append('userid', userid);
            if (image) formData.append('image', image);

            if (isEdit && id) {
                await axios.put(`${BASE_URL}/contactinfo/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(`${BASE_URL}/contactinfo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            router.push('/admin/contactinfo');
        } catch (error: any) {
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("Error:", error);
} finally {
            setSaving(false);
        }
    };

    // ─── Skeleton while loading edit data ────────────────────────────────────
    if (fetching) {
        return (
            <div className="p-6 bg-background min-h-screen">
                <div className="flex gap-5">
                    <div className="w-56 space-y-4">
                        <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center gap-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    </div>
                    <div className="flex-1 bg-card rounded-xl border border-border p-6 space-y-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-2 gap-4">
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
        <div className="p-6 bg-background min-h-[calc(100vh-3.5rem)]">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                <span
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    onClick={() => router.push('/admin/contactinfo')}
                >
                    Customer Management
                </span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">
                    {isEdit ? 'Edit Customer' : 'Add New Customer'}
                </span>
            </div>

            {/* Page heading */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {isEdit ? 'Edit Customer' : 'Add New Customer'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {isEdit
                        ? 'Update the details for this customer record.'
                        : 'Fill in the details below to create a new customer record.'}
                </p>
            </div>

            {/* Layout: sidebar + form */}
            <div className="flex gap-5 items-start">

                {/* ── Left sidebar ── */}
                <div className="w-56 shrink-0 space-y-4">
                    <AvatarUpload
                        preview={preview}
                        name={form.name}
                        email={form.email}
                        onChange={handleImageChange}
                        onClear={clearImage}
                    />
                </div>

                {/* ── Main form card ── */}
                <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden">

                    {/* Card header */}
                    <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                            {isEdit
                                ? <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                : <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            }
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Customer Information
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Contact details and source
                            </p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="p-6 space-y-5">

                        {/* Row 1: Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full Name" icon={User} required error={errors.name}>
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

                            <Field
                                label="Email Address"
                                icon={Mail}
                                required
                                error={errors.email}
                            >
                                <Input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="sarah@company.com"
                                    className={cn(
                                        'h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500',
                                        errors.email &&
                                            'border-rose-400 focus-visible:ring-rose-400'
                                    )}
                                />
                            </Field>
                        </div>

                        {/* Row 2: Phone + Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Phone Number" icon={Phone}>
                                <Input
                                    name="phonenum"
                                    value={form.phonenum}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500"
                                />
                            </Field>

                            <Field label="Address" icon={MapPin}>
                                <Input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500"
                                />
                            </Field>
                        </div>

                        {/* Row 3: Designation (full width) */}
                        <Field label="Designation" icon={Megaphone}>
                            <Input
                                name="Designation"
                                value={form.Designation}
                                onChange={handleChange}
                                placeholder="e.g. Product Manager"
                                className="h-9 text-sm rounded-lg bg-muted border-border focus-visible:ring-1 focus-visible:ring-indigo-500"
                            />
                        </Field>

                        <Separator />

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/contactinfo')}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>

                            <Button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="h-9 px-5 text-sm gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
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
                                        Add Customer
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