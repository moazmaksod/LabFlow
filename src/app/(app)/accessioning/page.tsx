
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
import { CheckCircle, Loader2, CircleDashed, ScanLine } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import type { Order } from '@/lib/schemas/order';
import { useAuth } from '@/hooks/use-auth';

// Add a temporary unique identifier to each sample for the UI
type SampleWithClientSideId = Order['samples'][0] & { clientId: string };
type OrderWithClientSideSampleIds = Omit<Order, 'samples' | 'patientDetails'> & {
    samples: SampleWithClientSideId[];
    patientDetails: {
        fullName: string;
        mrn: string;
    }
};

export default function AccessioningPage() {
    const { toast } = useToast();
    const { token } = useAuth();
    const [orderId, setOrderId] = useState('');
    const [searchedOrder, setSearchedOrder] = useState<OrderWithClientSideSampleIds | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accessioningState, setAccessioningState] = useState<Record<string, 'loading' | 'accessioned'>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useCallback(async () => {
        if (!orderId || !token) return;

        setIsLoading(true);
        setSearchedOrder(null);
        setAccessioningState({});
        
        try {
            const response = await fetch(`/api/v1/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const result = await response.json();
                const orderData = result.data as Order;
                const orderWithClientIds: OrderWithClientSideSampleIds = {
                    ...orderData,
                    samples: orderData.samples.map((s, i) => ({...s, clientId: `${orderData.orderId}-${i}`})),
                    patientDetails: result.data.patientDetails || { fullName: 'N/A', mrn: 'N/A' }
                };
                setSearchedOrder(orderWithClientIds);
            } else {
                setSearchedOrder(null);
                const errorData = await response.json();
                 toast({
                    variant: 'destructive',
                    title: 'Order Not Found',
                    description: errorData.message || `No order found for ID "${orderId}".`,
                });
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not connect to the server.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [orderId, token, toast]);
    
    useEffect(() => {
        // Focus the input on page load for a barcode-scanner-first workflow
        inputRef.current?.focus();
    }, [])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (orderId) {
                handleSearch();
            } else {
                setSearchedOrder(null);
            }
        }, 500); // 500ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [orderId, handleSearch]);
    
    useEffect(() => {
        if (!searchedOrder) return;
        
        const allAccessioned = searchedOrder.samples.every(s => s.status !== 'AwaitingCollection');

        if(allAccessioned) {
            toast({
                title: 'All Samples Accessioned',
                description: `Order ${searchedOrder.orderId} is fully accessioned. Ready for next scan.`,
            });
            const timer = setTimeout(() => {
                setOrderId(''); // Only clear the input field, not the whole order
                inputRef.current?.focus();
            }, 1500); // Wait 1.5 seconds before clearing
            return () => clearTimeout(timer);
        }

    }, [searchedOrder, toast]);


    const handleAccessionSample = async (clientId: string, sampleIndex: number) => {
        if (!searchedOrder?.orderId || !token) return;

        setAccessioningState(prev => ({ ...prev, [clientId]: 'loading' }));

        try {
            const response = await fetch('/api/v1/samples/accession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId: searchedOrder.orderId,
                    sampleIndex: sampleIndex,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: 'Sample Accessioned',
                    description: `Accession Number: ${result.accessionNumber}`,
                });

                // Update the UI optimistically
                setSearchedOrder(prevOrder => {
                    if (!prevOrder) return null;
                    const newSamples = [...prevOrder.samples];
                    newSamples[sampleIndex] = {
                        ...newSamples[sampleIndex],
                        status: 'InLab',
                        accessionNumber: result.accessionNumber,
                    };
                    return { ...prevOrder, samples: newSamples };
                });
                setAccessioningState(prev => ({ ...prev, [clientId]: 'accessioned' }));

            } else {
                const errorData = await response.json();
                toast({
                    variant: 'destructive',
                    title: 'Accession Failed',
                    description: errorData.message || 'An unexpected error occurred.',
                });
                 setAccessioningState(prev => {
                     const newState = {...prev};
                     delete newState[clientId];
                     return newState;
                 });
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not connect to the server.',
            });
            setAccessioningState(prev => {
                const newState = {...prev};
                delete newState[clientId];
                return newState;
            });
        }
    }
    
    const getButtonState = (sample: SampleWithClientSideId) => {
        const state = accessioningState[sample.clientId];

        if (state === 'loading') return { text: 'Accessioning...', disabled: true, icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
        if (state === 'accessioned' || sample.status !== 'AwaitingCollection') return { text: 'Accessioned', disabled: true, icon: <CheckCircle className="mr-2 h-4 w-4" /> };
        
        return { text: 'Accession Sample', disabled: false, icon: <CheckCircle className="mr-2 h-4 w-4" /> };
    };
    
    const onFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSearch();
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <CircleDashed className="size-10 text-muted-foreground animate-spin [animation-duration:5s]" />
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
          <form onSubmit={onFormSubmit}>
             <div className="flex w-full max-w-lg items-center space-x-2">
                <div className="relative flex-grow">
                  <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      ref={inputRef}
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
                    Patient: {searchedOrder.patientDetails.fullName} (MRN: {searchedOrder.patientDetails.mrn})
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sample Type</TableHead>
                             <TableHead>Accession #</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchedOrder.samples.map((sample, index) => {
                            const buttonState = getButtonState(sample);
                            return (
                                <TableRow key={sample.clientId}>
                                    <TableCell className="font-medium">{sample.sampleType}</TableCell>
                                    <TableCell className="font-code">{sample.accessionNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={sample.status === 'AwaitingCollection' ? 'outline' : 'default'}>
                                            {sample.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant={buttonState.disabled ? 'secondary' : 'default'}
                                            disabled={buttonState.disabled}
                                            onClick={() => handleAccessionSample(sample.clientId, index)}
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

       {isLoading && !searchedOrder && (
          <Card>
              <CardHeader>
                  <CardTitle><span className='inline-block h-8 w-48 bg-muted animate-pulse rounded-md'></span></CardTitle>
                  <CardDescription><span className='inline-block h-5 w-64 bg-muted animate-pulse rounded-md'></span></CardDescription>
              </CardHeader>
              <CardContent>
                  <div className='h-32 w-full bg-muted animate-pulse rounded-md'></div>
              </CardContent>
          </Card>
      )}
    </div>
  );
}

    