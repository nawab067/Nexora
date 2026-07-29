'use client'; 
import { useParams } from 'next/navigation';
import Invoice from '@/components/invoiceGenerator';

export default function CustomerPage() {
    const params = useParams();

    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    return <Invoice  id={id} />;
}