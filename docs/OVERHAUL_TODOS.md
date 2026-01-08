# Incentive 5: DonorConnect — Detailed Requirements Checklist (Mapped to This Repo)

**Context**
- Assignment: **Incentive 5: DonorConnect**
- Due: **Thursday January 15th, 11:59pm (Beacon)**
- Repo: DonorConnect (Next.js App Router + PostgreSQL + Prisma)
- This document is a **grading-oriented checklist**: it lists each requirement, what evidence is expected, what’s already present in your codebase, and what remains.

> Status key:
> - ✅ Done: clearly implemented and visible in code/UI
> - 🟡 Partial: present but missing required details or incomplete flows
> - ❌ Missing: not yet implemented or not verifiable

---

## 1) What you are being assessed on

### 1.1 Build a working MVP with multiple pages (CCC.1.3)
**Requirement**
- The app must be a working MVP and include multiple pages.

**Evidence expected by an assessor**
- Multiple navigable pages/routes (not just tabs/sections).
- Core workflows work end-to-end (view data, create data, see it persist).

**Repo status**: ✅ / 🟡 (depends on rubric-page requirements below)
- ✅ You already have multiple dashboard pages under `src/app/(dashboard)` and navigation in the sidebar.
- 🟡 Your required public “web server” pages (Home/About/Why/Evidence/Reflection) are not currently present as real content pages, so the MVP may be considered incomplete relative to the specific prompt.

### 1.2 Integrate AI tools into workflow or product (TS.6.3)
**Requirement**
- At least one AI integration must exist (either as an internal feature in the app or clearly documented as part of workflow/product).

**Evidence expected**
- A visible AI feature (UI) OR an API route that calls an AI model.
- Documentation: model/provider, prompt strategy, and how it improves the solution.

**Repo status**: ❌ Missing (no AI provider deps or AI feature code found in `src/`).

### 1.3 Use AI responsibly (TS.6.2)
**Requirement**
- You must explain responsible use of AI in your product:
  - What data is shared
  - How privacy is protected
  - Limitations/bias awareness
  - Human review and safe usage

**Evidence expected**
- A short written policy section (ideally in the app on the Evidence page and/or README).

**Repo status**: ❌ Missing.

### 1.4 Allow nonprofit staff to view/manage donors
**Requirement**
- Staff can view donors and manage them (at minimum: list + create; ideally view details/edit/delete).

**Evidence expected**
- Donor list page.
- Add donor form (2+ fields).
- Confirmation that data saved.
- Persistence (DB/API).
- Optional but strong: donor detail page + edit/delete.

**Repo status**: 🟡 Partial
- ✅ Donor list page exists.
- ✅ Add donor form exists (multiple fields).
- ✅ Persists to DB through `/api/donors`.
- 🟡 Donor detail page and “manage” flows appear incomplete.

### 1.5 Allow nonprofit staff to record/view donations
**Requirement**
- Staff can record donations and view donation history.

**Evidence expected**
- Donations list page.
- Form to add a donation.
- Donation connected to a donor.
- Confirmation data saved.

**Repo status**: 🟡 Partial
- ✅ Donations list exists.
- ✅ Record donation flow exists.
- ✅ Donations are connected to donors (donor selector + donorId saved).
- 🟡 Some donation endpoints are incomplete; donation list page fields do not match the rubric’s specified columns (see section 3.5).

### 1.6 Role-based access (admin) OR clearly defined admin-only features
**Requirement**
- You must include RBAC (admin) OR a clearly defined admin-only feature.

**Evidence expected**
- “Admin-only” behavior is enforced server-side (API checks), not only UI.
- UI communicates what’s restricted.

**Repo status**: 🟡 Partial
- Some role checks exist (e.g., READONLY blocked from creating donors).
- Admin-only delete restrictions are not consistently implemented across endpoints.

### 1.7 Be deployed live (Vercel) and publicly accessible
**Requirement**
- The app must be deployed to Vercel and accessible publicly.

