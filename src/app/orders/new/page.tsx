
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';

const availableTests = [
    { id: 'cbc', name: 'Complete Blood Count (CBC)', price: 'SAR 50.00' },
    { id: 'lipid', name: 'Lipid Profile', price: 'SAR 100.00' },
    { id: 'tsh', name: 'Thyroid Stimulating Hormone (TSH)', price: 'SAR 120.00' },
    { id: 'glucose', name: 'Glucose (Fasting)', price: 'SAR 30.00' },
    { id: 'vitd', name: 'Vitamin D, 25-Hydroxy', price: 'SAR 150.00' },
]

export default function NewOrderPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Create New Order</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Select a patient and the tests to be ordered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Find Patient</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Patient ID or National ID..."
                    className="pl-8"
                  />
                </div>
                 <div className="text-sm text-muted-foreground pt-2">
                    Or <Button variant="link" className="p-0 h-auto">register a new patient</Button>.
                </div>
              </div>

              <div className="space-y-2">
                <Label>Referring Doctor (Optional)</Label>
                <Input placeholder="e.g., Dr. Smith @ Main Clinic" />
              </div>
              
              <Separator />

              <div className="space-y-4">
                 <Label>Select Tests</Label>
                 <div className="space-y-3">
                    {availableTests.map((test) => (
                         <div key={test.id} className="flex items-center space-x-3">
                            <Checkbox id={`test-${test.id}`} />
                            <Label htmlFor={`test-${test.id}`} className="font-normal flex-grow">{test.name}</Label>
                            <div className="text-muted-foreground">{test.price}</div>
                        </div>
                    ))}
                 </div>
              </div>

              <Separator />

                <div className="space-y-2">
                    <Label htmlFor="notes">Clinical Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Enter any relevant clinical information..." />
                </div>


            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>SAR 150.00</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span>SAR 0.00</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>SAR 150.00</span>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4 items-stretch">
                    <Button size="lg">Create Order</Button>
                    <Button variant="outline">Save as Draft</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
