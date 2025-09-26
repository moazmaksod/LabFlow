import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Search, TriangleAlert } from 'lucide-react';

const inventoryItems = [
  {
    id: 'REAG-001',
    name: 'CBC Reagent Kit',
    category: 'Reagents',
    quantity: 5,
    minLevel: 10,
    status: 'Low Stock',
  },
  {
    id: 'TUBE-001',
    name: 'EDTA Tube (Purple Top)',
    category: 'Consumables',
    quantity: 250,
    minLevel: 100,
    status: 'In Stock',
  },
  {
    id: 'REAG-002',
    name: 'Lipid Panel Reagent',
    category: 'Reagents',
    quantity: 15,
    minLevel: 10,
    status: 'In Stock',
  },
  {
    id: 'CTRL-001',
    name: 'Hematology Control L1',
    category: 'Controls',
    quantity: 2,
    minLevel: 5,
    status: 'Low Stock',
  },
  {
    id: 'CONS-002',
    name: 'Pipette Tips 1000uL',
    category: 'Consumables',
    quantity: 5,
    minLevel: 2,
    status: 'Reorder',
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'In Stock': 'secondary',
    'Low Stock': 'destructive',
    'Reorder': 'destructive',
};

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Inventory</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Low Stock Warning!</AlertTitle>
        <AlertDescription>
          There are 3 items below their minimum stock levels. Please reorder
          soon.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Manage reagents, consumables, and other lab supplies.
          </CardDescription>
           <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory by name or ID..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity on Hand</TableHead>
                <TableHead>Minimum Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id} className={item.status !== 'In Stock' ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                  <TableCell className="font-medium font-code">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.minLevel}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status] || 'default'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
