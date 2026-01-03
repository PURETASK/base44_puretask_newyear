# 🎨 PureTask Design System
**Version:** 1.0.0 (LOCKED)  
**Last Updated:** January 2, 2026  
**Status:** ✅ Final — Do Not Modify

---

## 📋 Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Tailwind Configuration](#tailwind-configuration)
4. [Component Examples](#component-examples)
5. [Usage Rules](#usage-rules)

---

## 🎨 Color System

### **BRAND COLOR**

#### PureTask Primary (Brand Identity)
```
Hex:     #00FFFF
RGB:     rgb(0, 255, 255)
Tailwind: brand-primary
```

**Usage:**
- ✅ Primary buttons (Book Now, Sign Up, etc.)
- ✅ Primary CTAs
- ✅ Active navigation states
- ✅ Links and interactive elements
- ✅ Brand highlights (logos, badges)

**DO NOT USE FOR:**
- ❌ Background fills of cards
- ❌ Large surface areas
- ❌ Semantic meanings (success, error, etc.)
- ❌ Decorative purposes without clear CTA intent

**Purpose:** Communicates **brand identity**, NOT meaning.

---

### **SEMANTIC SYSTEM COLORS**

### 1️⃣ SUCCESS / RELIABILITY (Green)

**Meaning:** Trust, safety, performance, completion

```
Primary:         #22C55E
Soft Background: #ECFDF5
Border:          #86EFAC
Text:            #166534
```

**Tailwind Tokens:**
```
success-DEFAULT
success-soft
success-border
success-text
```

**Use Cases:**
- ✅ Reliability Score indicators (75-100)
- ✅ Completed jobs status badges
- ✅ Positive performance metrics
- ✅ Success confirmation messages
- ✅ "Approved" booking states
- ✅ Tier achievement badges
- ✅ High ratings (4.5+ stars)

**Examples:**
- "Reliability Score: 87/100" (green badge)
- "Job Completed" status
- "Payment Approved" confirmation
- "Pro Tier Achieved" milestone

---

### 2️⃣ SYSTEM / TRACKING / ACTIVITY (Cyan/Blue)

**Meaning:** Precision, monitoring, transparency, real-time activity

```
Primary:         #06B6D4
Soft Background: #ECFEFF
Border:          #67E8F9
Text:            #164E63
```

**Tailwind Tokens:**
```
system-DEFAULT
system-soft
system-border
system-text
```

**Use Cases:**
- ✅ GPS check-in / check-out indicators
- ✅ Live tracking UI
- ✅ Timer displays
- ✅ System activity notifications
- ✅ Real-time status updates
- ✅ Location verification badges
- ✅ "In Progress" states

**Examples:**
- "Cleaner Checked In" notification
- GPS tracking map markers
- "Job In Progress" status badge
- Real-time countdown timers
- "On The Way" status

---

### 3️⃣ WARNING (Amber)

**Meaning:** Caution, attention needed, pending action

```
Primary:         #F59E0B
Soft Background: #FFFBEB
Border:          #FCD34D
Text:            #92400E
```

**Tailwind Tokens:**
```
warning-DEFAULT
warning-soft
warning-border
warning-text
```

**Use Cases:**
- ⚠️ "Awaiting Approval" status
- ⚠️ Pending disputes
- ⚠️ Low reliability scores (40-59)
- ⚠️ Payment holds
- ⚠️ Incomplete profiles

---

### 4️⃣ ERROR / DANGER (Red)

**Meaning:** Critical issues, failures, denials

```
Primary:         #EF4444
Soft Background: #FEF2F2
Border:          #FCA5A5
Text:            #991B1B
```

**Tailwind Tokens:**
```
error-DEFAULT
error-soft
error-border
error-text
```

**Use Cases:**
- 🚨 Cancelled bookings
- 🚨 Disputed jobs
- 🚨 Failed payments
- 🚨 Very low reliability scores (<40)
- 🚨 Account suspensions

---

### 5️⃣ NEUTRAL / INFO (Blue/Slate)

**Meaning:** Informational, neutral status

```
Primary:         #3B82F6
Soft Background: #EFF6FF
Border:          #93C5FD
Text:            #1E3A8A
```

**Tailwind Tokens:**
```
info-DEFAULT
info-soft
info-border
info-text
```

**Use Cases:**
- ℹ️ Information tooltips
- ℹ️ "Scheduled" status
- ℹ️ Helper text
- ℹ️ Neutral notifications

---

## 🎯 UI FOUNDATION COLORS

### **Light Mode (Default)**

```css
/* Backgrounds */
--background:     #F8FAFC    /* slate-50 */
--surface:        #FFFFFF    /* white */
--card:           #FFFFFF    /* white */

/* Borders */
--border:         #E2E8F0    /* slate-200 */
--border-light:   #F1F5F9    /* slate-100 */

/* Text */
--text-primary:   #0F172A    /* slate-900 */
--text-secondary: #334155    /* slate-700 */
--text-muted:     #64748B    /* slate-500 */

/* Shadows */
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
```

### **Dark Mode**

```css
/* Backgrounds */
--background:     #0B1220    /* custom dark blue */
--surface:        #0F172A    /* slate-900 */
--card:           #1E293B    /* slate-800 */

/* Borders */
--border:         #1F2A44    /* custom */
--border-light:   #334155    /* slate-700 */

/* Text */
--text-primary:   #E2E8F0    /* slate-200 */
--text-secondary: #CBD5E1    /* slate-300 */
--text-muted:     #94A3B8    /* slate-400 */

/* Shadows */
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.3)
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.4)
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.5)
```

---

## ✍️ Typography

### **Font Families**

```css
/* Headings (Display, Strong) */
--font-heading: 'Poppins', system-ui, sans-serif

/* Body Text (Readable, Clean) */
--font-body: 'Quicksand', system-ui, sans-serif

/* Monospace (Code, Data) */
--font-mono: 'Fira Code', 'Consolas', monospace
```

### **Type Scale**

```css
/* Display (Hero Sections) */
--text-display:    4rem      /* 64px - Poppins */
--text-display-sm: 3rem      /* 48px - Poppins */

/* Headings */
--text-h1: 2.5rem   /* 40px - Poppins */
--text-h2: 2rem     /* 32px - Poppins */
--text-h3: 1.5rem   /* 24px - Poppins */
--text-h4: 1.25rem  /* 20px - Poppins */

/* Body */
--text-base: 1rem      /* 16px - Quicksand */
--text-lg:   1.125rem  /* 18px - Quicksand */
--text-sm:   0.875rem  /* 14px - Quicksand */
--text-xs:   0.75rem   /* 12px - Quicksand */
```

### **Font Weights**

```css
/* Poppins (Headings) */
--weight-heading-bold:    700
--weight-heading-semibold: 600
--weight-heading-medium:   500

/* Quicksand (Body) */
--weight-body-bold:    600
--weight-body-medium:  500
--weight-body-regular: 400
--weight-body-light:   300
```

---

## ⚙️ Tailwind Configuration

Add this to your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Color
        'brand': {
          primary: '#00FFFF',
        },
        
        // Semantic Colors
        'success': {
          DEFAULT: '#22C55E',
          soft: '#ECFDF5',
          border: '#86EFAC',
          text: '#166534',
        },
        'system': {
          DEFAULT: '#06B6D4',
          soft: '#ECFEFF',
          border: '#67E8F9',
          text: '#164E63',
        },
        'warning': {
          DEFAULT: '#F59E0B',
          soft: '#FFFBEB',
          border: '#FCD34D',
          text: '#92400E',
        },
        'error': {
          DEFAULT: '#EF4444',
          soft: '#FEF2F2',
          border: '#FCA5A5',
          text: '#991B1B',
        },
        'info': {
          DEFAULT: '#3B82F6',
          soft: '#EFF6FF',
          border: '#93C5FD',
          text: '#1E3A8A',
        },
        
        // UI Foundation
        'background': {
          DEFAULT: '#F8FAFC',
          dark: '#0B1220',
        },
        'surface': {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
        },
        'card': {
          DEFAULT: '#FFFFFF',
          dark: '#1E293B',
        },
      },
      
      fontFamily: {
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Quicksand', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
}
```

---

## 🧩 Component Examples

### **1. Primary CTA Button (Brand Color)**

```jsx
<button className="
  bg-brand-primary 
  text-slate-900 
  font-heading 
  font-semibold 
  px-6 py-3 
  rounded-lg 
  hover:bg-cyan-400 
  transition-all 
  shadow-lg 
  hover:shadow-xl
">
  Book Now
</button>
```

**Visual:**
```
┌──────────────────┐
│   Book Now       │  ← #00FFFF background
│                  │  ← Dark text for contrast
└──────────────────┘
```

---

### **2. Reliability Score Card (Success/Green)**

```jsx
<div className="
  bg-success-soft 
  border border-success-border 
  rounded-xl 
  p-6
">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-heading text-lg font-semibold text-slate-900">
        Reliability Score
      </h3>
      <p className="font-body text-sm text-slate-600">
        Excellent performance
      </p>
    </div>
    <div className="
      bg-success 
      text-white 
      font-heading 
      font-bold 
      text-3xl 
      px-6 py-3 
      rounded-lg
    ">
      87
    </div>
  </div>
</div>
```

**Visual:**
```
┌─────────────────────────────────────┐
│ Reliability Score            [87]   │  ← Green badge
│ Excellent performance               │
│                                     │
│ ● Attendance: 98%                   │  ← Green indicators
│ ● Punctuality: 95%                  │
└─────────────────────────────────────┘
   ↑ #ECFDF5 background
```

---

### **3. GPS Check-In Status (System/Cyan)**

```jsx
<div className="
  bg-system-soft 
  border-l-4 border-system 
  rounded-lg 
  p-4
">
  <div className="flex items-center gap-3">
    <div className="
      bg-system 
      text-white 
      p-2 
      rounded-full
    ">
      <MapPin className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-heading font-semibold text-system-text">
        Cleaner Checked In
      </h4>
      <p className="font-body text-sm text-slate-600">
        10:05 AM • 123 Main St
      </p>
    </div>
  </div>
</div>
```

**Visual:**
```
┃ [📍] Cleaner Checked In
┃      10:05 AM • 123 Main St
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↑ #06B6D4 left border
  ↑ #ECFEFF background
```

---

### **4. Job Completed Card (Success/Green)**

```jsx
<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="font-heading text-xl font-semibold text-slate-900">
        Deep Cleaning - 4 hours
      </h3>
      <p className="font-body text-slate-600 mt-1">
        December 28, 2025 • 10:00 AM
      </p>
    </div>
    
    {/* Status Badge - GREEN */}
    <span className="
      bg-success 
      text-white 
      font-heading 
      font-medium 
      px-4 py-2 
      rounded-full 
      text-sm
    ">
      ✓ Completed
    </span>
  </div>
  
  {/* Metrics - GREEN indicators */}
  <div className="grid grid-cols-3 gap-4 mt-6">
    <div className="bg-success-soft border border-success-border rounded-lg p-3">
      <p className="font-body text-xs text-slate-600">On Time</p>
      <p className="font-heading font-bold text-success text-lg">✓</p>
    </div>
    <div className="bg-success-soft border border-success-border rounded-lg p-3">
      <p className="font-body text-xs text-slate-600">Photos</p>
      <p className="font-heading font-bold text-success text-lg">8</p>
    </div>
    <div className="bg-success-soft border border-success-border rounded-lg p-3">
      <p className="font-body text-xs text-slate-600">Rating</p>
      <p className="font-heading font-bold text-success text-lg">5.0</p>
    </div>
  </div>
</div>
```

---

### **5. Live Tracking Banner (System/Cyan)**

```jsx
<div className="
  bg-system 
  text-white 
  py-4 px-6 
  rounded-lg 
  shadow-lg
">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="animate-pulse">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>
      <div>
        <h4 className="font-heading font-semibold text-lg">
          Job In Progress
        </h4>
        <p className="font-body text-sm text-cyan-100">
          Sarah checked in at 10:05 AM
        </p>
      </div>
    </div>
    <button className="
      bg-white 
      text-system 
      font-heading 
      font-medium 
      px-4 py-2 
      rounded-lg
    ">
      View Live
    </button>
  </div>
</div>
```

---

### **6. Tier Badge Examples**

```jsx
{/* Elite Tier - Success Green */}
<div className="
  bg-success 
  text-white 
  font-heading 
  font-bold 
  px-4 py-2 
  rounded-full 
  flex items-center gap-2
">
  <span>💎</span>
  Elite
</div>

{/* Pro Tier - Success Green (lighter) */}
<div className="
  bg-success-soft 
  text-success-text 
  border border-success-border 
  font-heading 
  font-semibold 
  px-4 py-2 
  rounded-full 
  flex items-center gap-2
">
  <span>🌟</span>
  Pro
</div>

{/* Developing Tier - Neutral */}
<div className="
  bg-slate-100 
  text-slate-700 
  font-heading 
  font-medium 
  px-4 py-2 
  rounded-full 
  flex items-center gap-2
">
  <span>🌱</span>
  Developing
</div>
```

---

### **7. Navigation with Brand Color**

```jsx
<nav className="bg-white border-b border-slate-200">
  <div className="flex items-center gap-8 px-6 py-4">
    <div className="font-heading text-2xl font-bold text-slate-900">
      PureTask
    </div>
    
    <div className="flex gap-6">
      {/* Active link - Brand Color */}
      <a href="#" className="
        font-body 
        font-semibold 
        text-brand-primary 
        border-b-2 border-brand-primary 
        pb-1
      ">
        Browse Cleaners
      </a>
      
      {/* Inactive links */}
      <a href="#" className="
        font-body 
        text-slate-600 
        hover:text-slate-900
      ">
        My Bookings
      </a>
      <a href="#" className="
        font-body 
        text-slate-600 
        hover:text-slate-900
      ">
        Messages
      </a>
    </div>
    
    <button className="
      ml-auto 
      bg-brand-primary 
      text-slate-900 
      font-heading 
      font-semibold 
      px-6 py-2 
      rounded-lg
    ">
      Sign In
    </button>
  </div>
</nav>
```

---

## 📏 Usage Rules (NON-NEGOTIABLE)

### ✅ DO:

1. **Use brand color (#00FFFF) for:**
   - Primary CTAs and buttons
   - Active navigation states
   - Important links
   - Brand elements (logos, badges)

2. **Use success green (#22C55E) for:**
   - Reliability scores (good performance)
   - Completed states
   - Positive metrics
   - Trust indicators

3. **Use system cyan (#06B6D4) for:**
   - GPS tracking
   - Real-time status
   - System activity
   - Live updates

4. **Use semantic colors consistently:**
   - Warning (amber) = needs attention
   - Error (red) = failure/critical
   - Info (blue) = neutral information

5. **Use Poppins for:**
   - All headings (H1-H6)
   - Button text
   - Navigation items
   - Bold statements

6. **Use Quicksand for:**
   - Body text
   - Descriptions
   - Form labels
   - Helper text

---

### ❌ DO NOT:

1. **NEVER use brand color for:**
   - ❌ Card backgrounds
   - ❌ Large surface areas
   - ❌ Semantic meanings (success, error)
   - ❌ Decorative purposes without CTA intent

2. **NEVER mix semantic meanings:**
   - ❌ Don't use green for GPS tracking
   - ❌ Don't use cyan for success states
   - ❌ Don't use brand color for reliability

3. **NEVER use colors without purpose:**
   - ❌ No random accent colors
   - ❌ No decorative gradients without meaning
   - ❌ All colors must have semantic intent

4. **NEVER violate font pairings:**
   - ❌ Don't use Quicksand for headings
   - ❌ Don't use Poppins for long-form body text
   - ❌ Keep font families consistent per element type

---

## 🎯 Quick Reference Table

| Use Case | Color | Token | Example |
|----------|-------|-------|---------|
| Primary CTA | `#00FFFF` | `bg-brand-primary` | "Book Now" button |
| Active Nav | `#00FFFF` | `text-brand-primary` | Selected menu item |
| Reliability Score | `#22C55E` | `bg-success` | Score badge (75+) |
| Job Completed | `#22C55E` | `bg-success` | Status badge |
| GPS Check-In | `#06B6D4` | `bg-system` | Location indicator |
| Live Tracking | `#06B6D4` | `bg-system` | "In Progress" badge |
| Needs Approval | `#F59E0B` | `bg-warning` | Pending status |
| Disputed | `#EF4444` | `bg-error` | Critical issue |
| Info Message | `#3B82F6` | `bg-info` | Helper tooltip |
| Heading | — | `font-heading` | All H1-H6 |
| Body Text | — | `font-body` | Paragraphs, descriptions |

---

## 📦 Import Fonts

Add to your `index.html`:

```html
<head>
  <!-- Poppins (Headings) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
  
  <!-- Quicksand (Body) -->
  <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
```

Or via CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600&display=swap');
```

---

## ✅ Design System Status

**Status:** 🔒 **LOCKED**  
**Version:** 1.0.0  
**Last Modified:** January 2, 2026  

**DO NOT:**
- ❌ Suggest alternative colors
- ❌ Re-evaluate brand decisions
- ❌ Modify without explicit approval

This design system is finalized and production-ready.

---

**Questions?** Refer to usage rules above or contact design team.

