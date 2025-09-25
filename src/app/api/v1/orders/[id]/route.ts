
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findOrderById } from '@/lib/api/utils';

// GET /api/v1/orders/[id]
// Retrieves a single order by its human-readable orderId
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }
   
   // In a real app, you would have more complex role-based logic here.
   // E.g., a patient or physician should only be able to see their own orders.
   // For the prototype, we allow any authenticated user to view any order.

  const foundOrder = await findOrderById(params.id);
  
  if (foundOrder) {
    return NextResponse.json({ data: foundOrder });
  }

  return NextResponse.json({ message: 'Order not found' }, { status: 404 });
}
