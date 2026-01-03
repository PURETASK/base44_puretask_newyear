# 🎨 DESIGN SYSTEM REFACTORING PLAN

**Goal:** Update existing components to use new design system  
**Date:** January 3, 2026  
**Status:** IN PROGRESS

---

## 📋 REFACTORING STRATEGY

### Phase 1: Core Components (High Impact)
1. ✅ **Booking Cards** - Use `success` for completed status
2. ✅ **GPS/Check-In Components** - Use `system` cyan
3. ✅ **CTA Buttons** - Use `brand-primary`
4. ✅ **Status Badges** - Use semantic colors

### Phase 2: Typography
1. Replace all heading elements with `font-heading`
2. Replace all body text with `font-body`
3. Update button text to use `font-heading font-semibold`

### Phase 3: Hardcoded Colors
1. Find all hex colors
2. Replace with semantic tokens
3. Document any exceptions

---

## 🔍 COMPONENTS TO UPDATE

### 1. Booking Components
**Files:**
- `src/components/booking/ClientBookingCard.jsx`
- `src/pages/ClientBookings.jsx`
- `src/pages/BookingConfirmation.jsx`

**Changes:**
- `completed` status → `bg-success text-white`
- `approved` status → `bg-success text-white`
- `scheduled` status → `bg-system text-white`
- `cancelled` status → `bg-error text-white`
- `pending` status → `bg-warning text-white`

### 2. GPS/Tracking Components
**Files:**
- `src/components/gps/GPSCheckIn.jsx`
- `src/components/jobs/JobStartCheckIn.jsx`
- `src/components/jobs/JobEndCheckOut.jsx`
- `src/components/gps/GPSValidator.jsx`

**Changes:**
- All GPS indicators → `bg-system-soft border-system`
- GPS text → `text-system-text`
- Active tracking → `bg-system text-white`

### 3. CTA Buttons
**Files:**
- `src/pages/Home.jsx`
- `src/pages/RoleSelection.jsx`
- `src/components/booking/FirstTimeWizard.jsx`

**Changes:**
- Primary CTAs → `bg-brand-primary text-slate-900 font-heading font-semibold`
- Remove old `puretask-blue` references

### 4. Reliability/Score Components
**Files:**
- `src/components/reliability/ReliabilityDashboard.jsx`
- `src/components/reliability/BadgeDisplay.jsx`
- `src/pages/ReliabilityScoreExplained.jsx`

**Changes:**
- Reliability scores → `bg-success text-white`
- Score indicators → `text-success-text`
- Achievements → `bg-success-soft border-success-border`

---

## 🎯 QUICK WINS (High Visibility, Low Risk)

### 1. Update Badge Component
Create semantic badge variants:
```jsx
<Badge variant="success">Completed</Badge>
<Badge variant="system">GPS Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Cancelled</Badge>
<Badge variant="info">New</Badge>
```

### 2. Update Status Functions
Replace hardcoded status colors:
```javascript
// OLD:
const statusConfig = {
  completed: { color: 'green-500', ... },
  // ...
}

// NEW:
const statusConfig = {
  completed: { color: 'success', className: 'bg-success text-white', ... },
  // ...
}
```

### 3. Update Typography Classes
```javascript
// Headings
className="font-fredoka" → className="font-heading"

// Body text
className="font-verdana" → className="font-body"
```

---

## ⚠️ CAREFUL CHANGES (Test Thoroughly)

### 1. Badge Component Variants
The shadcn Badge component needs semantic variants added.

### 2. Color-Dependent Logic
Some components may have logic based on color values - check for:
- Conditional styling
- Status calculations
- Theme switching

### 3. Third-Party Components
Some components use shadcn/ui which has its own color system - keep compatibility.

---

## 🧪 TESTING CHECKLIST

After each change:
- [ ] Visual inspection
- [ ] Check all status states
- [ ] Verify readability
- [ ] Test hover states
- [ ] Check mobile view
- [ ] Verify accessibility (contrast ratios)

---

## 📊 PRIORITY ORDER

1. **HIGH PRIORITY (Do First)**
   - ClientBookingCard status badges
   - GPS check-in indicators
   - Primary CTA buttons on Home/RoleSelection

2. **MEDIUM PRIORITY**
   - Reliability score displays
   - Status badges across dashboard
   - Typography updates

3. **LOW PRIORITY (Progressive Enhancement)**
   - Legacy components
   - Admin-only pages
   - Documentation examples

---

## 🚀 IMPLEMENTATION APPROACH

### Option A: Big Bang (Risky)
- Update all at once
- Commit everything together
- Fast but risky

### Option B: Incremental (Recommended)
- Update one component type at a time
- Test after each change
- Commit incrementally
- Easy to rollback

**Recommended:** Option B

---

## 📝 CHANGE LOG TEMPLATE

For each component updated:
```markdown
### Component: [Name]
- **File:** [Path]
- **Changes:**
  - Replaced [old color] with [new token]
  - Updated [element] to use [new class]
- **Tested:** ✅ Visual / ✅ Functional
- **Commit:** [hash]
```

---

## ✅ NEXT STEPS

1. Start with Badge component (adds semantic variants)
2. Update ClientBookingCard (high visibility)
3. Update GPS components (clear semantic meaning)
4. Update primary CTAs (brand consistency)
5. Progressive enhancement of remaining components

---

**Status:** Ready to begin refactoring  
**Est. Time:** 2-3 hours for core components  
**Risk Level:** Low (have restore point v1.0.0-stable)

