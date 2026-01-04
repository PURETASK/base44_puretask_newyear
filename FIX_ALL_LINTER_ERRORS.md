# 🔧 FIXING ALL 22 LINTER ERRORS

## Issues Found:

### 1. routeOptimizationService.ts (3 errors)
- Missing `duration_hours` property in JobRecord interface
- Type issue with routeSegments array

### 2. NotificationTestPage.jsx (19 errors)
- All Card/Button components missing proper imports and usage

## Fix Strategy:

### Fix 1: Update JobRecord interface ✅
Added `duration_hours?: number;` to interface

### Fix 2: Type routeSegments array ✅  
Added explicit type annotation

### Fix 3: Fix Card components in NotificationTestPage
The issue is that Card is being used incorrectly. Card components need proper structure.

Current (WRONG):
```jsx
<Card className="p-6">
  <content here>
</Card>
```

Should be (CORRECT):
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <content here>
  </CardContent>
</Card>
```

OR simply use divs with Card styling:
```jsx
<div className="rounded-xl border bg-card text-card-foreground shadow p-6">
  <content here>
</div>
```

## Implementing Fix Now...

