
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
    const dob = searchParams.get('dob') || '';
    const gender = searchParams.get('gender') || '';
    const barcodeValue = searchParams.get('barcodeValue') || '';
    const sampleType = searchParams.get('sampleType') || '';
    const tests = searchParams.get('tests') || '';
    
    useEffect(() => {
        // Give a short delay for the barcode to render, then print
        setTimeout(() => {
            window.print();
        }, 500); 
    }, []);

    return (
        <div className="p-4">
            <SampleLabel 
                patientName={patientName}
                mrn={mrn}
                dob={dob}
                gender={gender}
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

    