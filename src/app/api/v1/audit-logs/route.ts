
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api/utils';
import { getAuditLogsCollection, getOrdersCollection, getPatientsCollection } from '@/lib/mongodb';
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
  
  // This search is designed to find logs related to a patient, order, or sample.
  // We first find the document IDs related to the search term, then find logs for those IDs.
  const patientsCollection = await getPatientsCollection();
  const ordersCollection = await getOrdersCollection();

  // Find patients by MRN
  const patient = await patientsCollection.findOne({ mrn: searchTerm });
  // Find orders by Order ID or Accession Number
  const order = await ordersCollection.findOne({ $or: [{ orderId: searchTerm }, { "samples.accessionNumber": searchTerm }] });

  const entityIdsToSearch = [];
  if(patient) entityIdsToSearch.push(patient._id);
  if(order) entityIdsToSearch.push(order._id);
  // If the search term is a valid ObjectId, search for it directly.
  if (ObjectId.isValid(searchTerm)) {
    entityIdsToSearch.push(new ObjectId(searchTerm));
  }
  
  if (entityIdsToSearch.length === 0) {
      return NextResponse.json({ data: [] });
  }
  
  const logs = await collection.aggregate([
    { $match: { "entity.documentId": { $in: entityIdsToSearch } } },
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
  ]).limit(50).toArray();

  return NextResponse.json({ data: logs });
}
