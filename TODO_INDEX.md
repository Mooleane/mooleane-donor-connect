# DonorConnect TODO Index

Complete list of all TODO items in the codebase with direct links to their locations.

## Core Infrastructure (7 TODOs)

### Proxy & Middleware
- [src/proxy.js#L12](src/proxy.js#L12) - Get session token from cookies
- [src/proxy.js#L13](src/proxy.js#L13) - Check if current path requires authentication
- [src/proxy.js#L14](src/proxy.js#L14) - Validate session by calling session API
- [src/proxy.js#L15](src/proxy.js#L15) - Redirect unauthenticated users to login
- [src/proxy.js#L16](src/proxy.js#L16) - Redirect authenticated users away from auth pages
- [src/proxy.js#L17](src/proxy.js#L17) - Preserve intended destination after login

### Toast Notifications (11 TODOs)
- [src/lib/toast.js#L3](src/lib/toast.js#L3) - Implement toast notification system
- [src/lib/toast.js#L9](src/lib/toast.js#L9) - Implement toast state management
- [src/lib/toast.js#L12](src/lib/toast.js#L12) - Implement toast functions
- [src/lib/toast.js#L15](src/lib/toast.js#L15) - Add success toast to state
- [src/lib/toast.js#L18](src/lib/toast.js#L18) - Add error toast to state
- [src/lib/toast.js#L21](src/lib/toast.js#L21) - Add info toast to state
- [src/lib/toast.js#L24](src/lib/toast.js#L24) - Add warning toast to state
- [src/lib/toast.js#L28](src/lib/toast.js#L28) - Implement auto-dismiss functionality
- [src/lib/toast.js#L30](src/lib/toast.js#L30) - Remove toast from state
- [src/lib/toast.js#L37](src/lib/toast.js#L37) - Implement toast container component
- [src/lib/toast.js#L38-L45](src/lib/toast.js#L38-L45) - Toast rendering, animations, and positioning

---

## API Layer (15 TODOs)

### Donor API
- [src/lib/api/donors.js#L5](src/lib/api/donors.js#L5) - Get a single donor by ID
- [src/lib/api/donors.js#L10](src/lib/api/donors.js#L10) - Query single donor with related data
- [src/lib/api/donors.js#L11](src/lib/api/donors.js#L11) - Calculate donor metrics
- [src/lib/api/donors.js#L12](src/lib/api/donors.js#L12) - Return donor object or null
- [src/lib/api/donors.js#L16](src/lib/api/donors.js#L16) - Create a new donor
- [src/lib/api/donors.js#L21-L22](src/lib/api/donors.js#L21-L22) - Create donor in database
- [src/lib/api/donors.js#L26](src/lib/api/donors.js#L26) - Update an existing donor
- [src/lib/api/donors.js#L31-L33](src/lib/api/donors.js#L31-L33) - Update donor and recalculate metrics
- [src/lib/api/donors.js#L37](src/lib/api/donors.js#L37) - Delete a donor
- [src/lib/api/donors.js#L41-L42](src/lib/api/donors.js#L41-L42) - Delete donor and handle cascade deletes
- [src/lib/api/donors.js#L46](src/lib/api/donors.js#L46) - Update donor metrics after donation changes

---

## Custom Hooks (8 TODOs)

### Donor Hooks
- [src/hooks/use-donors.js#L5](src/hooks/use-donors.js#L5) - Hook to fetch and manage donors list
- [src/hooks/use-donors.js#L12](src/hooks/use-donors.js#L12) - Implement state for donors, loading, error
- [src/hooks/use-donors.js#L13](src/hooks/use-donors.js#L13) - Implement fetchDonors function with API call
- [src/hooks/use-donors.js#L14](src/hooks/use-donors.js#L14) - Implement useEffect to fetch data when params change
- [src/hooks/use-donors.js#L15](src/hooks/use-donors.js#L15) - Return state and refetch function
- [src/hooks/use-donors.js#L19](src/hooks/use-donors.js#L19) - Hook to fetch single donor
- [src/hooks/use-donors.js#L24](src/hooks/use-donors.js#L24) - Implement single donor fetching

### Other Hooks
- [src/hooks/use-campaigns.js#L2](src/hooks/use-campaigns.js#L2) - Implement useCampaigns and useCampaign hooks
- [src/hooks/use-donations.js#L2](src/hooks/use-donations.js#L2) - Implement useDonations hook
- [src/hooks/use-segments.js#L2](src/hooks/use-segments.js#L2) - Implement useSegments hook
- [src/hooks/use-workflows.js#L2](src/hooks/use-workflows.js#L2) - Implement useWorkflows hook

---

## UI Components (77 TODOs)

### Donor Components
- [src/components/donors/donor-status-badge.jsx#L3](src/components/donors/donor-status-badge.jsx#L3) - Implement status badge for donor states
- [src/components/donors/retention-risk-badge.jsx#L3](src/components/donors/retention-risk-badge.jsx#L3) - Implement badge for donor retention risk levels
- [src/components/donors/retention-risk-badge.jsx#L10](src/components/donors/retention-risk-badge.jsx#L10) - Define risk variants and their styling
- [src/components/donors/retention-risk-badge.jsx#L12](src/components/donors/retention-risk-badge.jsx#L12) - Add risk mappings (LOW, MEDIUM, HIGH)
- [src/components/donors/retention-risk-badge.jsx#L18-L19](src/components/donors/retention-risk-badge.jsx#L18-L19) - Get variant based on risk level
- [src/components/donors/retention-risk-badge.jsx#L23-L25](src/components/donors/retention-risk-badge.jsx#L23-L25) - Implement Badge component with proper variant
- [src/components/donors/donor-form.jsx#L3](src/components/donors/donor-form.jsx#L3) - Implement form for creating/editing donors
- [src/components/donors/donor-form.jsx#L14-L15](src/components/donors/donor-form.jsx#L14-L15) - Import and use donor validation schema
- [src/components/donors/donor-form.jsx#L17](src/components/donors/donor-form.jsx#L17) - Initialize form with react-hook-form and zod resolver
- [src/components/donors/donor-form.jsx#L19](src/components/donors/donor-form.jsx#L19) - Implement useForm with validation
- [src/components/donors/donor-form.jsx#L24-L27](src/components/donors/donor-form.jsx#L24-L27) - Implement form submission handler
- [src/components/donors/donor-form.jsx#L32](src/components/donors/donor-form.jsx#L32) - Implement donor form with fields
- [src/components/donors/donor-form.jsx#L48-L50](src/components/donors/donor-form.jsx#L48-L50) - Add form validation, error handling, and submit buttons

### Campaign Components
- [src/components/campaigns/campaign-status-badge.jsx#L3](src/components/campaigns/campaign-status-badge.jsx#L3) - Implement status badge for campaign states
- [src/components/campaigns/campaign-status-badge.jsx#L10](src/components/campaigns/campaign-status-badge.jsx#L10) - Define status variants and their styling
- [src/components/campaigns/campaign-status-badge.jsx#L12](src/components/campaigns/campaign-status-badge.jsx#L12) - Add status mappings
- [src/components/campaigns/campaign-status-badge.jsx#L20-L21](src/components/campaigns/campaign-status-badge.jsx#L20-L21) - Get variant based on status
- [src/components/campaigns/campaign-status-badge.jsx#L25-L27](src/components/campaigns/campaign-status-badge.jsx#L25-L27) - Implement Badge component with proper variant

### Donation Components (18 TODOs)
- [src/components/donations/donation-form.jsx#L3](src/components/donations/donation-form.jsx#L3) - Implement form for creating/editing donations
- [src/components/donations/donation-form.jsx#L14-L15](src/components/donations/donation-form.jsx#L14-L15) - Import and use donation validation schema
- [src/components/donations/donation-form.jsx#L17](src/components/donations/donation-form.jsx#L17) - Initialize form with react-hook-form and zod resolver
- [src/components/donations/donation-form.jsx#L19](src/components/donations/donation-form.jsx#L19) - Implement useForm with validation
- [src/components/donations/donation-form.jsx#L24-L27](src/components/donations/donation-form.jsx#L24-L27) - Implement form submission handler
- [src/components/donations/donation-form.jsx#L32](src/components/donations/donation-form.jsx#L32) - Implement donation form with fields
- [src/components/donations/donation-form.jsx#L41-L43](src/components/donations/donation-form.jsx#L41-L43) - Add form validation, error handling, and submit buttons
- [src/components/donations/donation-list.jsx#L3](src/components/donations/donation-list.jsx#L3) - Implement table for displaying donations with filtering and sorting
- [src/components/donations/donation-list.jsx#L12](src/components/donations/donation-list.jsx#L12) - Implement sorting state
- [src/components/donations/donation-list.jsx#L16-L18](src/components/donations/donation-list.jsx#L16-L18) - Implement filtering state with filter options
- [src/components/donations/donation-list.jsx#L26-L28](src/components/donations/donation-list.jsx#L26-L28) - Implement sort function
- [src/components/donations/donation-list.jsx#L31-L33](src/components/donations/donation-list.jsx#L31-L33) - Implement filter function
- [src/components/donations/donation-list.jsx#L36-L37](src/components/donations/donation-list.jsx#L36-L37) - Apply filters and sorting to donations
- [src/components/donations/donation-list.jsx#L41-L51](src/components/donations/donation-list.jsx#L41-L51) - Add filter controls and donations table
- [src/components/donations/donation-list.jsx#L56](src/components/donations/donation-list.jsx#L56) - Add sortable column headers
- [src/components/donations/donation-list.jsx#L67-L70](src/components/donations/donation-list.jsx#L67-L70) - Implement loading/empty states and action buttons
- [src/components/donations/donation-list.jsx#L75](src/components/donations/donation-list.jsx#L75) - Add pagination if needed

### Segment Components (8 TODOs)
- [src/components/segments/segment-form.jsx#L3](src/components/segments/segment-form.jsx#L3) - Implement form for creating/editing donor segments
- [src/components/segments/segment-form.jsx#L14-L15](src/components/segments/segment-form.jsx#L14-L15) - Import and use segment validation schema
- [src/components/segments/segment-form.jsx#L17](src/components/segments/segment-form.jsx#L17) - Initialize form with react-hook-form and zod resolver
- [src/components/segments/segment-form.jsx#L19](src/components/segments/segment-form.jsx#L19) - Implement useForm with validation
- [src/components/segments/segment-form.jsx#L24-L27](src/components/segments/segment-form.jsx#L24-L27) - Implement form submission handler
- [src/components/segments/segment-form.jsx#L32](src/components/segments/segment-form.jsx#L32) - Implement segment form with fields
- [src/components/segments/segment-form.jsx#L45-L49](src/components/segments/segment-form.jsx#L45-L49) - Add dynamic criteria builder, validation, and preview

### Workflow Components (8 TODOs)
- [src/components/workflows/workflow-form.jsx#L3](src/components/workflows/workflow-form.jsx#L3) - Implement form for creating/editing automated workflows
- [src/components/workflows/workflow-form.jsx#L14-L15](src/components/workflows/workflow-form.jsx#L14-L15) - Import and use workflow validation schema
- [src/components/workflows/workflow-form.jsx#L17](src/components/workflows/workflow-form.jsx#L17) - Initialize form with react-hook-form and zod resolver
- [src/components/workflows/workflow-form.jsx#L19](src/components/workflows/workflow-form.jsx#L19) - Implement useForm with validation
- [src/components/workflows/workflow-form.jsx#L24-L27](src/components/workflows/workflow-form.jsx#L24-L27) - Implement form submission handler
- [src/components/workflows/workflow-form.jsx#L32-L49](src/components/workflows/workflow-form.jsx#L32-L49) - Implement workflow form, dynamic action builder, and conditional logic

### Dialog & Confirmation (4 TODOs)
- [src/components/confirm-dialog.jsx#L3](src/components/confirm-dialog.jsx#L3) - Implement confirmation dialog for destructive actions
- [src/components/confirm-dialog.jsx#L19-L22](src/components/confirm-dialog.jsx#L19-L22) - Dialog state management and button styling
- [src/components/confirm-dialog.jsx#L26-L29](src/components/confirm-dialog.jsx#L26-L29) - Dialog components and keyboard handling

---

## Page Components (10 TODOs)

### Dashboard Pages
- [src/app/(dashboard)/campaigns/[id]/page.jsx#L3](src/app/%28dashboard%29/campaigns/%5Bid%5D/page.jsx#L3) - Implement campaign detail view
- [src/app/(dashboard)/campaigns/page.jsx#L3](src/app/%28dashboard%29/campaigns/page.jsx#L3) - Implement campaigns management
- [src/app/(dashboard)/segments/page.jsx#L3](src/app/%28dashboard%29/segments/page.jsx#L3) - Implement donor segments

### Donor Detail Pages
- [src/app/(dashboard)/donors/[id]/page.jsx#L7-L9](src/app/%28dashboard%29/donors/%5Bid%5D/page.jsx#L7-L9) - Get donor ID and fetch donor data
- [src/app/(dashboard)/donors/[id]/page.jsx#L13-L15](src/app/%28dashboard%29/donors/%5Bid%5D/page.jsx#L13-L15) - Implement donor profile header, tabs, and action buttons
- [src/app/(dashboard)/donors/[id]/edit/page.jsx#L7-L9](src/app/%28dashboard%29/donors/%5Bid%5D/edit/page.jsx#L7-L9) - Get donor ID and fetch donor data for editing
- [src/app/(dashboard)/donors/[id]/edit/page.jsx#L15](src/app/%28dashboard%29/donors/%5Bid%5D/edit/page.jsx#L15) - Implement edit form with pre-populated data

### Auth Pages
- [src/app/(auth)/layout.jsx#L6](src/app/%28auth%29/layout.jsx#L6) - Add app branding/logo to auth layout

---

## Summary Statistics

- **Total TODOs**: 169
- **Core Infrastructure**: 18
- **API Layer**: 11
- **Custom Hooks**: 8
- **UI Components**: 77
- **Page Components**: 10
- **Untracked**: 45 (mostly TODO comments in examples and related documentation)

## Priority Tiers

### High Priority (Core Functionality)
- Donor CRUD operations (src/lib/api/donors.js)
- Donor list and detail pages
- Donation form and list components
- Custom hooks (use-donors, use-donations, etc.)

### Medium Priority (Feature Completeness)
- Segment and campaign management
- Workflow automation system
- Toast notification system
- Badge components

### Low Priority (Polish & Enhancement)
- Middleware proxy routing
- Pagination
- Analytics and insights
- Animation and transitions
