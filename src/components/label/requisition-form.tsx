
'use client';
import React from 'react';
import Barcode from 'react-barcode';
import { Icons } from '../icons';
import { format } from 'date-fns';
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
        _id:string;
        fullName: string;
    }
}

interface RequisitionFormProps {
    order: OrderWithDetails;
}

export const RequisitionForm: React.FC<RequisitionFormProps> = ({ order }) => {
    
    const formatDateSafe = (date: any) => {
        try {
            if (!date) return 'N/A';
            return format(new Date(date), 'yyyy-MM-dd');
        } catch {
            return 'Invalid Date';
        }
    }

    const allTests = order.samples.flatMap(s => s.tests);

    return (
        <div className="a4-page bg-white text-black p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-black pb-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary text-white p-2 rounded-lg">
                        <Icons.logo className="size-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">LabFlow Diagnostics</h1>
                        <p className="text-sm">123 Health St, Metropolis, NY 10001 | (555) 123-4567</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">Laboratory Requisition</p>
                    <Barcode 
                        value={order.orderId} 
                        format="CODE128"
                        width={1.5}
                        height={50}
                        fontSize={14}
                        margin={0}
                    />
                </div>
            </header>

            {/* Patient and Order Info */}
            <section className="grid grid-cols-2 gap-x-8 gap-y-4 mt-6 border-b border-black pb-4 text-sm">
                <div>
                    <h2 className="text-base font-bold mb-2 underline">PATIENT INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="font-semibold">Name:</span> <span>{order.patientDetails.fullName}</span>
                        <span className="font-semibold">MRN:</span> <span>{order.patientDetails.mrn}</span>
                        <span className="font-semibold">Date of Birth:</span> <span>{formatDateSafe(order.patientDetails.dateOfBirth)}</span>
                        <span className="font-semibold">Gender:</span> <span>{order.patientDetails.gender}</span>
                    </div>
                </div>
                 <div>
                    <h2 className="text-base font-bold mb-2 underline">ORDER INFORMATION</h2>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="font-semibold">Order ID:</span> <span>{order.orderId}</span>
                        <span className="font-semibold">Order Date:</span> <span>{formatDateSafe(order.createdAt)}</span>
                        <span className="font-semibold">Referring MD:</span> <span>{order.physicianDetails?.fullName || 'N/A'}</span>
                        <span className="font-semibold">ICD-10:</span> <span>{order.icd10Code}</span>
                    </div>
                </div>
            </section>
            
             {/* Specimen and Collection Info */}
            <section className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4 border-b border-black pb-4 text-sm">
                <div>
                    <h2 className="text-base font-bold mb-2 underline">SPECIMEN INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="font-semibold">Sample Types:</span> 
                        <span>{order.samples.map(s => s.sampleType).join(', ')}</span>
                    </div>
                </div>
                 <div>
                    <h2 className="text-base font-bold mb-2 underline">COLLECTION (Phlebotomist Use)</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-center">
                        <span className="font-semibold">Collection Date/Time:</span> <span className="border-b border-dotted h-4 w-full"></span>
                        <span className="font-semibold">Collected By:</span>  <span className="border-b border-dotted h-4 w-full"></span>
                    </div>
                </div>
            </section>

            {/* Tests Ordered */}
            <section className="mt-6">
                 <h2 className="text-base font-bold mb-2 underline">TESTS ORDERED</h2>
                 <div className="columns-2 gap-8">
                    {allTests.map(test => (
                        <div key={test.testCode} className="flex items-center gap-2 mb-1 break-inside-avoid-column">
                           <div className="w-4 h-4 border border-black"></div>
                           <span>{test.name} ({test.testCode})</span>
                        </div>
                    ))}
                 </div>
            </section>

            {/* Footer */}
            <footer className="mt-16 text-center text-xs text-gray-500 absolute bottom-8 left-8 right-8">
                <p>Thank you for choosing LabFlow Diagnostics.</p>
            </footer>
             <style jsx global>{`
                .a4-page {
                    width: 210mm;
                    min-height: 297mm;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
            `}</style>
        </div>
    );
};
