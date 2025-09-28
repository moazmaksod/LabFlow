
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { TechnicianDashboard } from './technician-dashboard';
import { ReceptionistDashboard } from './receptionist-dashboard';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex flex-col gap-8">
         <Skeleton className="h-10 w-64" />
         <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Render a specific dashboard based on the user's role
  switch (user.role) {
    case 'technician':
    case 'manager': // Managers often need to see the technician's view
      return <TechnicianDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'physician':
      // Redirect or show physician dashboard
      return <div>Physician Dashboard</div>;
    case 'patient':
        // Redirect or show patient portal
      return <div>Patient Portal</div>;
    default:
      return (
        <div className="flex flex-col gap-8">
            <h1 className="font-headline text-3xl font-semibold">Dashboard</h1>
             <Card>
                <CardHeader>
                <CardTitle>Welcome to LabFlow</CardTitle>
                <CardDescription>
                    Your role-specific dashboard is loading.
                </CardDescription>
                </CardHeader>
            </Card>
        </div>
      );
  }
}