**Evidence expected**
- Live URL.
- Works end-to-end against a real database.

**Repo status**: ❌ Not verifiable from code
- Deployment is not something the repo can prove; you must provide the URL and configure env vars in Vercel.

### 1.8 Use real data structures (not placeholder text only)
**Requirement**
- Use a real database or structured storage.

**Evidence expected**
- DB schema + persisted data + pages reading from it.

**Repo status**: ✅ Done
- Prisma schema + seed exists.
- Dashboard and lists fetch from API routes backed by Prisma.

---

## 2) Required artifacts to submit (README)

### 2.1 README.md must-haves
**Requirement**
- Explain the project clearly.
- Include:
  - Project overview
  - Feature list (including AI usage)
  - Tech stack (Next.js, etc.)
  - How to run the app

**Evidence expected**
- README reads like a submission deliverable (not only a starter template).

**Repo status**: 🟡 Partial
- README exists but currently reads like an educational starter overview.
- Missing: explicit AI feature description, responsible AI statement, and deployment link(s).

**Minimum README sections to add/ensure**
- Overview (problem + solution in 1–3 paragraphs)
- Features (bulleted) including the AI feature
- Tech stack (Next.js 16, React 19, Prisma 7, PostgreSQL, etc.)
- How to run (install, env vars, migrate/seed, `pnpm dev`)
- Demo login credentials (if applicable)
- Deployment link (Vercel)
- AI responsibility note (what data is sent, limitations, etc.)

---

## 3) Required pages (Configure a Web Server)

Your prompt lists specific pages and exact content each MUST include. This section is the most important for strict compliance.

### 3.1 Home page
**Purpose**: Explain what the app is and why it exists.

**Must include**
- App name
- One-sentence problem statement
- One-sentence solution statement
- Button/link to start using the app
- Navigation to all main pages

**Repo status**: ❌ Missing as specified
- The root route currently redirects (and contains placeholder text) rather than presenting the required Home content.

**Minimum implementation expectation**
- A public, contentful home page with the required copy and navigation.
- If you still want redirect behavior for signed-in users, the page can show content and conditionally show “Go to dashboard” when logged in.

### 3.2 About / Problem page (CCC.1.1)
**Purpose**: Prove you understand the problem.

**Must include**
- Problem explained in your own words
- Why this problem matters for nonprofits
- Who is affected
- What happens if not solved
- One concrete example of why your app is different from existing solutions

**Repo status**: ❌ Missing

**Suggested content checklist (write in plain language)**
- Problem: fragmented donor data + missed follow-ups
- Why it matters: donor retention + funding stability
- Who: development staff, EDs, board, donors receiving inconsistent communication
- If unsolved: reduced second-gift conversion, lost revenue, poor reporting
- Differentiator example: “first-to-second gift” retention focus + risk levels + follow-up prompts

### 3.3 Why DonorConnect page (CCC.1.2)
**Purpose**: Show planning and reasoning.

**Must include**
- Your solution idea (what your app does and why)
- Key features and why you chose them
- Challenges expected and how you planned for them
- Summary of your system (pages + data)

**Repo status**: ❌ Missing

**Suggested content checklist**
- Solution idea: central system for donors + donations + retention risk
- Key features: donor CRUD, donation logging, dashboard totals, reports, AI summaries
- Challenges: auth, multi-tenant data, schema design, validation, deployment
- System summary: list each page + which data model it uses

### 3.4 Dashboard page (CCC.1.3)
**Purpose**: Working MVP evidence.

**Must include**
- Summary info (total donors, total donations, etc.)
- Data displayed from DB through API endpoints
- Navigation to donor + donation + other pages

**Repo status**: 🟡 Partial
- ✅ Dashboard page exists and fetches `/api/dashboard/summary`.
- ✅ Navigation exists.
- 🟡 Your dashboard summary currently includes donation totals and recent donations; it may or may not include total donors depending on your endpoint payload.

