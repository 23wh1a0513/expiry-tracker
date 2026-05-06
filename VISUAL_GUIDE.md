# 🎨 TrackMyExpiry AI - Visual Layout Guide

## 📐 Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  📦 TrackMyExpiry AI    Dashboard  Add Item  Planner  ...  👤   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      STATS SECTION                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────┐│
│  │ 📋 Total     │  │ ✓ Safe       │  │ ⚠️ Warning   │  │ ✕ Ex │
│  │   Items: 8   │  │   Items: 5   │  │   Items: 2   │  │ pired│
│  └──────────────┘  └──────────────┘  └──────────────┘  │  : 1 │
│                                                         └──────┘
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TAB NAVIGATION                                                  │
│ 📑 My Items | ✕ Expired | 📅 Planner | 🔍 Risk | 💬 Chat      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  My Items                      🔄 REFRESH    + ADD ITEM         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ 🟢 MILK        │  │ 🟡 CHEESE      │  │ 🟢 BUTTER      │    │
│  │ Expires: Jan25 │  │ Expires: Jan24 │  │ Expires: Feb1  │    │
│  │ 3 days        │  │ 2 days ⚠️      │  │ 10 days ✓     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ 🟢 BREAD       │  │ 🔴 OLD JUICE   │  │ 🟢 YOGURT      │    │
│  │ Expires: Jan28 │  │ Expires: Jan19 │  │ Expires: Jan29 │    │
│  │ 6 days        │  │ Expired 3d ago │  │ 7 days         │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Mobile Layout

```
┌──────────────────┐
│ 📦 TrackMyExpiry │
│  Dashboard ⋮    │
└──────────────────┘

┌──────────────────┐
│ 📋: 8  ✓: 5     │
│ ⚠️: 2  ✕: 1     │
└──────────────────┘

┌──────────────────┐
│ 🔄 REFRESH       │
│ + ADD ITEM       │
└──────────────────┘

┌──────────────────┐
│ 🟢 MILK          │
│ Jan 25 - 3 days │
│                  │
│ 🟡 CHEESE        │
│ Jan 24 - 2 days ⚠│
│                  │
│ 🟢 BUTTER        │
│ Feb 1 - 10 days  │
└──────────────────┘

┌──────────────────┐
│ 📑 My Items      │
│ ✕ Expired       │
│ 📅 Planner      │
│ 🔍 Risk         │
│ 💬 Chat         │
└──────────────────┘
```

## 🎨 Color Scheme Reference

```
┌────────────────────────────────────┐
│ COLOR CODING SYSTEM                │
├────────────────────────────────────┤
│ 🟢 GREEN (#27ae60) - SAFE          │
│    Expires in 4+ days              │
│    Status: Plenty of time          │
├────────────────────────────────────┤
│ 🟡 ORANGE (#f39c12) - WARNING      │
│    Expires in 1-3 days             │
│    Status: Use soon!               │
├────────────────────────────────────┤
│ 🔴 RED (#e74c3c) - EXPIRED         │
│    Past expiry date                │
│    Status: Discard or use ASAP     │
├────────────────────────────────────┤
│ 🔵 TEAL (#1abc9c) - PRIMARY        │
│    Buttons, headers, accents       │
│    Status: Active/Interactive      │
└────────────────────────────────────┘
```

## 🗂️ Tab Views

