
'use client';
import React from 'react';

// A simplified SVG barcode generator for Code 128.
// This is a basic implementation for demonstration purposes and may not cover all characters.
const Barcode = ({ text, height = 50 }: { text: string, height?: number }) => {
    // A very basic and incomplete Code 128 character set for alphanumeric data
    const codes: { [key: string]: string } = {
        '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000', '4': '10010001100', '5': '10001001100', '6': '10011001000',
        '7': '10011000100', '8': '10001100100', '9': '11001001000', 'A': '11010001010', 'B': '11010100010', 'C': '10110000100', 'D': '10001011000',
        '-': '10100011000', 'O': '10010111000', 'R': '10011101000', 'C': '10011100010', 'D': '10110000100', 'S': '11101011000', ' ': '11001011100'
    };
    
    // Start character for Code 128 B
    const startChar = '11010010000';
    // Stop character
    const stopChar = '1100011101011';

    let binaryString = startChar;
    let checksum = 104; // Start value for Code B

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let charBinary = '';
        let charValue = 0;

        if (char >= '0' && char <= '9') {
            charBinary = codes[char];
            charValue = parseInt(char);
        } else if (char >= 'A' && char <= 'Z') {
            charBinary = codes[char] || '10100011000'; // fallback to '-'
            charValue = char.charCodeAt(0) - 65 + 10;
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
    const checksumChar = Object.keys(codes).find(key => {
        if(key >= '0' && key <= '9') return parseInt(key) === checksumValue;
        if(key >= 'A' && key <= 'Z') return key.charCodeAt(0) - 65 + 10 === checksumValue;
        return false;
    }) || '0';

    binaryString += codes[checksumChar];
    binaryString += stopChar;

    const bars = [];
    let x = 0;
    for (let i = 0; i < binaryString.length; i++) {
        const barWidth = 1; // Width of each bar
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
    accessionNumber: string;
    sampleType: string;
}

export const SampleLabel: React.FC<SampleLabelProps> = ({
    patientName,
    mrn,
    orderId,
    accessionNumber,
    sampleType,
}) => {
    return (
        <div style={{ width: '3.5in', height: '1.5in', fontFamily: 'sans-serif', fontSize: '10pt', border: '1px solid #ccc', padding: '0.1in' }} className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className='max-w-40'>
                    <p className="font-bold truncate">{patientName}</p>
                    <p>MRN: {mrn}</p>
                </div>
                <div>
                     <p className='text-right'>Order: {orderId}</p>
                     <p className='text-right'>{sampleType}</p>
                </div>
            </div>
            <div className="text-center">
                <Barcode text={accessionNumber} height={30} />
                <p className="text-sm font-mono tracking-widest">{accessionNumber}</p>
            </div>
            <div className='flex justify-between text-xs'>
                <p>LabFlow Diagnostics</p>
                <p>{new Date().toLocaleString()}</p>
            </div>
        </div>
    );
};