**Minimum improvements to ensure compliance**
- Include total donors and total donations totals (and/or total raised).
- Ensure data is clearly from your DB via API.

### 3.5 Donors page (CCC.1.3)
**Purpose**: Core working feature.

**Must include**
- List of donors
- Form to add donor (2+ fields)
- Confirmation data saved
- Data persists (database/API/structured storage)

**Repo status**: ✅ Done
- Donor list exists.
- Add donor form exists and persists.

**Notes**
- For grading clarity, make sure there is an obvious success message or UX confirmation (redirect back to list can count, but a toast/snackbar is stronger).

### 3.6 Donations page (CCC.1.3)
**Purpose**: Core working feature.

**Must include**
- List of donations
- A donation must be connected to a donor
- Form to add a donation
- Confirmation that donation data was saved

**Rubric’s listed columns (as provided in prompt)**
- DonorName
- Email
- Total Gifts
- Total Amount
- Risk Level
- Action (edit/delete)

**Repo status**: 🟡 Partial
- ✅ List exists.
- ✅ Add donation exists.
- ✅ Donation connects to donor.
- 🟡 The list currently does NOT show the rubric’s specified donor metrics/risk fields and does not include edit.

**Minimum changes to match prompt exactly (recommended)**
- On the Donations list, include donor email + donor total gifts + total amount + risk level (can come via `include: { donor: true }` if fields are stored, or via additional query/aggregation).
- Provide edit and delete actions, or clearly document why only delete exists.

### 3.7 AI Integration page/feature (TS.6.2–TS.6.3)
**Purpose**: AI-powered feature inside DonorConnect.

**Must include (per prompt)**
- How you are using AI responsibly
- AI APIs and AI model used
- Short explanation of how you’re using AI responsibly
- Explain how you crafted prompts to generate desired results
- How AI improves your solution

**Repo status**: ❌ Missing

**What “counts” as a valid AI integration (examples)**
Pick ONE and implement it well:
- Donor activity summary: “Summarize donor’s donation history + risk, suggest next action.”
- Follow-up drafting: “Generate a polite thank-you/follow-up email draft (human-review required).”
- Risk explanation: “Explain why a donor is marked HIGH/MEDIUM/LOW and propose next steps.”

**Responsible AI must-haves (write these explicitly)**
- Data minimization: only send necessary fields (not full DB dump)
- Privacy: do not send passwords/session tokens; avoid sending full addresses if not needed
- Transparency: label AI output as AI-generated
- Human review: staff must review before sending/acting
- Limitations: may be incorrect; not a substitute for policy/relationship knowledge

### 3.8 Evidence / Rubric page
**Purpose**: Make grading easy with direct evidence.

**Must include**
- A section labeled **CCC.1.3 Evidence**
- A section labeled **TS.6.2 Evidence**
- A section labeled **TS.6.3 Evidence**
- Direct links to GitHub, Vercel, Trello, and wireframes

**Repo status**: ❌ Missing

**Minimum content to include**
- CCC.1.3 Evidence: list working pages + screenshots/short notes; link to deployed app
- TS.6.2 Evidence: responsible AI bullets + what data is sent + safeguards
- TS.6.3 Evidence: model/provider, prompt design notes, where feature appears in app
- Links: GitHub repo URL, Vercel URL, Trello board URL, wireframe URL (Figma, etc.)

### 3.9 Reflection page
**Purpose**: Show learning, growth, decision-making.

**Must include**
- What challenged you most?
- What you would change/add with more time?
- What you learned about building real products?
- How AI helped (or where it didn’t)

**Repo status**: ❌ Missing

---

## 4) Admin-only / RBAC requirements (detailed)

### 4.1 What to implement to satisfy RBAC
You can satisfy the requirement in either of these ways:

