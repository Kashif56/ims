# Design Guidelines: Wholesale Mobile Shop Manager

## Design Approach: Professional Business System

**Selected Approach:** Material Design-inspired business application
**Rationale:** This is a utility-focused, data-intensive inventory and invoice management system requiring clarity, efficiency, and professional credibility. The design prioritizes information hierarchy, form usability, and real-time data visualization over creative aesthetics.

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Primary: 220 90% 56% (Indigo/Blue - professional, trustworthy)
- Primary Dark: 220 90% 46%
- Surface: 0 0% 100% (Pure white for paper/cards)
- Background: 210 20% 97% (Light gray-blue for app background)

**Functional Colors:**
- Success/Profit: 142 71% 45% (Green for positive metrics, stock actions)
- Warning/Low Stock: 38 92% 50% (Amber for alerts)
- Danger/Delete: 0 84% 60% (Red for critical actions)
- Info: 199 89% 48% (Cyan for informational elements)

**Dark Mode:** Not required for this business application

### B. Typography

**Font Family:** Poppins (Google Fonts)
- Headings: 700-800 weight
- Subheadings: 600 weight  
- Body: 400 weight
- Labels/Captions: 500-600 weight

**Scale:**
- Page Titles: text-3xl (30px)
- Section Headers: text-2xl (24px)
- Card Titles: text-xl (20px)
- Body/Forms: text-base (16px)
- Helper Text: text-sm (14px)
- Captions: text-xs (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 10, 12, 16, 20
- Micro spacing (within components): p-2, p-4, gap-2, gap-3
- Component padding: p-4, p-6
- Section spacing: py-8, py-10, mb-6, mb-8
- Large gaps: gap-6, space-y-6

**Grid Patterns:**
- Dashboard metrics: 3-column grid on desktop, stack on mobile
- Forms: Single column with max-width constraints
- Tables: Full-width responsive with horizontal scroll on mobile

### D. Component Library

**1. Invoice Paper Design**
- Background: Pure white with elevated shadow (0 10px 30px rgba(0,0,0,0.1))
- Border: 1px solid gray-200
- Rounded corners: rounded-xl
- Max width: max-w-7xl
- Internal padding: p-6 md:p-10

**2. Modal Dialogs**
- Backdrop: bg-black bg-opacity-60
- Container: bg-white rounded-xl shadow-2xl
- Sizes: 
  - Small forms: max-w-2xl
  - Inventory manager: max-w-5xl
  - Dashboard: max-w-7xl h-[90vh]

**3. Form Inputs**
- Default: border border-gray-300 rounded-lg p-2 focus:border-indigo-500
- Read-only: bg-gray-50 border-gray-200 cursor-default
- Labels: text-sm font-medium text-gray-700 block mb-1

**4. Buttons**
- Primary Action: bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md
- Success: bg-green-600 hover:bg-green-700
- Warning: bg-amber-500 hover:bg-amber-600
- Danger: bg-red-600 hover:bg-red-700
- Secondary: bg-gray-500 hover:bg-gray-600
- All buttons: font-semibold with transform hover:scale-[1.02] transition

**5. Data Tables**
- Header: bg-gray-100 font-semibold text-gray-700 border-b-2 border-gray-300
- Rows: Alternating hover:bg-gray-50, border-b border-gray-200
- Actions: Icon buttons with hover states
- Search: Full-width with icon, border-gray-300 rounded-lg mb-4

**6. Dashboard Cards (Metrics)**
- Sales: bg-blue-100 border-b-4 border-blue-500 text-blue-800/900
- Profit: bg-green-100 border-b-4 border-green-500 text-green-800/900
- Warnings: bg-yellow-100 border-b-4 border-yellow-500 text-yellow-800/900
- Value display: text-3xl font-extrabold
- Label: text-sm font-medium
- Padding: p-4 rounded-xl shadow-md

**7. Navigation**
- Top controls bar with horizontal button group
- Buttons with icon + text labels
- Color-coded by function (blue=invoice, green=inventory, red=reports)

**8. Item Lists & Cards**
- Inventory items: White cards with border, rounded-lg, p-3, space-y-2
- Low stock indicators: Red badge or border accent
- Edit states: Visual highlight with bg-indigo-50 border-indigo-300

**9. Toast Notifications**
- Position: fixed top-4 right-4 z-50
- Success: bg-green-600 text-white
- Error: bg-red-600 text-white  
- Info: bg-blue-600 text-white
- Animation: fade in/out with opacity transition

### E. Animations & Interactions

**Minimal Animation Approach:**
- Button hover: scale-[1.02] transform transition
- Modal entry: Fade in backdrop, no slide animations
- Toast messages: opacity transition 300ms
- Form validation: Instant border color change
- NO loading spinners unless data fetch > 1 second
- NO page transitions or complex animations

---

## Module-Specific Design

### Invoice Module
- **Layout:** Clean paper metaphor with clear header/body/footer structure
- **Header:** Company info left-aligned, invoice metadata right-aligned
- **Line items:** Table with borders, alternating row colors for readability
- **Calculations:** Right-aligned numbers, bold totals, clear hierarchy
- **Print optimization:** Remove controls, ensure borders visible, white background

### Inventory Manager
- **Split layout:** Form (1/3) + List (2/3) on desktop
- **Edit mode:** Highlight selected item, show "Cancel Edit" button, change form title
- **Stock levels:** Color-coded (red < reorder, green = healthy)
- **Actions:** Icon buttons (edit/delete) always visible on hover

### Dashboard/Reports  
- **Date filter:** Prominent at top with auto-generation
- **Metrics row:** 3 cards showing sales/profit/count with large numbers
- **Low stock list:** Scrollable area with item cards showing current quantity
- **No charts:** Focus on key numbers and actionable lists

### Customer Selection
- **Autocomplete dropdown:** White bg, shadow-lg, max-h-60 overflow-y-auto
- **Results:** Hover bg-gray-100, p-2, cursor-pointer
- **Create new:** Prominent button if no match found

---

## Responsive Behavior

**Mobile (< 768px):**
- Stack all grids to single column
- Full-width buttons in vertical stack
- Collapsible sections for invoice details
- Horizontal scroll for tables
- Drawer-style modals (full screen)

**Tablet (768px - 1024px):**
- 2-column layouts where appropriate  
- Maintain button groups
- Optimize modal widths

**Desktop (> 1024px):**
- Full 3-column dashboard
- Side-by-side form + list layouts
- Optimal reading widths for invoice paper

---

## Accessibility & Usability

- **Focus states:** Ring-2 ring-indigo-500 ring-offset-2 on all interactive elements
- **Error states:** Red border + helper text below input
- **Required fields:** Asterisk or "Required" label
- **Loading states:** Disable buttons with opacity-50 and cursor-not-allowed
- **Keyboard navigation:** Tab order follows visual hierarchy
- **Print styles:** Dedicated @media print rules to hide controls, show borders

---

## Icon Usage

**Library:** Lucide React (via CDN)
**Common Icons:**
- file-plus (New invoice)
- boxes (Inventory)
- pie-chart (Reports)
- printer (Print)
- package-plus (Add item)
- pencil (Edit)
- trash-2 (Delete)
- search (Search inputs)
- x (Close modals)

**Sizing:** w-5 h-5 for buttons, w-4 h-4 for inline elements

---

## Visual Hierarchy Principles

1. **Paper over background:** White elevated surfaces on light gray background
2. **Color signals function:** Blue=primary actions, Green=success/add, Red=danger/reports
3. **Size indicates importance:** Largest text for totals and key metrics
4. **Spacing creates grouping:** Related fields close together, sections separated by 6-8 units
5. **Borders define boundaries:** Subtle borders on cards, stronger on table headers
6. **Shadow adds depth:** Modals use shadow-2xl, cards use shadow-md, buttons use shadow-md