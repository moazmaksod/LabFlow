
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { SampleLabel } from '@/components/label/sample-label';
import { Skeleton } from '@/components/ui/skeleton';

function PrintLabel() {
    const searchParams = useSearchParams();

    // Safely get all params
    const patientName = searchParams.get('patientName') || '';
    const mrn = searchParams.get('mrn') || '';
    const age = searchParams.get('age') || '';
    const gender = searchParams.get('gender') || '';
    const barcodeValue = searchParams.get('barcodeValue') || '';
    const sampleType = searchParams.get('sampleType') || '';
    const tests = searchParams.get('tests') || '';
    const orderId = searchParams.get('orderId') || '';
    
    useEffect(() => {
        // Give a short delay for the barcode to render, then print
        const timer = setTimeout(() => {
            window.print();
        }, 500); 

        return () => clearTimeout(timer);
    }, []);

    if (!barcodeValue) {
        return <Skeleton className="w-[4cm] h-[2.5cm]" />;
    }

    return (
        <div className="p-4">
            <SampleLabel 
                patientName={patientName}
                mrn={mrn}
                age={age}
                gender={gender}
                orderId={orderId}
                barcodeValue={barcodeValue}
                sampleType={sampleType}
                tests={tests}
            />
        </div>
    );
}

export default function PrintLabelPage() {
    return (
        <Suspense fallback={<Skeleton className="w-[4cm] h-[2.5cm]" />}>
            <PrintLabel />
        </Suspense>
    )
}
