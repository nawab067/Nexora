'use client'; 
import { useParams } from 'next/navigation';
import CustomerForm from '@/components/customerform';

export default function CustomerPage() {
    const params = useParams();

    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    return <CustomerForm id={id} />;
}