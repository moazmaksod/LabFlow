
'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SampleLabel } from '@/components/label/sample-label';
import { RequisitionForm } from '@/components/label/requisition-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrintPage() {
    const { toast } = useToast();
    const [printData, setPrintData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const dataString = sessionStorage.getItem('labflow_print_data');
            if (dataString) {
                setPrintData(JSON.parse(dataString));
            } else {
                toast({ variant: 'destructive', title: 'No print data found. Please try again.'});
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Could not prepare print data.'});
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!isLoading && printData) {
            setTimeout(() => {
                window.print();
            }, 500); // Delay to ensure rendering, especially for barcodes
        }
    }, [isLoading, printData]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Skeleton className="h-96 w-[800px]" /></div>;
    }

    if (!printData) {
        return <div className="p-8 text-center text-red-500">No print data found. Please close this window and try again.</div>;
    }

    if (printData.type === 'label') {
        return <div className="p-4"><SampleLabel {...printData} /></div>;
    }

    if (printData.type === 'requisition') {
        return <RequisitionForm order={printData.order} />;
    }

    return <div className="p-8 text-center">Invalid print type.</div>;
}
