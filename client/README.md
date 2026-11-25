# CampusResolve AI 🚀
### Smart Campus Resource & Complaint Management System with AI Assistance
> *"Smarter Campus. Faster Resolutions."*

A centralized web-based Smart Campus Resource and Complaint Management platform built using the MERN stack with tailored AI assistance.

---

## 📌 Complaint Review and Resolution Workflow

New complaints are held for administrator review. Staff cannot see a complaint until it is approved and assigned to them.

```
                  ┌────────────────────────┐
                  │ 1. Student Reports     │
                  │ (Form or AI Assistant) │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Status: PENDING REVIEW │
                  │ (Admin only)           │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ 2. Admin Approves or   │
                  │ Rejects the complaint  │
                  └───────────┬────────────┘
                              │
                     Approved│
                               ▼
                  ┌────────────────────────┐
                  │ Status: PENDING        │
                  │ Awaiting assignment    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ 3. Admin Assigns Staff │
                  │ (Selects technician)   │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Status: ASSIGNED       │
                  │ (Assigned staff only)  │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ 4. Staff Starts Work   │
                  │ (Status: IN PROGRESS)  │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ 5. Staff Adds Remarks  │
                  │ & Marks as RESOLVED    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ 6. Student Verifies    │
                  │ (5-Star Rating & Closes│
                  │  Status: VERIFIED)     │
                  └────────────────────────┘
```

---

## 👥 The 3 User Roles

1. **Student**
   - Submit complaints via standard form with image upload.
   - Or talk with the conversational **AI Complaint Assistant** to auto-generate tickets.
   - On-demand AI complaint categorization (`🤖 AI Detected`).
   - Track live vertical 5-stage progress timeline.
   - Verify resolution with 1–5 star rating and feedback comments.

2. **Administrator**
   - Central control hub monitoring all campus complaints.
   - Approves or rejects student complaints before assignment.
   - Department workload balancing and staff ticket assignment.
   - Receives live in-app notifications when complaints are submitted.
   - Staff directory and technician availability management.
   - Executive SLA and turnaround time analytics with Recharts.
   - Printable compliance reports and CSV exports.

3. **Staff Technician**
   - Receives live notifications and sees only tickets assigned to their account after admin approval.
   - Commences on-site repair work (transitions status to *In Progress*).
   - Posts progress inspection remarks and replacement parts logs.
   - Marks complaints as *Resolved* once physical fix is complete.

---

## 🤖 The Two AI Features (Strictly Scoped)

1. **AI Feature 1: AI Complaint Assistant / Chatbot**
   - Natural language conversational intake.
   - Clarifies missing location (e.g. asking for room/hostel number).
   - Asks for details if description is too brief.
   - Generates an interactive **Complaint Summary Card** (`Title`, `Description`, `Location`, `AI Detected Category`) with `[ Edit Details ]` and `[ Submit Complaint ]` buttons.

2. **AI Feature 2: Complaint Analysis**
   - Gemini classifies complaints across all 10 campus categories and flags potentially unrelated or spam submissions.
   - Analysis runs when the student clicks **Analyze Complaint**, not on each typing pause.
   - AI flags are advisory and are not proof that a complaint is fake.
   - Categories include:
     *Electrical, Plumbing, WiFi / Internet, Cleanliness, Infrastructure, Hostel, Classroom, Security, Transport, Other*.

---

##  Demo Walkthrough Guide

Use server-backed student, administrator, and staff accounts to demonstrate the workflow:

1. **Step 1 (Student View)**:
   - Go to **AI Assistant** (`/student/ai-assistant`) or **Create Complaint** (`/student/create`).
   - Submit an issue (e.g., *"Ceiling fan is making loud squeaking noise and stopping after 5 minutes in Room 204"*).
   - Analyze the complaint, then submit it. It appears with status **`Pending Review`**.

2. **Step 2 (Admin View)**:
   - Open **All Complaints** (`/admin/complaints`).
   - Approve the new ticket. It moves to **`Pending`** (approved, awaiting assignment).
   - Assign an active staff account, then click **Assign Complaint**.
   - The ticket status transitions to **`Assigned`**.

3. **Step 3 (Staff View)**:
   - Sign in as the assigned staff account and open **Assigned Complaints**.
   - Click **Start Work** (status changes to **`In Progress`**).
   - Click **Add Remarks**, enter *"Replaced burnt capacitor and oiled motor bearing"*, and choose **Mark as Resolved**.
   - The ticket status transitions to **`Resolved`**.

4. **Step 4 (Student Verification)**:
   - Sign back in as the submitting student and open the ticket details page.
   - The green **Resolution Verification Required** banner is now visible: *"Are you satisfied with the resolution?"*.
   - Click **Verify Resolution**, rate 5 stars, leave a comment (*"Fan is working smoothly now, thank you!"*), and submit.
   - The ticket lifecycle is now completed with status **`Verified`**!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router DOM v7, Tailwind CSS, Lucide React, Recharts, React Hot Toast, Axios.
- **Backend Ready**: Node.js, Express.js, MongoDB, Mongoose, JWT, Cloudinary.

---

## 🚀 Running the Project

### Backend setup
1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, `GEMINI_API_KEY`, and a random `JWT_SECRET` (at least 32 characters recommended).
2. If no administrator account exists, set the `ADMIN_*` values in `server/.env`, run `npm run seed:admin` from `server/`, then remove those temporary `ADMIN_*` values.
3. Keep the backend running while students and staff register or sign in. The local demo login is not a server-authenticated account and cannot use protected review, assignment, or SSE notification APIs.

### Frontend:
```bash
cd client
npm start
```
Runs at `http://localhost:3000`.

### Backend:
```bash
cd server
npm run dev # or node server.js
```
Runs at `http://localhost:5000`.
