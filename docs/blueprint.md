# **App Name**: LabFlow

## Core Features:

- Multi-Language Support: The UI supports both English (EN) and Arabic (AR), including Right-to-Left (RTL) layout for Arabic, with persistent language selection per user.
- Patient Registration: Registers new patients, searches for existing patients to avoid duplicates. The app records patient ID (auto-generated), Full Name, Date of Birth, Gender, Phone Number, and National ID/Passport No.
- Order Creation: Allows receptionists to create new orders by selecting an existing patient or registering a new one and choosing lab tests from a searchable list, auto-calculating the total price. User must be able to assign a referring doctor to the order.
- Barcode Generation & Printing: Generates a unique barcode for each sample tube required for the order upon creation. The application will be able to print these barcodes to standard label sizes.
- Sample Status Tracking: Technicians update sample statuses (Awaiting Sample, Sample Collected, In-Progress, Awaiting Validation, Completed) by scanning a barcode. They can also update status manually.
- PDF Report Generation: Generate professional, printable PDF reports including: lab logo & contact info, patient details, order details, test results with reference ranges, comments/interpretations, and an optional QR code linking to a secure online version.
- Inventory Management & Low Stock Alerts: The system generates a notification and displays a warning when stock for an item falls below its minimum level. System admin sets this level in the tool.
- Test Information Page: Page to record tests info for example test names,price,normal ranges,tools and kits that uses in test from inventory kits,time for test result,etc
- Management Page: Management page that contains Test Information, Inventory Information, and any other management-related features.
- UI Skeleton & Foundation: Build the Complete UI Skeleton with Specific Style Guidelines.

## Style Guidelines:

- Alternative Primary color: Dark blue (#2c3e50) for a professional and trustworthy feel.
- Alternative Background color: Light gray (#ecf0f1), a subtle and clean backdrop.
- Alternative Accent color: Orange (#e67e22) to highlight key actions and elements.
- Body and headline font: 'Open Sans', a versatile and readable font for all text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, outline-style icons in the accent color for a modern look.
- Maintain a clean, grid-based layout with clear visual hierarchy for data presentation. Use Tailwind CSS breakpoints (sm, md, lg, xl) for responsiveness, collapsing sidebar on mobile.