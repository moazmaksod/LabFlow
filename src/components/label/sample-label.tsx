
'use client';
import React from 'react';
import Barcode from 'react-barcode';

interface SampleLabelProps {
    patientName: string;
    mrn: string;
    orderId: string;
    barcodeValue: string;
    sampleType: string;
}

export const SampleLabel: React.FC<SampleLabelProps> = ({
    patientName,
    mrn,
    orderId,
    barcodeValue,
    sampleType,
}) => {
    return (
        <div style={{ width: '4in', height: '2.5in', fontFamily: 'sans-serif', fontSize: '12pt', border: '1px solid #ccc', padding: '0.2in' }} className="flex flex-col justify-between bg-white text-black">
            <div className="flex justify-between items-start">
                <div className='max-w-64'>
                    <p className="font-bold truncate text-lg">{patientName}</p>
                    <p className="text-base">MRN: {mrn}</p>
                </div>
                <div>
                     <p className='text-right font-semibold text-lg'>SAMPLE</p>
                     <p className='text-right text-base'>{sampleType}</p>
                </div>
            </div>
            <div className="text-center -mt-4">
                 <Barcode 
                    value={barcodeValue} 
                    format="CODE128"
                    width={2}
                    height={60}
                    fontSize={14}
                    margin={2}
                    textMargin={2}
                />
            </div>
            <div className='flex justify-between text-sm'>
                <p>Order: {orderId}</p>
                <p>{new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};
