# International Journal of Advanced Scientific Research (IJASR)

A complete, production-oriented Academic Journal Publishing Website with an Admin Dashboard built with Next.js (App Router), TypeScript, Tailwind CSS, MongoDB, Mongoose, and NextAuth.

---

## 1. Features Overview

### Public Website
- **Homepage:** Hero banner, dynamic journal metadata (ISSN, publisher, frequency, open access info), current issue highlight, recently published articles grid, research domains, author advantages, and call-to-action.
- **About Journal:** Journal overview, aims and scope, mission and objectives, peer review policy, open access policy (CC BY 4.0), publication ethics (COPE aligned), and copyright details. Editable from the Admin Dashboard.
- **Editorial Board:** Categorized roster of the Editor-in-Chief, Managing Editor, Associate Editors, and International Board Members with institutions, countries, and research specializations.
- **Current Issue:** Current published journal volume and issue with cover info, publication date, issue description, and table of contents.
- **Archives & Search:** Filter by Volume and Issue, keyword search across title, abstract, keywords, and author names, and filter by subject category.
- **Article Details (`/articles/[slug]`):** Full abstract, author affiliations, keywords, publication metadata, DOI link, ScholarlyArticle JSON-LD structured data for academic SEO, formatted citation generator (APA, IEEE, BibTeX with one-click copy), and PDF streaming & downloading.
- **Online Manuscript Submission (`/submit-manuscript`):** Zero-friction submission without author registration. Form validation with Zod, co-authors dynamic list, author warranties and declarations, secure server-side PDF validation and storage, and unique submission reference code generation (e.g. `MS-2026-XXXX`).
- **Author Guidelines:** Preparation guidelines, formatting criteria, citation examples, and a 5-step visual publication workflow.
- **Publication Fees (APC):** Configurable Article Processing Charge, currency, payment provider, instructions, and external payment portal button with manual verification notice.
- **Contact Us:** Direct editorial office contact details and a functional contact inquiry form saved directly into MongoDB.

### Secure Admin Dashboard (`/admin`)
- **Admin-Only Authentication:** NextAuth credentials provider with bcrypt password hashing and server-side route guards.
- **Module 1 — Dashboard:** Real-time database metrics (total submissions, pending reviews, under review, accepted manuscripts, published articles, volumes, issues), recent submissions, and latest publications.
- **Module 2 — Manuscript Management:** Filter by review status and payment status, search, inspect author details, view private PDFs securely in-browser, download PDFs, record internal editorial notes, manually update review decisions, update payment status, and one-click "Publish as Article".
- **Module 3 — Published Articles:** Full CRUD operations for published and draft research papers, volume & issue assignment, slug generation, author management, and PDF uploads/replacements.
- **Module 4 — Volume & Issue Management:** Organize publication years and periodic issues, with publish/unpublish toggles.
- **Module 5 — Editorial Board Management:** Full CRUD management of board members with sorting display orders.
- **Module 6 — Website Content Management (CMS):** Edit homepage hero, about overview, aims & scope, mission, and policies directly from the dashboard.
- **Module 7 — Payment Management:** Configure APC fees, currency, and external payment links (e.g., Stripe, PayPal), and track manuscript payment statuses manually.
- **Module 8 — Contact Messages:** View inquiries from authors and readers, mark as read/unread, delete, and reply via mailto links.
- **Module 9 — Journal Settings:** Manage journal name, acronym, ISSN, publisher, contact address, email, phone, and brand colors.

---

## 2. Technical Stack

- **Framework:** Next.js 16.4.6 (App Router with Turbopack)
- **UI Library:** React 19 (`19.3.1`)
- **Language:** TypeScript 5.7+
- **Styling:** Tailwind CSS v4 (`4.3.5`) via `@tailwindcss/postcss` with custom academic theme palette (Navy `#102A43`, Royal Blue `#1769AA`, Teal `#0C8B83`, Light Background `#F5F8FC`)
- **Typography:** Merriweather (Headings) & Inter (Body)
- **Icons:** Lucide React (`^1.16.0`)
- **Database:** MongoDB
- **ODM:** Mongoose (`^8.12.0`)
- **Authentication:** NextAuth (Auth.js) Credentials Provider with bcryptjs
- **Validation:** Zod (`^3.24.2`)
- **Storage:** Secure server-side storage (private disk at `./storage/uploads` or S3-compatible cloud storage)

---

## 3. Environment Variables

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb://jsmad_admin:JsmadCluster2026!@147.182.217.224:27021/jsmad?authSource=admin
AUTH_SECRET=your-random-32-character-secret-key
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-32-character-secret-key

ADMIN_EMAIL=admin@journal.ac.org
ADMIN_PASSWORD=AdminPassword2026!

# Optional S3 Storage Configuration (if left empty, falls back to secure server-side storage at ./storage/uploads)
S3_ENDPOINT=
S3_REGION=us-east-1
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Setup & Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Ensure MongoDB is Running
Make sure MongoDB is accessible at your `MONGODB_URI` (e.g., local MongoDB service on `127.0.0.1:27017` or MongoDB Atlas).

### Step 3: Seed Sample Database Data
The idempotent seed script populates 1 journal, 1 admin user, 6 editorial board members, 4 volumes, 8 issues, 15 published articles, 8 manuscript submissions with diverse statuses, 3 contact messages, and sample page contents:
```bash
npm run seed
```

Or to create only the admin user:
```bash
npm run create-admin
```

Default Admin Credentials:
- **Email:** `admin@journal.ac.org`
- **Password:** `AdminPassword2026!`

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
The Admin Portal is available at [http://localhost:3000/admin](http://localhost:3000/admin).

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 5. Security & Storage Architecture

1. **Private Manuscript PDFs:**
   - Uploaded manuscript files are saved server-side outside the public web root (`./storage/uploads/manuscripts/` or private S3 bucket).
   - They are only accessible via authenticated route handler `/api/submissions/[id]/pdf`, requiring an active admin session.
2. **Published Article PDFs:**
   - Approved articles are accessible at `/api/articles/[id]/pdf` with standard caching and content-disposition headers.
3. **Admin Route Guards:**
   - The admin layout verifies the NextAuth JWT session server-side. Unauthenticated users are redirected to `/admin/login`.
   - All admin mutation APIs (`/api/submissions`, `/api/articles`, `/api/volumes`, `/api/issues`, `/api/editorial-board`, `/api/content`, `/api/settings`) verify admin sessions.
4. **Rate Limiting & Spam Protection:**
   - Public manuscript submission and contact form endpoints implement sliding-window rate limiting.

---

## 6. License
Published under the MIT License.