### 1. My Items Tab
```
┌─────────────────────────────┐
│ 📑 My Items                 │
│ 🔄 REFRESH    + ADD ITEM    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🟢 ITEM NAME            │ │
│ │ Expires: Jan 25         │ │
│ │ ┌──────┐  5 days remaining│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🟡 ITEM NAME            │ │
│ │ Expires: Jan 23         │ │
│ │ ┌──────┐  2 days remaining│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 2. Expired Items Tab
```
┌─────────────────────────────┐
│ ✕ Expired Items             │
│ 🔄 REFRESH                  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🔴 ITEM NAME            │ │
│ │ Expired: Jan 19         │ │
│ │ 3 days ago  [🗑 Remove] │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🔴 ITEM NAME            │ │
│ │ Expired: Jan 15         │ │
│ │ 7 days ago  [🗑 Remove] │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 3. Planner Tab
```
┌──────────────────────────────────┐
│ 📅 Smart Planner                 │
│ 🔄 REFRESH PLAN                  │
├──────────────────────────────────┤
│ Jan 23 (2 DAYS) ⚠️               │
│ ├─ Cheese         [✓ Consumed]   │
│ └─ Yogurt         [✓ Consumed]   │
├──────────────────────────────────┤
│ Jan 25 (4 DAYS)  ✓               │
│ ├─ Milk           [✓ Consumed]   │
│ └─ Bread          [✓ Consumed]   │
├──────────────────────────────────┤
│ Jan 28 (7 DAYS)  ✓               │
│ └─ Butter         [✓ Consumed]   │
└──────────────────────────────────┘
```

### 4. Risk Check Tab
```
┌──────────────────────────────────┐
│ 🔍 Risk Check                    │
├──────────────────────────────────┤
│ [Enter product name...] [Check]  │
├──────────────────────────────────┤
│ RISK ANALYSIS FOR "MILK"         │
│ ┌─────────┬─────────┬─────────┐  │
│ │ Risk    │ Avg Days│ Purchases│  │
│ │ HIGH    │ 5 days  │ 12      │  │
│ │ (RED)   │         │         │  │
│ └─────────┴─────────┴─────────┘  │
│ Expired: 5 samples               │
└──────────────────────────────────┘
```

### 5. AI Chat Tab
```
┌──────────────────────────────────┐
│ 💬 AI Chat Assistant             │
├──────────────────────────────────┤
│ ┌────────────────────────────┐   │
│ │ Bot: Hello! How can I help?│   │
│ └────────────────────────────┘   │
│                                  │
│          ┌────────────────────┐   │
│          │ You: What's soon?  │   │
│          └────────────────────┘   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Bot: Expiring in 3 days:   │   │
│ │ - Cheese                   │   │
│ │ - Yogurt                   │   │
│ └────────────────────────────┘   │
│                                  │
│ [Ask a question...] [Send]      │
└──────────────────────────────────┘
```

## 🖱️ User Interactions

### Adding an Item
```
1. Click "+ ADD ITEM" button
   ↓
2. Modal appears with form
   ├─ Item Name: [____________]
   ├─ Expiry Date: [___/___/___]
   └─ [Cancel] [Add Item]
   ↓
3. Item saved to database
   ↓
4. Page shows updated list
```

### Checking Expiry Status
```
Item Added → Auto Check Every 6 Hours
  ↓                    ↓
If Expired?       Background Job
  ↓                    ↓
Mark as Expired   Marks Expired Items
  ↓                    ↓
Show in Expired Tab    Instant Update
```

### Using Planner
```
1. Click "Planner" tab
   ↓
2. See items grouped by date
   ↓
3. Review items by urgency
   ↓
4. Mark as consumed
   ↓
5. Item removed from list
```

## 📊 State Management

```
USER INPUT
    ↓
FRONTEND
    ↓
API REQUEST → BACKEND
               ↓
             DATABASE
               ↓
          RESPONSE
    ↓
UPDATE UI
    ↓
DISPLAY CHANGES
```

## 🔐 Data Flow

```
┌─────────────┐
│  Browser   │
│             │
│ ┌─────────┐│
│ │ Add Item││
│ └─────────┘│
│      │     │
└──────┼─────┘
       │
       ↓ HTTP
┌─────────────────────┐
│  Express Server     │
│  (localhost:3000)   │
│                     │
│ POST /items         │
│ Validate data       │
│ Create Item         │
└─────────────────────┘
       │
       ↓ MongoDB Query
┌─────────────────────┐
│  MongoDB            │
│                     │
│  Save to Database   │
│  Return ID          │
└─────────────────────┘
       │
       ↓ Response
┌─────────────────────┐
│  Browser           │
│                    │
│  Show in UI        │
│  Update Stats      │
└─────────────────────┘
```

---

**Visual Guide Complete!**
This shows the complete layout and flow of TrackMyExpiry AI.
