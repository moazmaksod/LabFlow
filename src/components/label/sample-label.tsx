
'use client';
import React from 'react';
import Barcode from 'react-barcode';

interface SampleLabelProps {
    patientName: string;
    mrn: string;
    orderId: string;
    barcodeValue: string;
    sampleType: string;
    isRequisition: boolean;
}

export const SampleLabel: React.FC<SampleLabelProps> = ({
    patientName,
    mrn,
    orderId,
    barcodeValue,
    sampleType,
    isRequisition,
}) => {
    return (
        <div style={{ width: '3.5in', height: '2in', fontFamily: 'sans-serif', fontSize: '10pt', border: '1px solid #ccc', padding: '0.1in' }} className="flex flex-col justify-between bg-white text-black">
            <div className="flex justify-between items-start">
                <div className='max-w-48'>
                    <p className="font-bold truncate text-base">{patientName}</p>
                    <p>MRN: {mrn}</p>
                </div>
                <div>
                     <p className='text-right font-semibold'>{isRequisition ? 'REQUISITION' : 'SAMPLE'}</p>
                     <p className='text-right'>{sampleType}</p>
                </div>
            </div>
            <div className="text-center">
                <Barcode 
                    value={barcodeValue} 
                    width={1.5}
                    height={40}
                    fontSize={12}
                    margin={0}
                />
            </div>
            <div className='flex justify-between text-xs'>
                <p>Order: {orderId}</p>
                <p>{new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};
