# AI AGENT PROMPT — BASIC JOURNAL PUBLISHING WEBSITE

## 1. Project Overview

You are an expert Senior Full-Stack Next.js Developer, UI/UX Designer, Database Architect, and Academic Journal Publishing System Specialist.

Build a complete, professional, modern, responsive **Academic Journal Publishing Website with an Admin Dashboard**.

The application must be fully functional, database-driven, secure, and suitable for real-world deployment.

**Project:** Basic Journal Publishing Website  
**Frontend:** Next.js App Router, React, TypeScript  
**Backend:** Next.js Route Handlers and Server Actions  
**Database:** MongoDB  
**ODM:** Mongoose  
**Styling:** Tailwind CSS  
**UI Components:** shadcn/ui  
**Icons:** Lucide React  
**Authentication:** Auth.js (NextAuth) with admin-only authentication  
**Validation:** Zod  
**Forms:** React Hook Form  
**PDF Storage:** Secure server-side file storage  
**Deployment:** Vercel or Node.js-compatible hosting

### Main Goal

Create a professional academic journal publishing platform where:

- Visitors can explore published research articles.
- Authors can submit manuscripts without registering.
- Authors can upload manuscript PDFs.
- Administrators can manually review submissions.
- Administrators can manage journal volumes and issues.
- Administrators can publish articles.
- Visitors can download published research PDFs.
- Administrators can configure external payment links.
- Administrators manually confirm payments.
- Administrators can manage website content.

Do not implement unnecessary advanced publishing workflows.

---

# 2. TECHNICAL ARCHITECTURE

## Frontend

Use:

- Next.js App Router.
- React and TypeScript.
- Tailwind CSS.
- shadcn/ui components.
- Lucide React icons.
- Responsive layouts.
- Server Components where appropriate.
- Client Components for interactive features.

## Backend

Use Next.js backend capabilities:

- Route Handlers under `app/api/`.
- Server Actions where appropriate.
- Secure server-side validation.
- Authentication middleware or route guards.
- Centralized error handling.
- REST-style endpoints.
- File upload processing.
- Database operations using Mongoose.

Do not create a separate Express.js application.

## Database

Use MongoDB with Mongoose ODM.

Requirements:

- Centralized database connection utility.
- Reusable Mongoose models.
- TypeScript interfaces.
- Schema validation.
- Indexed fields.
- Database relationships using ObjectId references.
- Timestamps on important records.
- Proper error handling.
- Avoid duplicate database connections during development.

## Authentication

Implement authentication for administrators only.

Use Auth.js with a Credentials provider or another secure admin authentication approach.

Requirements:

- Admin login.
- Secure password hashing using bcrypt.
- Server-side authentication.
- Protected admin routes.
- Secure session handling.
- Logout functionality.
- Unauthorized access prevention.

Do not create author registration, author login, or reviewer accounts.

---

# 3. PUBLIC WEBSITE PAGES

Build the following pages.

## PAGE 1 — HOME

Create a premium academic journal homepage.

### Header Navigation

- Home.
- About Journal.
- Editorial Board.
- Current Issue.
- Archives.
- Submit Manuscript.
- Author Guidelines.
- Contact Us.

Add a prominent Submit Manuscript button.

### Hero Section

Heading:

"Advancing Research. Sharing Knowledge. Inspiring Innovation."

Description:

"A professional academic publishing platform dedicated to advancing scholarly research and promoting knowledge sharing."

Buttons:

- Submit Your Manuscript.
- Explore Published Articles.

### Journal Information

Display dynamically:

- Journal Name.
- ISSN.
- Publisher.
- Publication Frequency.
- Open Access Information.

### Homepage Sections

1. Hero Banner.
2. Journal Introduction.
3. Current Issue.
4. Recently Published Articles.
5. Aims and Scope.
6. Why Publish With Us.
7. Submission Call-to-Action.
8. Footer.

Retrieve published article data from MongoDB.

---

## PAGE 2 — ABOUT JOURNAL

Display:

