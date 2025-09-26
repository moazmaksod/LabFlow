
'use client';
import React from 'react';

// A simplified SVG barcode generator for Code 128.
// This is a basic implementation for demonstration purposes and may not cover all characters.
const Barcode = ({ text, height = 50 }: { text: string, height?: number }) => {
    // A very basic and incomplete Code 128 character set for alphanumeric data
    const codes: { [key: string]: string } = {
        '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000', '4': '10010001100', '5': '10001001100', '6': '10011001000',
        '7': '10011000100', '8': '10001100100', '9': '11001001000', 'A': '11010001010', 'B': '11010100010', 'C': '10110000100', 'D': '10001011000',
        'E': '10000101100', 'F': '10000110100', 'G': '10110001000', 'H': '10110000100', 'I': '10010110000', 'J': '10010011000', 'K': '10001011000',
        'L': '10001001100', 'M': '10001101000', 'N': '10001100100', 'O': '10010111000', 'P': '10011101000', 'R': '10011100010', 'S': '11101011000',
        '-': '10100011000', ' ': '11001011100'
    };
    
    // Start character for Code 128 B
    const startChar = '11010010000';
    // Stop character
    const stopChar = '1100011101011';

    let binaryString = startChar;
    let checksum = 104; // Start value for Code B

    for (let i = 0; i < text.length; i++) {
        const char = text[i].toUpperCase();
        let charBinary = '';
        let charValue = 0;

        if (char >= '0' && char <= '9') {
            charBinary = codes[char];
            charValue = parseInt(char);
        } else if (char >= 'A' && char <= 'Z') {
            charBinary = codes[char] || '10100011000'; // fallback to '-'
            charValue = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else if (char === '-') {
            charBinary = codes['-'];
            charValue = 39;
        } else {
             charBinary = codes[' ']; // fallback to space
             charValue = 0; // Invalid characters will not contribute correctly to checksum
        }
        binaryString += charBinary;
        checksum += charValue * (i + 1);
    }
    
    const checksumValue = checksum % 103;
    let checksumCharKey = '';

    for (const key in codes) {
        let value = 0;
         if (key >= '0' && key <= '9') {
            value = parseInt(key);
        } else if (key >= 'A' && key <= 'Z') {
            value = key.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else if (key === '-') {
            value = 39;
        }
        if (value === checksumValue) {
            checksumCharKey = key;
            break;
        }
    }
    checksumCharKey = checksumCharKey || ' '; // fallback

    binaryString += codes[checksumCharKey];
    binaryString += stopChar;

    const bars = [];
    let x = 0;
    for (let i = 0; i < binaryString.length; i++) {
        const barWidth = 1.2; // Width of each bar
        if (binaryString[i] === '1') {
            bars.push(<rect key={i} x={x} y={0} width={barWidth} height={height} fill="black" />);
        }
        x += barWidth;
    }

    return (
        <svg width={x} height={height} className='mx-auto'>
            {bars}
        </svg>
    );
};


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
                <Barcode text={barcodeValue} height={40} />
                <p className="text-sm font-mono tracking-widest pt-1">{barcodeValue}</p>
            </div>
            <div className='flex justify-between text-xs'>
                <p>LabFlow Diagnostics</p>
                <p>{new Date().toLocaleString()}</p>
            </div>
        </div>
    );
};
