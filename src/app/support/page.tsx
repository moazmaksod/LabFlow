
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Mail, Phone } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Support</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Have a question or need help? Fill out the form below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What is your message about?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue or question in detail."
                  className="min-h-[120px]"
                />
              </div>
              <Button>Send Message</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    You can reset your password from the profile page. If you are unable to log in, please contact an administrator to have your password reset manually.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I create a new lab order?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the "Orders" page and click the "Create New Order" button. You will be guided through the process of selecting a patient and the required tests.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Where can I find patient reports?</AccordionTrigger>
                  <AccordionContent>
                    Completed patient reports can be found in the "Reports" section. You can search for a specific order and download the PDF report from there.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                  <AccordionTrigger>How is inventory managed?</AccordionTrigger>
                  <AccordionContent>
                    The "Inventory" page shows the current stock levels of all lab items. Items that are low on stock are highlighted, and you can add new items to the inventory catalog via the "Management" page.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
         <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Phone className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div className="break-words">
                            <h3 className="font-semibold">Phone Support</h3>
                            <p className="text-muted-foreground text-sm">Our team is available from 9am to 5pm, Sunday to Thursday.</p>
                            <a href="tel:+966112345678" className="text-primary hover:underline">+966 11 234 5678</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div className="break-words">
                            <h3 className="font-semibold">Email Support</h3>
                            <p className="text-muted-foreground text-sm">We typically respond to emails within 24 hours.</p>
                            <a href="mailto:support@labflow.med" className="text-primary hover:underline">support@labflow.med</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <LifeBuoy className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div className="break-words">
                            <h3 className="font-semibold">Help Center</h3>
                            <p className="text-muted-foreground text-sm">Find answers to common questions and tutorials.</p>
                            <a href="#" className="text-primary hover:underline">Visit Help Center</a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