- Journal Overview.
- Aims and Scope.
- Mission and Objectives.
- Publication Frequency.
- Open Access Policy.
- Peer Review Policy.
- Publication Ethics.
- Copyright and Licensing.
- Publisher Information.

All content should be editable from the admin dashboard.

---

## PAGE 3 — EDITORIAL BOARD

Display editorial members.

Each member should have:

- Name.
- Academic Title.
- Role.
- Institution.
- Country.
- Specialization.
- Profile Image.

Support:

- Editor-in-Chief.
- Managing Editor.
- Associate Editors.
- Editorial Board Members.

Display member information from MongoDB.

---

## PAGE 4 — CURRENT ISSUE

Display the currently published journal issue.

Include:

- Journal Cover.
- Volume Number.
- Issue Number.
- Publication Date.
- Issue Description.
- Published Articles.

Each article should display:

- Article Title.
- Authors.
- Abstract Preview.
- Keywords.
- Publication Date.
- View Article.
- Download PDF.

---

## PAGE 5 — JOURNAL ARCHIVES

Create a dynamic publication archive.

### Features

- Browse by Year.
- Browse by Volume.
- Browse by Issue.
- Search Articles.
- Filter Publications.

Example:

2026
- Volume 4, Issue 1.
- Volume 4, Issue 2.

2025
- Volume 3, Issue 1.
- Volume 3, Issue 2.

All information must come from MongoDB.

Use SEO-friendly dynamic routes.

---

## PAGE 6 — ARTICLE DETAILS

Dynamic route:

`/articles/[slug]`

Display:

- Article Title.
- Authors.
- Affiliations.
- Abstract.
- Keywords.
- Publication Date.
- Volume.
- Issue.
- PDF Download.
- Citation Information.
- DOI (optional).

Include a Copy Citation button.

Only published articles should be publicly accessible.

---

## PAGE 7 — SUBMIT MANUSCRIPT

Build a functional online manuscript submission system.

No author account is required.

### Author Information

- Full Name.
- Email.
- Phone.
- Institution.
- Department.
- Country.

### Manuscript Information

- Manuscript Title.
- Manuscript Type.
- Research Category.
- Abstract.
- Keywords.
- Co-Authors.

### PDF Upload

Requirements:

- PDF files only.
- Maximum 10 MB.
- Server-side file validation.
- Secure file storage.
- Store file metadata in MongoDB.
- Store the file itself in private object storage or another secure production-compatible storage service.
- Never place unpublished manuscripts in a publicly accessible directory.

### Author Declaration

Checkboxes:

- Original Work Confirmation.
- Not Submitted Elsewhere.
- Agreement to Author Guidelines.
- Privacy Policy Consent.

### Submission Workflow

When an author submits:

1. Validate the form with Zod.
2. Validate uploaded PDF type and size on the server.
3. Upload PDF securely.
4. Generate a unique submission reference.
5. Create manuscript record in MongoDB.
6. Set status to Submitted.
7. Display submission confirmation.

Example:

"Your manuscript has been submitted successfully. Our editorial team will contact you after reviewing your manuscript."

Display submission reference number.

Do not create an author dashboard.

Implement basic rate limiting and spam protection for public submission endpoints.

---

## PAGE 8 — AUTHOR GUIDELINES

Create sections for:

- Manuscript Preparation.
- Article Formatting.
- Abstract Guidelines.
- Keywords.
- References.
- Publication Ethics.
- Submission Instructions.
- Review Process.
- Publication Fees.

Show the process:

Submission → Manual Editorial Review → Decision → Payment (If Applicable) → Publication

---

## PAGE 9 — PUBLICATION FEES

Create a configurable publication fee page.

Display:

- Article Processing Charge.
- Currency.
- Payment Methods.
- Payment Instructions.
- External Payment Link.

The Pay Publication Fee button should redirect users to the configured external payment provider.

Admin manages payment information manually.

Do not implement payment gateway APIs or payment webhooks.

Do not automatically confirm payments.

---

## PAGE 10 — CONTACT US

Display:

- Journal Email.
- Contact Phone.
- Address.
- Contact Form.

