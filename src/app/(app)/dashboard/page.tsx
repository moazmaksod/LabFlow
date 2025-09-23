
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to LabFlow</CardTitle>
          <CardDescription>
            This is your main dashboard. Content will be populated based on your role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future widgets and key information will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
