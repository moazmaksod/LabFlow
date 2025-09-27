
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, createAuditLog } from '@/lib/api/utils';
import { getAuditLogsCollection, getOrdersCollection, getPatientsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/v1/audit-logs
// Searches audit logs or gets the latest logs if no search term is provided (Manager only)
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'manager') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm');
  const collection = await getAuditLogsCollection();

  const aggregationPipeline = (matchClause: any) => [
    matchClause,
    { $sort: { timestamp: -1 } },
    { $limit: 50 },
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
    {
      $addFields: {
        'userDetails.fullName': {
          $ifNull: [
            '$userDetails.fullName',
            { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] }
          ]
        }
      }
    },
    { 
      $project: { 
        "userObjectId": 0, 
        "userDetails.passwordHash": 0,
        "userDetails.role": 0,
        "userDetails.firstName": 0,
        "userDetails.lastName": 0,
      } 
    }
  ];

  // If no search term, return the latest logs
  if (!searchTerm) {
    const latestLogs = await collection.aggregate(aggregationPipeline({ $match: {} })).toArray();
    return NextResponse.json({ data: latestLogs });
  }
  
  // If there is a search term, proceed with search logic
  const patientsCollection = await getPatientsCollection();
  const ordersCollection = await getOrdersCollection();

  // Find patients by MRN
  const patient = await patientsCollection.findOne({ mrn: searchTerm });
  // Find orders by Order ID or Accession Number
  const order = await ordersCollection.findOne({ $or: [{ orderId: searchTerm }, { "samples.accessionNumber": searchTerm }] });

  const entityIdsToSearch = [];
  if(patient) entityIdsToSearch.push(patient._id);
  if(order) entityIdsToSearch.push(order._id);
  
  if (entityIdsToSearch.length === 0) {
      // Check if it's a valid object ID string, but only if we haven't found anything yet
      if (ObjectId.isValid(searchTerm)) {
        entityIdsToSearch.push(new ObjectId(searchTerm));
      } else {
        return NextResponse.json({ data: [] });
      }
  }
  
  const logs = await collection.aggregate(aggregationPipeline({
    $match: { "entity.documentId": { $in: entityIdsToSearch } }
  })).toArray();

  return NextResponse.json({ data: logs });
}

    