Form fields:

- Name.
- Email.
- Subject.
- Message.

Save contact submissions in MongoDB.

Admin should be able to view and manage messages.

---

# 4. ADMIN DASHBOARD

Create a professional, secure admin dashboard.

Base route:

`/admin`

Use a modern SaaS dashboard layout.

### Sidebar

1. Dashboard.
2. Manuscript Submissions.
3. Published Articles.
4. Volumes & Issues.
5. Editorial Board.
6. Website Content.
7. Payment Settings.
8. Contact Messages.
9. Journal Settings.
10. Logout.

---

## MODULE 1 — DASHBOARD

Display real database statistics:

- Total Submissions.
- Pending Submissions.
- Under Review.
- Accepted Manuscripts.
- Published Articles.
- Total Volumes.
- Total Issues.

Include:

- Recent Submissions.
- Recent Publications.
- Basic Publishing Statistics.
- Quick Action Buttons.

Use efficient MongoDB queries and aggregation where appropriate.

---

## MODULE 2 — MANUSCRIPT MANAGEMENT

Build a complete manuscript management table.

Columns:

- Submission ID.
- Manuscript Title.
- Author.
- Email.
- Submission Date.
- Status.
- Payment Status.
- Actions.

### Admin Actions

- View Submission.
- View PDF.
- Download PDF.
- Edit Metadata.
- Update Review Status.
- Add Internal Notes.
- Update Payment Status.
- Delete Submission.
- Select Manuscript for Publication.

### Statuses

- Submitted.
- Under Review.
- Revision Requested.
- Accepted.
- Rejected.
- Published.

Status changes must be performed manually by the admin.

Implement secure authenticated PDF access.

---

## MODULE 3 — ARTICLE MANAGEMENT

Admin can:

- Create Article.
- Edit Article.
- Delete Article.
- Upload Article PDF.
- Replace Article PDF.
- Assign Volume.
- Assign Issue.
- Save Draft.
- Publish Article.
- Unpublish Article.

### Article Fields

- Title.
- Slug.
- Authors.
- Affiliations.
- Abstract.
- Keywords.
- Category.
- Volume.
- Issue.
- Publication Date.
- PDF File.
- DOI (optional).
- Publication Status.

When an article is published, it should appear on the public website in the correct issue.

---

## MODULE 4 — VOLUME & ISSUE MANAGEMENT

Admin can manage journal volumes and issues.

### Volume

Fields:

- Volume Number.
- Year.
- Description.

### Issue

Fields:

- Issue Number.
- Volume.
- Issue Title.
- Publication Date.
- Cover Image.
- Description.
- Publication Status.

Admin actions:

- Create.
- Edit.
- Delete.
- Publish.
- Unpublish.
- Assign Articles.

Maintain proper database relationships.

---

## MODULE 5 — EDITORIAL BOARD MANAGEMENT

Create complete CRUD functionality.

Fields:

- Full Name.
- Academic Title.
- Role.
- Institution.
- Country.
- Specialization.
- Profile Image.
- Display Order.

Allow admin to manage editorial board members dynamically.

---

## MODULE 6 — WEBSITE CONTENT MANAGEMENT

Admin can edit:

- Homepage Hero Heading.
- Homepage Description.
- About Journal.
- Aims and Scope.
- Journal Policies.
- Author Guidelines.
- Contact Information.
- Homepage Sections.

Use a simple content management interface.

A complex visual page builder is not required.

---

## MODULE 7 — PAYMENT MANAGEMENT

Admin can configure:

- Article Processing Charge.
- Currency.
- Payment Provider.
- External Payment URL.
- Payment Instructions.

Admin can also manually update manuscript payment statuses:

- Not Required.
- Pending.
- Paid.
- Waived.

No automated payment verification.

---

## MODULE 8 — CONTACT MESSAGES

Admin can:

- View Messages.
- Mark as Read.
- Delete Messages.

Show:

- Sender Name.
- Email.
- Subject.
- Message.
- Date.
- Status.

---

## MODULE 9 — JOURNAL SETTINGS

