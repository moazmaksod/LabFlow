
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
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
                    samples: orderData.samples.map((s, i) => ({...s, clientId: `${s.sampleType}-${i}`})),
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
    };

    const handleAccessionSample = async (clientId: string, sampleIndex: number) => {
        // This will be implemented in the next step.
        console.log('Accessioning sample:', clientId, sampleIndex);
    }
    
    const getButtonState = (sample: SampleWithClientSideId) => {
        const state = accessioningState[sample.clientId];

        if (state === 'loading') return { text: 'Accessioning...', disabled: true, icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
        if (sample.status !== 'AwaitingCollection') return { text: 'Accessioned', disabled: true, icon: <CheckCircle className="mr-2 h-4 w-4" /> };
        
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
    </div>
  );
}
