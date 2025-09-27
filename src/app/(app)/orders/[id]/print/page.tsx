
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Order } from '@/lib/schemas/order';
import { SampleLabel } from '@/components/label/sample-label';
import { RequisitionForm } from '@/components/label/requisition-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

function PrintPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const { toast } = useToast();
    
    const orderId = params.id as string;
    const printType = searchParams.get('type');
    const sampleClientId = searchParams.get('sampleClientId');
    
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
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
                     const orderWithClientIds = {
                        ...result.data,
                        samples: result.data.samples.map((s: Order['samples'][0], i: number) => ({...s, clientId: `${result.data.orderId}-S${i}`})),
                    };
                    setOrder(orderWithClientIds);
                } else {
                    toast({variant: 'destructive', title: 'Failed to fetch order for printing'});
                }
            } catch (error) {
                toast({variant: 'destructive', title: 'Network Error', description: 'Could not fetch order data.'});
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, token, toast]);

    useEffect(() => {
        // Automatically trigger print dialog once data is loaded
        if (!isLoading && order) {
            setTimeout(() => {
                window.print();
                // We might not want to close immediately, user may want to reprint
                // window.close(); 
            }, 500); // Small delay to ensure rendering
        }
    }, [isLoading, order]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Skeleton className="h-96 w-[800px]" /></div>;
    }

    if (!order) {
        return <div className="text-center p-8">Error: Order could not be loaded.</div>;
    }

    // If printing a specific label
    if (printType === 'label' && sampleClientId) {
        const sample = order.samples.find(s => (s as any).clientId === sampleClientId);
        if (!sample) {
            return <div>Error: Sample with ID {sampleClientId} not found in this order.</div>
        }
        const barcodeValue = sample.accessionNumber || order.orderId;
        return (
             <div className="p-8 flex items-center justify-center">
                 <SampleLabel 
                    patientName={order.patientDetails.fullName}
                    mrn={order.patientDetails.mrn}
                    orderId={order.orderId}
                    barcodeValue={barcodeValue}
                    sampleType={sample.sampleType}
                />
            </div>
        );
    }

    // If printing the full requisition
    if (printType === 'requisition') {
        return <RequisitionForm order={order} />;
    }

    return <div className="text-center p-8">Error: Invalid print type specified.</div>
}


export default function PrintPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <PrintPageContent />
        </Suspense>
    )
}

    