Editable fields:

- Journal Name.
- Short Name.
- Logo.
- Journal Cover.
- ISSN.
- Publisher Name.
- Publication Frequency.
- Journal Email.
- Phone.
- Address.
- Primary Color.
- Secondary Color.
- Footer Information.

Changes must reflect on the public website.

---

# 5. MONGOOSE DATABASE MODELS

Create the following Mongoose models.

## User Model

For admin authentication.

Fields:

```ts
{
  name: string;
  email: string;
  passwordHash: string;
  role: "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Manuscript Model

```ts
{
  submissionId: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  institution: string;
  department?: string;
  country: string;

  title: string;
  manuscriptType: string;
  category: string;
  abstract: string;
  keywords: string[];
  coAuthors: Array<{
    name: string;
    affiliation?: string;
  }>;

  pdfFile: {
    storageKey: string;
    originalName: string;
    mimeType: string;
    size: number;
  };

  status:
    | "submitted"
    | "under_review"
    | "revision_requested"
    | "accepted"
    | "rejected"
    | "published";

  paymentStatus:
    | "not_required"
    | "pending"
    | "paid"
    | "waived";

  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Article Model

```ts
{
  title: string;
  slug: string;
  authors: Array<{
    name: string;
    affiliation?: string;
  }>;

  abstract: string;
  keywords: string[];
  category: string;

  volume: ObjectId;
  issue: ObjectId;

  publicationDate?: Date;
  pdfFile?: {
    storageKey: string;
    originalName: string;
    mimeType: string;
    size: number;
  };

  doi?: string;
  status: "draft" | "published";

  sourceManuscript?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
```

## Volume Model

```ts
{
  volumeNumber: number;
  year: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Issue Model

```ts
{
  issueNumber: number;
  volume: ObjectId;
  title: string;
  description?: string;
  coverImage?: string;
  publicationDate?: Date;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}
```

## EditorialBoard Model

```ts
{
  name: string;
  academicTitle?: string;
  role: string;
  institution: string;
  country?: string;
  specialization?: string;
  photo?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## JournalSettings Model

```ts
{
  journalName: string;
  shortName?: string;
  issn?: string;
  publisherName?: string;
  description?: string;
  publicationFrequency?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  paymentFee?: number;
  paymentCurrency?: string;
  paymentProvider?: string;
  paymentLink?: string;
  paymentInstructions?: string;
}
```

## PageContent Model

```ts
{
  pageKey: string;
  title?: string;
  content: string;
  updatedAt: Date;
}
```

## ContactMessage Model

```ts
{
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
```

Use Mongoose references, appropriate indexes, unique constraints, schema validation, and timestamps.

---

# 6. APPLICATION ROUTES

Use the following Next.js route structure.

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   ├── editorial-board/page.tsx
│   │   ├── current-issue/page.tsx
│   │   ├── archives/page.tsx
│   │   ├── articles/[slug]/page.tsx
│   │   ├── submit-manuscript/page.tsx
│   │   ├── author-guidelines/page.tsx
│   │   ├── publication-fees/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── submissions/page.tsx
│   │       ├── submissions/[id]/page.tsx
│   │       ├── articles/page.tsx
│   │       ├── articles/new/page.tsx
│   │       ├── articles/[id]/edit/page.tsx
│   │       ├── volumes/page.tsx
│   │       ├── issues/page.tsx
│   │       ├── editorial-board/page.tsx
│   │       ├── content/page.tsx
│   │       ├── payments/page.tsx
│   │       ├── messages/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── submissions/route.ts
│   │   ├── submissions/[id]/route.ts
│   │   ├── submissions/[id]/pdf/route.ts
│   │   ├── articles/route.ts
│   │   ├── articles/[id]/route.ts
│   │   ├── articles/[id]/pdf/route.ts
│   │   ├── volumes/route.ts
│   │   ├── issues/route.ts
│   │   ├── editorial-board/route.ts
│   │   ├── settings/route.ts
│   │   ├── content/route.ts
│   │   └── contact/route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── journal/
│   ├── forms/
│   └── admin/
│
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── storage.ts
│   ├── validations/
│   └── utils.ts
│
├── models/
│   ├── User.ts
│   ├── Manuscript.ts
│   ├── Article.ts
│   ├── Volume.ts
│   ├── Issue.ts
│   ├── EditorialBoard.ts
│   ├── JournalSettings.ts
│   ├── PageContent.ts
│   └── ContactMessage.ts
│
├── scripts/
│   ├── seed.ts
│   └── create-admin.ts
│
└── types/
```

Use route groups and layouts appropriately.

---

# 7. API REQUIREMENTS

Create secure APIs for required operations.

### Public APIs

- Submit manuscript.
- Retrieve published articles.
- Retrieve published issues.
- Retrieve published volumes.
- Retrieve editorial board.
- Retrieve public journal settings.
- Submit contact message.
- Download published article PDFs.

### Admin APIs

- List manuscript submissions.
- Retrieve individual manuscript.
- Update manuscript status.
- Update payment status.
- Download private manuscript.
- Create/edit/delete articles.
- Publish/unpublish articles.
- Manage volumes and issues.
- Manage editorial board.
- Update website content.
- Update journal settings.
- Manage contact messages.

### Security

- Validate all incoming input with Zod.
- Verify admin authorization server-side.
- Never expose private manuscript files publicly.
- Protect mutation endpoints.
- Avoid exposing sensitive admin notes.
- Validate uploaded files.
- Prevent unauthorized file downloads.
- Rate-limit public submission and contact APIs.
- Return appropriate HTTP status codes.
- Sanitize or safely render user-supplied rich text.

---

# 8. FILE STORAGE

Manuscript PDFs must not be saved in LocalStorage.

Use secure server-side file storage.

Preferred production approach:

- Private S3-compatible object storage for uploaded manuscripts.
- Store file metadata and object keys in MongoDB.
- Deliver unpublished manuscripts through authenticated endpoints or short-lived signed URLs.
- Publish approved article PDFs separately through controlled public access.
- Use unique file identifiers to avoid filename collisions.

Ensure PDF files remain available across deployments.

Do not rely on Vercel's temporary filesystem for permanent uploads.

---

# 9. DESIGN SYSTEM

Create a premium academic publishing interface.

### Colors

- Navy: `#102A43`
- Royal Blue: `#1769AA`
- Teal: `#0C8B83`
- Light Background: `#F5F8FC`
- White: `#FFFFFF`
- Dark Text: `#243447`

### Fonts

- Headings: Merriweather.
- Body: Inter.

### Design Requirements

- Elegant academic appearance.
- Professional navigation.
- Beautiful journal hero section.
- Modern publication cards.
- Attractive journal issue covers.
- Responsive article listing.
- Professional admin dashboard.
- Clean form interfaces.
- Consistent spacing.
- Subtle animations.
- Skeleton loading states.
- Empty states.
- Toast notifications.
- Error messages.
- Accessible color contrast.

Use shadcn/ui components for admin forms, dialogs, tables, and other appropriate interactions.

---

# 10. BASIC SEO

Implement:

- Next.js Metadata API.
- Dynamic page titles.
- Meta descriptions.
- Open Graph metadata.
- Canonical URLs.
- Semantic HTML.
- Dynamic article metadata.
- Server-rendered publication pages.
- Sitemap generation.
- robots.txt.
- SEO-friendly article slugs.
- ScholarlyArticle structured data where applicable.

Do not invent academic indexing claims, ISSN registrations, impact factors, or DOI identifiers.

---

# 11. SAMPLE DATABASE DATA

Create a seed script with:

- 1 fictional academic journal.
- 1 administrator account created securely from environment variables.
- 6 editorial board members.
- 4 volumes.
- 8 issues.
- 15 published sample articles.
- 8 manuscript submissions.
- Different submission statuses.
- Sample article abstracts.
- Sample research categories.
- Sample journal content.
- 3 contact messages.

Clearly label fictional data as demonstrations.

Use idempotent seed logic to avoid duplicates.

Do not hardcode real admin credentials in source code.

---

# 12. REQUIRED WORKFLOWS

## Author Submission

Visitor → Submission Form → PDF Upload → Server Validation → MongoDB Record → Confirmation

## Manual Review

Admin Login → Manuscript List → View Manuscript → Download PDF → Manual Review → Update Status

## Publication

Admin → Accepted Manuscript → Create Article → Assign Volume & Issue → Publish → Public Website

## Payment

Publication Fee Page → External Payment Link → Payment Outside Website → Admin Manually Updates Payment Status

## Journal Content

Admin → Content Editor → Update Content → MongoDB Save → Public Website Reflects Changes

All workflows must be functional.

---

# 13. FEATURES NOT INCLUDED

Do not implement:

- Author Login & Dashboard.
- Dedicated Reviewer Dashboard.
- Automatic Article Approval.
- Automated Peer Review.
- Reviewer Assignment System.
- Automatic Payment Verification.
- Real-Time Submission Tracking.
- Payment Gateway API Integration.
- Automatic DOI Registration.
- Plagiarism Detection.
- Subscription Billing.
- Advanced Multi-Role Permissions.
- Automated Email Notification System.

Keep the project within the Basic Journal Publishing Website scope.

---

# 14. TESTING REQUIREMENTS

Verify that:

1. Website builds successfully.
2. MongoDB connects successfully.
3. Mongoose models work correctly.
4. Admin authentication functions securely.
5. Protected routes reject unauthorized access.
6. Manuscript submission saves correctly.
7. PDF upload works.
8. Private PDFs are protected.
9. Admin can manage submissions.
10. Admin can update statuses manually.
11. Admin can publish articles.
12. Published articles appear publicly.
13. Unpublished articles stay private.
14. Volume and issue archives work.
15. Search and filtering work.
16. Payment link configuration works.
17. No automatic payment confirmation occurs.
18. Contact form saves messages.
19. Website content changes persist.
20. Responsive layouts work.
21. No TypeScript or build errors remain.

---

# 15. ENVIRONMENT VARIABLES

Create `.env.example` with:

```env
MONGODB_URI=
AUTH_SECRET=
AUTH_URL=

ADMIN_EMAIL=
ADMIN_PASSWORD=

S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

NEXT_PUBLIC_SITE_URL=
```

Use environment variables for secrets and configurations.

Never expose MongoDB credentials, authentication secrets, storage keys, or admin passwords to client-side code.

---

# 16. FINAL DELIVERABLES

Deliver:

1. Complete Next.js project.
2. Professional public journal website.
3. Fully functional admin dashboard.
4. MongoDB and Mongoose integration.
5. Secure admin authentication.
6. Manuscript submission and PDF upload.
7. Manual manuscript review management.
8. Article publication management.
9. Journal volumes and issues.
10. Published article downloads.
11. External payment link configuration.
12. Manual payment management.
13. Website content management.
14. SEO implementation.
15. Sample database seed script.
16. Environment configuration example.
17. Setup and deployment documentation.

Include a README explaining:

- How to install dependencies.
- How to configure MongoDB.
- How to configure secure PDF storage.
- How to create the initial admin user.
- How to seed the database.
- How to run the development server.
- How to build for production.
- How to deploy the application.

---

# 17. FINAL AI AGENT INSTRUCTIONS

Build the complete application, not merely a design mockup.

Use Next.js for both frontend and backend.

Use MongoDB with Mongoose for all application data.

Use a clean, scalable project architecture.

Implement real API endpoints, database operations, authentication, form submission, and admin CRUD operations.

Build every page and management module specified above.

Ensure public visitors can browse and download published articles, authors can submit manuscripts without accounts, and administrators can manually manage the complete journal publishing process.

Do not add advanced features outside the package.

Do not substitute LocalStorage, mock APIs, or hardcoded frontend arrays for real database persistence.

Prioritize functionality, professional design, security, maintainability, and responsive behavior.

**Start implementing the complete production-oriented Basic Journal Publishing Website now.**