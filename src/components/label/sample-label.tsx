
'use client';
import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import { format } from 'date-fns';

interface SampleLabelProps {
    patientName: string;
    mrn: string;
    age: string;
    gender: string;
    orderId: string;
    barcodeValue: string;
    sampleType: string;
    tests: string;
}

export const SampleLabel: React.FC<SampleLabelProps> = ({
    patientName,
    mrn,
    age,
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
           <div style={{fontSize: '6pt', lineHeight: '1.2'}}>
                <div className="flex justify-between items-start">
                    <p className="font-bold truncate">{patientName}</p>
                    <p className='font-semibold'>{sampleType}</p>
                </div>
                <div>
                    <p>MRN: {mrn}</p>
                    <p>Age: {age} ({gender.charAt(0)})</p>
                </div>
            </div>
            <div className="text-center -my-2">
                 <Barcode 
                    value={barcodeValue} 
                    format="CODE128"
                    width={0.8}
                    height={20}
                    fontSize={8}
                    margin={0}
                    textMargin={0}
                    displayValue={true}
                />
            </div>
            <div className='flex justify-between items-end' style={{fontSize: '5pt'}}>
                <p className="truncate max-w-[70%]">{tests}</p>
                <p>{currentTime}</p>
            </div>
        </div>
    );
};
