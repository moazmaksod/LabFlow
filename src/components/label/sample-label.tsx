
'use client';
import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import { format } from 'date-fns';

interface SampleLabelProps {
    patientName: string;
    mrn: string;
    dob: string | Date;
    gender: string;
    orderId: string;
    barcodeValue: string;
    sampleType: string;
    tests: string;
}

export const SampleLabel: React.FC<SampleLabelProps> = ({
    patientName,
    mrn,
    dob,
    gender,
    barcodeValue,
    sampleType,
    tests,
}) => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
      // This code will only run on the client, after hydration is complete
      setCurrentTime(format(new Date(), 'HH:mm'));
    }, []);


    const formatDateSafe = (date: any) => {
        try {
            if (!date) return 'N/A';
            return format(new Date(date), 'yyyy-MM-dd');
        } catch {
            return 'Invalid Date';
        }
    }

    return (
        <div style={{ 
            width: '4cm', 
            height: '2.5cm',
            fontFamily: 'sans-serif', 
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            color: 'black'
        }} >
           <div className="flex justify-between items-start" style={{fontSize: '7pt', lineHeight: '1.2'}}>
                <div className='max-w-[75%]'>
                    <p className="font-bold truncate">{patientName}</p>
                    <p>MRN: {mrn}</p>
                    <p>DOB: {formatDateSafe(dob)} ({gender.charAt(0)})</p>
                </div>
                <div className='text-right'>
                     <p className='font-semibold'>{sampleType}</p>
                </div>
            </div>
            <div className="text-center -my-1">
                 <Barcode 
                    value={barcodeValue} 
                    format="CODE128"
                    width={1}
                    height={25}
                    fontSize={10}
                    margin={0}
                    textMargin={0}
                    displayValue={true}
                />
            </div>
            <div className='flex justify-between items-end' style={{fontSize: '6pt'}}>
                <p className="truncate max-w-[70%]">{tests}</p>
                <p>{currentTime}</p>
            </div>
        </div>
    );
};
