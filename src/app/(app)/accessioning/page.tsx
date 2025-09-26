
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Scan, CheckCircle, Info, ScanLine, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Mock data representing what the API might return for an order
const mockOrderData = {
    orderId: 'ORD-2025-00001',
    patient: {
        fullName: 'John Doe',
        mrn: 'MRN12345'
    },
    samples: [
        { sampleId: 'S1', type: 'Lavender Top', status: 'AwaitingCollection' },
        { sampleId: 'S2', type: 'Gold Top', status: 'AwaitingCollection' },
    ]
};

type Sample = typeof mockOrderData.samples[0];


export default function AccessioningPage() {
    const { toast } = useToast();
    const [orderId, setOrderId] = useState('');
    const [searchedOrder, setSearchedOrder] = useState<typeof mockOrderData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accessioningState, setAccessioningState] = useState<Record<string, 'loading' | 'accessioned'>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;

        setIsLoading(true);
        setSearchedOrder(null);
        setAccessioningState({});
        // In a real app, this would be an API call:
        // fetch(`/api/v1/orders/${orderId}`)
        setTimeout(() => {
            if (orderId === 'ORD-2025-00001') {
                setSearchedOrder(JSON.parse(JSON.stringify(mockOrderData))); // Deep copy to allow modification
            } else {
                setSearchedOrder(null);
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleAccessionSample = (sampleId: string) => {
        setAccessioningState(prev => ({ ...prev, [sampleId]: 'loading' }));
        
        // In a real app, this would be an API call:
        // const response = await fetch('/api/v1/samples/accession', {
        //   method: 'POST',
        //   body: JSON.stringify({ orderId: searchedOrder?.orderId, sampleId })
        // });
        setTimeout(() => {
            setSearchedOrder(prevOrder => {
                if (!prevOrder) return null;
                return {
                    ...prevOrder,
                    samples: prevOrder.samples.map(s => 
                        s.sampleId === sampleId ? { ...s, status: 'InLab' } : s
                    )
                };
            });
            setAccessioningState(prev => ({ ...prev, [sampleId]: 'accessioned' }));
            toast({
                title: "Sample Accessioned",
                description: `Sample ${sampleId} has been successfully received into the lab.`,
            });
        }, 1500);
    }
    
    const getSampleStatus = (sample: Sample): string => {
        const state = accessioningState[sample.sampleId];
        if (state === 'accessioned') return 'InLab';
        return sample.status;
    };
    
    const getButtonState = (sample: Sample) => {
        const state = accessioningState[sample.sampleId];
        const status = getSampleStatus(sample);

        if (state === 'loading') return { text: 'Accessioning...', disabled: true, icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
        if (status === 'InLab') return { text: 'Accessioned', disabled: true, icon: <CheckCircle className="mr-2 h-4 w-4" /> };
        
        return { text: 'Accession Sample', disabled: false, icon: <CheckCircle className="mr-2 h-4 w-4" /> };
    };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Scan className="size-10 text-muted-foreground" />
        <div>
          <h1 className="font-headline text-3xl font-semibold">Accessioning</h1>
          <p className="text-muted-foreground">
            Receive and log new samples into the laboratory workflow.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Order Requisition</CardTitle>
          <CardDescription>
            Scan the barcode on the sample requisition form to find the order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch}>
             <div className="flex w-full max-w-lg items-center space-x-2">
                <div className="relative flex-grow">
                  <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      placeholder="Scan or enter Order ID..." 
                      className="h-12 text-lg pl-10"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" disabled={isLoading || !orderId}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Searching...' : 'Find Order'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {searchedOrder && (
         <Card>
            <CardHeader>
                <CardTitle>Order Details: {searchedOrder.orderId}</CardTitle>
                <CardDescription>
                    Patient: {searchedOrder.patient.fullName} (MRN: {searchedOrder.patient.mrn})
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sample Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchedOrder.samples.map(sample => {
                            const status = getSampleStatus(sample);
                            const buttonState = getButtonState(sample);
                            return (
                                <TableRow key={sample.sampleId}>
                                    <TableCell className="font-medium">{sample.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={status === 'AwaitingCollection' ? 'outline' : 'default'}>
                                            {status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant={buttonState.disabled ? 'secondary' : 'default'}
                                            disabled={buttonState.disabled}
                                            onClick={() => handleAccessionSample(sample.sampleId)}
                                        >
                                            {buttonState.icon}
                                            {buttonState.text}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      )}

      {!searchedOrder && !isLoading && orderId && (
        <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Order Not Found</AlertTitle>
            <AlertDescription>
                No order found for ID "{orderId}". Please check the ID and try again.
            </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
