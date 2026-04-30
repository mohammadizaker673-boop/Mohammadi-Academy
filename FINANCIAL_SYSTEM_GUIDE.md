# Financial Management System - Complete Guide

## 🎯 System Overview

The financial management system consists of **4 interconnected modules** that work together seamlessly to handle all fee-related operations.

---

## 📊 Module Flow & Connectivity

```
1. FEE PLANS          2. INVOICES           3. PAYMENTS           4. REPORTS
   (Define)      →      (Request)      →      (Collect)      →      (Analyze)
   
├─ Set Prices    →   ├─ Create Bill   →   ├─ Record Money  →   ├─ View Stats
├─ Online/Offline    ├─ Link Student       ├─ Update Status      ├─ Income Breakdown
├─ Discounts         ├─ Status: UNPAID     ├─ Auto-Calculate     ├─ Overdue List
└─ Late Fees         └─ Send Reminders     └─ Generate Receipt   └─ Student Financials
```

---

## 🔄 Data Flow Between Modules

### Step 1: Fee Plans → Invoices
- **Create a fee plan** with pricing structure
- When creating invoice, **select the fee plan**
- System **auto-fills** all amounts (subtotal, discount, total)
- Or use **manual entry** without selecting a plan

### Step 2: Invoices → Payments
- Invoice created with status: **UNPAID**
- Go to Payments module
- **Select the invoice** from dropdown (shows only unpaid/partial)
- Enter payment amount
- System **automatically**:
  - Updates invoice `amountPaid`
  - Calculates new `balance`
  - Changes status to:
    - `PAID` if balance = $0
    - `PARTIALLY-PAID` if balance > $0 but < total
    - `OVERDUE` if past due date

### Step 3: Payments → Reports
- All payment data **automatically appears** in Reports
- Income breakdown by course
- Online vs Offline revenue comparison
- Overdue invoices with student contact info
- Per-student financial summary

---

## 📋 Invoice Status System

| Status | Meaning | Trigger | Color |
|--------|---------|---------|-------|
| **UNPAID** | No payment received | Invoice created | 🟡 Yellow |
| **PARTIALLY-PAID** | Some payment made, balance remains | Payment < Total | 🔵 Blue |
| **PAID** | Full payment received | Payment = Total | 🟢 Green |
| **OVERDUE** | Past due date without full payment | Auto-check daily | 🔴 Red |

### Auto-Status Updates:
- ✅ Status changes **automatically** when you record a payment
- ✅ Overdue detection runs **automatically** on page load
- ✅ No manual status changes needed

---

## 🔗 Complete Workflow Example

### Creating & Processing an Invoice

1. **Create Fee Plan** (Fee Plans Module)
   ```
   Name: Monthly Quran Course - Online
   Student Type: Online
   Course Price: $50
   Certificate Fee: $10
   Discount: 10%
   Total: $54 (after discount)
   ```

2. **Create Invoice** (Invoices Module)
   ```
   Select Student: Ahmad Khan
   Course Name: Quran Tajweed
   Fee Plan: Monthly Quran Course - Online (auto-fills $54)
   Issue Date: 2026-01-20
   Due Date: 2026-01-27
   Status: UNPAID (auto-set)
   ```

3. **Record Payment** (Payments Module)
   ```
   Select Invoice: INV-202601-1234 - Ahmad Khan - Balance: $54
   Amount: $30
   Payment Method: Cash
   Payment Date: 2026-01-22
   
   → System Auto-Updates Invoice:
     - amountPaid: $30
     - balance: $24
     - status: PARTIALLY-PAID
   ```

4. **Record 2nd Payment**
   ```
   Same Invoice: Balance now shows $24
   Amount: $24
   
   → System Auto-Updates Invoice:
     - amountPaid: $54
     - balance: $0
     - status: PAID
     - paidDate: 2026-01-25
   ```

5. **View in Reports** (Reports Module)
   ```
   - Today's Collection: $24
   - Student: Ahmad Khan
     Total Fee: $54
     Paid: $54
     Balance: $0
   - Course Income: Quran Tajweed = $54
   ```

---

## 🗄️ Database Collections & Relations

### Students Collection
```typescript
{
  id: "student123",
  fullName: "Ahmad Khan",
  email: "ahmad@example.com",
  enrollmentType: "online" | "offline",
  // ... other fields
}
```

### Fee Plans Collection
```typescript
{
  id: "plan456",
  name: "Monthly Quran Course - Online",
  studentType: "online",
  coursePrice: 50,
  certificateFee: 10,
  discountPercent: 10,
  // ... other fields
}
```

