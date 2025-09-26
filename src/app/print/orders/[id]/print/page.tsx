
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
    // The useAuth hook will now work because of the minimal print layout's AuthProvider
    const { token } = useAuth();
    
    const orderId = params.id as string;
    const accessionNumber = searchParams.get('accessionNumber');
    
    const [order, setOrder] = useState<OrderWithPatient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // useAuth is initialized asynchronously, so we wait for the token.
        if (!token) {
            // It might be loading, so don't fetch yet.
            // The loading state is handled by the initial isLoading state.
            return;
        };

        if (!orderId) {
            setError("Order ID is missing.");
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/v1/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const result = await response.json();
                    setOrder(result.data);
                } else {
                    const errorData = await response.json();
                    console.error('Failed to fetch order for printing:', errorData.message);
                    setError(errorData.message || `Failed to fetch order ${orderId}.`);
                }
            } catch (fetchError) {
                console.error('Error fetching order:', fetchError);
                setError("A network error occurred while fetching order details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, token]); // Effect depends on the token now.

    if (isLoading) {
        return <div className="p-4"><Skeleton className="h-24 w-80" /></div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 text-sm font-sans">Error: {error}</div>;
    }

    if (!order || !accessionNumber) {
        return <div className="p-4 text-red-500 text-sm font-sans">Error: Could not find Order or Accession Number.</div>;
    }

    const sample = order.samples.find(s => s.accessionNumber === accessionNumber);
    if (!sample) {
        return <div className="p-4 text-red-500 text-sm font-sans">Error: Sample with accession number {accessionNumber} not found in this order.</div>
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