**Option A (recommended): clear admin-only feature**
- Example: Only admins can delete donors and/or delete donations.
- Evidence: UI shows delete button only for admin; API enforces admin check.

**Option B: full RBAC across major endpoints**
- Admin: full CRUD
- Staff: create/update
- Readonly: view only

### 4.2 What “good” evidence looks like
- A short paragraph on the Evidence page:
  - “Admin-only feature: deleting donations is restricted to ADMIN. Staff can record donations but cannot delete.”
- A quick demo scenario:
  - Log in as staff → cannot delete
  - Log in as admin → can delete

**Repo status**: 🟡 Partial
- Some role checks exist.
- Not consistent across donors/donations endpoints.

---

## 5) AI integration requirements (detailed)

This section is specifically to help you satisfy TS.6.2 + TS.6.3 with strong documentation.

### 5.1 Required AI documentation fields (copy/paste checklist)
- **Feature name**: (e.g., “Donor Summary Assistant”)
- **Where it appears**: (e.g., Donor detail page, Reports page)
- **User goal**: (what staff can do faster/better)
- **Inputs sent to AI**: list the exact fields (e.g., donor name, last gift date, total amount)
- **What is NOT sent**: passwords, session tokens, internal IDs not needed, full addresses
- **Model/provider**: (e.g., OpenAI `gpt-4o-mini`, Anthropic Claude, etc.)
- **API key storage**: env var in Vercel (never committed)
- **Prompt strategy**:
  - system rules (tone/constraints)
  - user message with structured JSON
  - output format (bullets, recommended next action)
- **Safety/responsibility**:
  - disclaimers
  - human review
  - limitations and possible errors

### 5.2 Prompt crafting guidance (what graders want to see)
- You used structured inputs instead of free-form.
- You constrained output format.
- You included guardrails (no sensitive data; be concise; cite what data used).

---

## 6) Deployment requirements (Vercel)

### 6.1 What you must do (non-code)
- Deploy to Vercel.
- Set environment variables in Vercel:
  - `DATABASE_URL`
  - (AI key) e.g., `OPENAI_API_KEY` or provider equivalent

### 6.2 What to document
- Put the Vercel URL in:
  - Evidence page
  - README

**Repo status**: ❌ Not verifiable here

---

## 7) Minimum “submit-ready” checklist (prioritized)

If you want the shortest path to full compliance, prioritize in this order:

1. **Create the required public pages**: Home, About/Problem, Why DonorConnect, Evidence/Rubric, Reflection.
2. **Add 1 AI feature + documentation** (model/provider, responsible AI, prompt explanation).
3. **Lock down one admin-only feature** and document it (API + UI).
4. **Ensure Donations page matches the rubric fields** (or add a clear equivalent view).
5. **Update README to match submission expectations** (overview, features, AI, tech stack, run steps, deployed link).
6. **Deploy to Vercel and include the links**.

---

## 8) Notes specific to your current repo

### 8.1 Current homepage does not meet the assignment Home-page requirements
- Your root page is a redirect rather than a content page with problem/solution/nav.

### 8.2 Some endpoint handlers are still TODO
- Donor-by-id endpoints appear incomplete.
- Donation-by-id endpoints are partially TODO.

### 8.3 Reports page currently expects a non-paginated donations response
- Your donations API supports both paginated object response and plain-array response depending on query params; make sure this remains consistent if you adjust endpoints later.

---

## 9) Quick “grading script” (what an instructor will likely do)

An instructor often checks:
1. Open the deployed link → sees a Home page explaining the app.
2. Navigate to About/Why pages → sees clear reasoning and problem understanding.
3. Log in → dashboard loads real totals.
4. Go to Donors → create a donor → it persists.
5. Go to Donations → record a donation tied to donor → it persists.
6. See AI feature in action and read AI responsibility explanation.
7. Visit Evidence page → quickly find CCC/TS evidence + links.
8. Read Reflection page.

If any of those steps is missing, that’s usually where points are lost.
