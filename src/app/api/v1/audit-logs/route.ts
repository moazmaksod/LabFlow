
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api/utils';
import { getAuditLogsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/v1/audit-logs
// Searches audit logs (Manager only)
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm');

  if (!searchTerm) {
    return NextResponse.json({ message: 'A search term is required.' }, { status: 400 });
  }
  
  const collection = await getAuditLogsCollection();
  
  // This is a simplified search for the prototype. A real implementation would have
  // a more robust search mechanism (e.g., full-text search or specific field queries).
  // We'll search for matches in details.orderId, details.newAccessionNumber, or entity.documentId
  let query: any = {
    $or: [
        { "details.orderId": searchTerm },
        { "details.newAccessionNumber": searchTerm },
    ]
  };

  if (ObjectId.isValid(searchTerm)) {
    query.$or.push({ "entity.documentId": new ObjectId(searchTerm) });
  }

  const logs = await collection.aggregate([
    { $match: query },
    { $sort: { timestamp: -1 } },
    { $addFields: { "userObjectId": { "$toObjectId": "$userId" } } },
    {
      $lookup: {
        from: 'users',
        localField: 'userObjectId',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
    { $project: { "userDetails.role": 0, userObjectId: 0 } }
  ]).limit(50).toArray();

  return NextResponse.json({ data: logs });
}
