
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/schemas/order';
import { SampleLabel } from '@/components/label/sample-label';
import { Skeleton } from '@/components/ui/skeleton';

type OrderWithPatient = Order & {
    patientDetails: {
        fullName: string;
        mrn: string;
    };
};

export default function PrintLabelPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { token } = useAuth();
    
    const orderId = params.id as string;
    const accessionNumber = searchParams.get('accessionNumber');
    
    const [order, setOrder] = useState<OrderWithPatient | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderId || !token) return;

        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/v1/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const result = await response.json();
                    setOrder(result.data);
                } else {
                    console.error('Failed to fetch order for printing');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, token]);

    if (isLoading) {
        return <Skeleton className="h-24 w-80" />;
    }

    if (!order || !accessionNumber) {
        return <div>Error: Order or Accession Number not found.</div>;
    }

    const sample = order.samples.find(s => s.accessionNumber === accessionNumber);
    if (!sample) {
        return <div>Error: Sample with accession number {accessionNumber} not found in this order.</div>
    }

    return (
        <div className="p-2">
            <SampleLabel 
                patientName={order.patientDetails.fullName}
                mrn={order.patientDetails.mrn}
                orderId={order.orderId}
                accessionNumber={accessionNumber}
                sampleType={sample.sampleType}
            />
        </div>
    );
}
