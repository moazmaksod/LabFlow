
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RequisitionForm } from '@/components/label/requisition-form';
import type { Order } from '@/lib/schemas/order';

type OrderWithDetails = Order & {
    patientDetails: {
        _id: string;
        fullName: string;
        mrn: string;
        dateOfBirth: string | Date;
        gender: string;
    };
    physicianDetails?: {
        _id: string;
        fullName: string;
    }
}

function PrintRequisition() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token');
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderId || !token) {
            toast({ variant: 'destructive', title: 'Missing order ID or token.' });
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/v1/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    setOrder(result.data);
                } else {
                    toast({ variant: 'destructive', title: 'Failed to fetch order for printing.' });
                }
            } catch (err) {
                toast({ variant: 'destructive', title: 'Network error fetching order.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, token, toast]);

    useEffect(() => {
        if (order) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [order]);

    if (isLoading) {
        return <Skeleton className="w-[210mm] h-[297mm]" />;
    }

    if (!order) {
        return <div className="p-8 text-center text-red-500">Could not load order details for printing.</div>;
    }

    return <RequisitionForm order={order} />;
}

export default function PrintRequisitionPage() {
    return (
        <Suspense fallback={<Skeleton className="w-[210mm] h-[297mm]" />}>
            <PrintRequisition />
        </Suspense>
    );
}

    