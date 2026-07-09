'use client';

import ContactInfoView from '@/components/contactinfo';
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

interface Contact {
    _id: string;
    userid: string;
    name: string;
    email?: string;
    phonenum?: string;
    Designation?: string;
    address?: string;
    image_url?: string;
}

const PAGE_SIZE = 10;

export default function ContactInfoPage() {
    const [loading, setLoading] = useState(true);
    const [userid, setUserid] = useState<string | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // search & filter
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'my' | 'team'>('all');

    // pagination
    const [page, setPage] = useState(1);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await axios.get(`${baseurl}/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserid(res.data.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    async function fetchallcontacts() {
        try {
            setLoading(true);
            const res = await axios.get(`${baseurl}/contactinfo/${userid}`);
            setContacts(res.data);
            setLoading(false);

        } catch (err) {
            console.error(err);
        }
    }

    // runs once userid is actually available, instead of firing on mount with userid still null
    useEffect(() => {
        if (!userid) return;
        fetchallcontacts();
    }, [userid]);

    // ── derived data for the view ──
    const filtered = useMemo(() => {
        if (!search.trim()) return contacts;
        const q = search.toLowerCase();
        return contacts.filter((c) =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phonenum?.toLowerCase().includes(q) ||
            c.Designation?.toLowerCase().includes(q) ||
            c.address?.toLowerCase().includes(q)
        );
    }, [contacts, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const allSelected = paginated.length > 0 && paginated.every((c) => selectedIds.has(c._id));

    // ── handlers ──
    function handleSearchChange(value: string) {
        setSearch(value);
        setPage(1);
    }

    function handleTabChange(tab: 'all' | 'my' | 'team') {
        setActiveTab(tab);
        setPage(1);
    }

    function handleToggleAll() {
        setSelectedIds((prev) => {
            if (allSelected) {
                const next = new Set(prev);
                paginated.forEach((c) => next.delete(c._id));
                return next;
            }
            const next = new Set(prev);
            paginated.forEach((c) => next.add(c._id));
            return next;
        });
    }

    function handleToggleOne(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function handleDelete(id: string) {
        try {
            await axios.delete(`${baseurl}/contactinfo/${id}`);
            setContacts((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    function handleEdit(id: string) {
        router.push(`/admin/contactinfo/edit/${id}`);
        // wire up navigation to your edit route/modal here
        console.log('edit', id);
    }

    function handleAddCustomer() {
        router.push('/admin/contactinfo/add');

        // wire up navigation to your add route/modal here
        console.log('add customer');
    }



    return (
        <ContactInfoView
            customerData={contacts}
            loading={loading}
            filtered={filtered}
            paginated={paginated}
            search={search}
            onSearchChange={handleSearchChange}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            selectedIds={selectedIds}
            allSelected={allSelected}
            onToggleAll={handleToggleAll}
            onToggleOne={handleToggleOne}
            onAddCustomer={handleAddCustomer}
            onDelete={handleDelete}
            onEdit={handleEdit}

        />
    );
}