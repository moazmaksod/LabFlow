
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getOrders } from '@/lib/api/utils';

// GET /api/v1/worklist
// Retrieves the technician's dynamic, prioritized worklist of samples
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !['technician', 'manager'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') || 'InLab,Testing';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  const statuses = statusParam.split(',').map(s => s.trim());

  // We need to find orders that contain samples with the desired statuses
  const query = {
      "samples.status": { $in: statuses }
  };
  
  // Use the existing getOrders aggregation which is powerful
  const ordersWithMatchingSamples = await getOrders(query);

  // Now, we transform the data into a sample-centric worklist
  const worklist = ordersWithMatchingSamples.flatMap(order => 
      order.samples
          .filter((sample: any) => statuses.includes(sample.status))
          .map((sample: any) => ({
              sample,
              orderId: order.orderId,
              priority: order.priority,
              patientDetails: order.patientDetails,
          }))
  );
  
  // Sort the final worklist
  worklist.sort((a, b) => {
      // STAT orders come first
      if (a.priority === 'STAT' && b.priority !== 'STAT') return -1;
      if (a.priority !== 'STAT' && b.priority === 'STAT') return 1;

      // Then sort by oldest received time
      const timeA = new Date(a.sample.receivedTimestamp || 0).getTime();
      const timeB = new Date(b.sample.receivedTimestamp || 0).getTime();
      return timeA - timeB;
  });

  const paginatedWorklist = worklist.slice(offset, offset + limit);

  return NextResponse.json({ data: paginatedWorklist, total: worklist.length });
}