### Invoices Collection
```typescript
{
  id: "invoice789",
  invoiceNumber: "INV-202601-1234",
  studentId: "student123",        // → Links to Students
  studentName: "Ahmad Khan",       // Denormalized for performance
  studentEmail: "ahmad@example.com",
  feePlanId: "plan456",           // → Links to Fee Plans
  courseName: "Quran Tajweed",
  subtotal: 60,
  discount: 6,
  total: 54,
  amountPaid: 30,                 // Updated by Payments
  balance: 24,                    // Updated by Payments
  status: "partially-paid",       // Updated by Payments
  dueDate: "2026-01-27",
  // ... other fields
}
```

### Payments Collection
```typescript
{
  id: "payment101",
  paymentNumber: "PAY-202601-5678",
  invoiceId: "invoice789",        // → Links to Invoices
  invoiceNumber: "INV-202601-1234",
  studentId: "student123",        // Denormalized
  studentName: "Ahmad Khan",
  amount: 30,
  paymentMethod: "cash",
  paymentDate: "2026-01-22",
  status: "completed",
  // ... other fields
}
```

---

## ✨ Key Features

### Automatic Calculations
- ✅ Invoice total = subtotal - discount + tax
- ✅ Balance = total - amountPaid
- ✅ Status based on balance and due date
- ✅ Partial payment support

### Data Integrity
- ✅ Invoice status syncs with payment records
- ✅ Student data auto-populates from selection
- ✅ Fee plan amounts auto-calculate
- ✅ Payment validation (can't exceed balance)

### User Experience
- ✅ Dropdown shows only relevant invoices (unpaid/partial)
- ✅ Real-time balance display
- ✅ Status badges with color coding
- ✅ Helpful tooltips and guides
- ✅ Success/error messages

### Reporting
- ✅ Today's collection vs total
- ✅ Online vs Offline revenue
- ✅ Course-wise income breakdown
- ✅ Overdue invoice alerts
- ✅ Per-student financial summary

---

## 🛠️ Technical Implementation

### Invoice Status Updates (Payments Module)
```typescript
// When recording a payment:
const newAmountPaid = invoice.amountPaid + paymentAmount;
const newBalance = invoice.total - newAmountPaid;

const newStatus = 
  newBalance <= 0 ? 'paid' :
  newBalance < invoice.total ? 'partially-paid' :
  'unpaid';

// Update invoice in Firestore
await updateDoc(invoiceRef, {
  amountPaid: newAmountPaid,
  balance: newBalance,
  status: newStatus,
  paidDate: newBalance <= 0 ? today : null
});
```

### Overdue Detection (Invoices Module)
```typescript
// On page load:
const today = new Date().toISOString().split('T')[0];
const overdueInvoices = invoices.filter(inv => 
  inv.status !== 'paid' && 
  inv.dueDate < today
);

// Auto-update status to 'overdue'
for (const invoice of overdueInvoices) {
  await updateDoc(invoiceRef, { status: 'overdue' });
}
```

---

## 🎓 Best Practices

1. **Always use Fee Plans** for consistency
   - Create plans for common courses
   - Use manual entry only for special cases

2. **Set realistic due dates**
   - Default is 7 days from issue
   - Adjust based on payment terms

3. **Record payments promptly**
   - Keeps invoice status accurate
   - Better cash flow tracking

4. **Check Reports regularly**
   - Monitor overdue invoices
   - Track revenue trends
   - Follow up with students

5. **Use proper payment methods**
   - Select correct method for accurate records
   - Add transaction details for offline payments

---

## 📞 Quick Reference

### Navigation
- **Fee Plans**: Finance → Fee Plans
- **Invoices**: Finance → Invoices
- **Payments**: Finance → Payments
- **Reports**: Finance → Reports

### Common Tasks
- **Create invoice**: Invoices → Create Invoice → Select student + plan
- **Record payment**: Payments → Record Payment → Select invoice
- **Check overdue**: Reports → Overdue Invoices section
- **View student balance**: Reports → Student Financials

### Status Meanings
- 🟡 **UNPAID**: Invoice sent, no payment yet
- 🔵 **PARTIAL**: Some money received
- 🟢 **PAID**: Fully paid, closed
- 🔴 **OVERDUE**: Past due, needs follow-up

---

## 🚀 System Benefits

✅ **Fully Automated**: No manual status updates needed
✅ **Error Prevention**: Validation on all inputs
✅ **Real-time Sync**: All modules update instantly
✅ **Audit Trail**: Complete payment history
✅ **Scalable**: Handles unlimited students/invoices
✅ **User-friendly**: Clear workflows and guides

---

*Last Updated: January 20, 2026*
*Version: 1.0*
