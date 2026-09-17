# First Love Church Storeroom Inventory System
## Store Custodian & Administrator Official Operating Manual

Welcome to the **FL Inventory Management & Requisition System**. This guide is prepared specifically for the Store Custodian to provide complete, step-by-step instructions on operating, managing, and securing the storeroom web application.

---

## 1. System Access & Security Clearance

The application has two dedicated interfaces:
1. **Staff Self-Service Portal (`/`)**: Used by church staff, pastors, and ministry heads to browse available items and submit requisition requests.
2. **Custodian Admin Portal (`/admin`)**: Secured specifically for you to manage inventory, approve requisitions, perform stock adjustments, track audit trails, and print official vouchers.

### Login Credentials
* **Admin Portal URL**: [https://flstoreroom.netlify.app/admin](https://flstoreroom.netlify.app/admin)
* **Custodian Username**: `LPGold12`
* **Security Password**: `FL@2026`

> [!IMPORTANT]
> **Tight Security Controls & Protection:**
> * **Lockout Cooldown**: Entering the wrong credentials 4 consecutive times will lock the login screen for **60 seconds**. Refreshing the browser will not bypass this security cooldown.
> * **Auto-Logout on Inactivity**: If the admin portal remains inactive without mouse movement or clicks for **30 minutes**, the system automatically locks and returns to the login screen to protect church inventory data.
> * **Session Termination**: Closing your browser tab automatically terminates the session.
> * **Manual Sign Out**: You can log out anytime by clicking the **red Sign Out icon** next to your profile in the lower left sidebar, or the **Sign Out icon** in the top header.

---

## 2. Main Navigation & Interface Overview

Once authenticated, your sidebar contains 7 core sections:

| Menu Item | Icon | Primary Purpose |
| :--- | :--- | :--- |
| **Dashboard** | 📊 | High-level metrics, stock health overview, low stock alerts, and quick actions. |
| **Inventory** | 📦 | Complete catalog of all items across the 3 storerooms with search and filter tools. |
| **Staff Pickup** | 👤 | Quick checkout counter for immediate walk-in staff requests. |
| **Requisitions** | 📋 | Central hub to review, approve, reject, or fulfill staff requisition requests. |
| **Audit Log** | 📜 | Real-time, tamper-resistant history of all stock additions, issuances, and edits. |
| **Reports & Analysis** | 📈 | Graphs, consumption statistics, top requested items, and Excel/CSV data exports. |
| **Settings** | ⚙️ | Full system backups, data restore, and system management. |

---

## 3. Understanding Storeroom Divisions

The church inventory is segmented across three primary storerooms:
1. **Aud (Auditorium Storeroom)**: Audio-visual equipment, stage supplies, lighting accessories, instruments, and auditorium event gear.
2. **MD (Music / Media Department Storeroom)**: Media production tools, cables, microphones, stands, and specialized tech accessories.
3. **Poimen (Poimen / Administrative Storeroom)**: Service supplies, communion items, stationery, pastoral resources, and general ministry materials.

You can switch between storerooms at any time using the **Storeroom Switcher tabs** at the top of the Inventory and Dashboard screens.

---

## 4. Daily Step-by-Step Operations

### 4.1. Checking Alerts & Low Stock
1. Upon logging in, look at the **Top Right Bell Icon** and the **Dashboard KPI Cards**.
2. Items marked in **Red/Amber** have fallen to or below their **Minimum Safety Threshold**.
3. Re-order or restock these items promptly before they run out completely.

---

### 4.2. Adding a New Item to Inventory
When new church supplies or equipment arrive:
1. Go to **Inventory** in the sidebar.
2. Click the red **"+ Add New Item"** button in the top right.
3. Complete the item form:
   * **Item Name**: E.g., *Sennheiser Wireless Mic EW-D*, *A4 Copy Paper Box*, *Communion Cups (Pack of 500)*.
   * **Storeroom**: Choose between *Aud*, *MD*, or *Poimen*.
   * **Category**: Select the appropriate category (e.g., *Sound & Audio*, *Electrical*, *Office & Admin*, *Hospitality*).
   * **Quantity on Hand**: The exact physical count currently available.
   * **Unit of Measure**: E.g., *Pieces*, *Packs*, *Boxes*, *Rolls*, *Sets*.
   * **Minimum Alert Threshold**: When quantity drops to this number, the system automatically alerts you (recommended: 2 to 5 for equipment, 5 to 10 for consumables).
   * **Shelf / Storage Location**: E.g., *Rack A - Shelf 2*, *Cabinet 3B*. This makes locating items effortless.
   * **Barcode / SKU**: Optional barcode number for scanner compatibility.
   * **Notes / Description**: Any special notes regarding usage or condition.
4. Click **"Save Item"**.

---

### 4.3. Editing Existing Items
1. In the **Inventory** list, locate the item using the search bar.
2. Click the **Edit (Pencil)** icon on the right side of the item row.
3. Update the item's name, storage shelf, category, or alert threshold.
4. Click **"Update Item"**.

---

### 4.4. Performing Stock Adjustments (Restock, Damage, or Physical Audit)
Whenever stock levels change outside of the standard requisition process:
1. In the **Inventory** list, click the **Adjust Stock (Sliders)** icon next to the item.
2. Select the **Adjustment Type**:
   * **Restock / Purchase (+)**: When new batches are purchased or delivered.
   * **Damaged / Expired / Lost (-)**: When an item is broken, worn out, or decommissioned.
   * **Physical Audit Count Reconciliation (=)**: When performing monthly stock-taking and correcting discrepancies.
3. Enter the **Quantity** to adjust.
4. Enter the **Reason / Reference Note** (e.g., *"Received 5 new units via invoice #1042"* or *"Damaged during Sunday service rehearsal"*).
5. Click **"Confirm Adjustment"**.
6. The system immediately updates the stock and creates a permanent entry in the **Audit Log**.

---

### 4.5. Processing Staff Requisitions & Gate Passes
When ministry members submit a request:
1. A numbered badge appears over **Requisitions** in the sidebar and on the top notification bell.
2. Click **Requisitions** to view all requests.
3. Filter by **Pending** requests.
4. Click on a requisition card to view full details:
   * **Requesting Person & Department** (e.g., *Worship Ministry*, *First Love Media*, *Protocol*).
   * **Date Needed & Purpose of Use**.
   * **Items and Quantities Requested**.
5. **Approve or Reject**:
   * If approved: Click **"Approve & Issue Stock"**. The required quantities are automatically deducted from inventory.
   * If not approved: Click **"Decline Request"** and provide an explanation note.
6. **Print Voucher / Gate Pass**:
   * For authorized items leaving the premises or requiring paper documentation, click **"Print Voucher / Gate Pass"**.
   * An official, printable First Love Church Storeroom Voucher will generate, complete with approval stamps and signature lines for both the Custodian and the recipient.

---

### 4.6. Staff Walk-In Pickup
If a staff member arrives at the storeroom counter needing items immediately:
1. Click **Staff Pickup** in the sidebar.
2. Search and click **"Add to Request"** on the requested items.
3. Open the **Pickup Cart** on the right side.
4. Enter the staff member's name and department.
5. Click **"Complete & Issue Pickup"**.
6. Stock is immediately deducted and logged to the movement history.

---

## 5. Audit Trail & Reports

### 5.1. Audit Log
* Every single change—who took what, which requisition was approved, and when an adjustment was made—is recorded chronologically under **Audit Log**.
* You can filter logs by **Date**, **Storeroom**, or **Action Type** (Check-In, Check-Out, Adjustment).

### 5.2. Exporting Reports
* Go to **Reports & Analysis**.
* You can view monthly consumption patterns and top requested supplies.
* Click **"Export to Excel / CSV"** at any time to generate a spreadsheet for the Pastoral Board, Finance Department, or church leadership.

---

## 6. Backups & Data Protection

To guarantee that church inventory data is never lost:
1. Go to **Settings** in the sidebar.
2. Under **Backup & Restore**, click **"Export Complete JSON Backup"**.
3. A file named `FL_Inventory_Backup_YYYY-MM-DD.json` will download to your computer.
4. **Recommendation**: Export a backup file once a week or after major monthly inventory counts, and save a copy to your church Google Drive or OneDrive.
5. If you ever switch computers or clear your browser cache, click **"Import Backup"** and select your latest backup file to restore everything in seconds.

---

## 7. Frequently Asked Questions (FAQ)

**Q: What should I do if I get locked out of the Admin Portal?**  
**A:** If 4 wrong login attempts are made, wait 60 seconds. The countdown will display on the screen. Once the timer reaches 0, enter Username: `LPGold12` and Password: `FL@2026`.

**Q: Can church members see the Admin page or change stock numbers?**  
**A:** No. Anyone visiting `/` only sees the Staff Pickup Portal where they can request items. The `/admin` page is strictly protected by your credentials.

**Q: Can I use the system on an iPad or mobile phone?**  
**A:** Yes. The application is responsive. On tablets and phones, tap the top right hamburger menu (`☰`) to open the navigation drawer.

**Q: How do I print a requisition slip?**  
**A:** In the **Requisitions** tab, click on any requisition and select **"Print Voucher"**. Use standard browser printing (`Ctrl + P` or `Cmd + P`) to print directly to your storeroom printer or save as a PDF.

---

*Manual prepared for First Love Church Storeroom Administration.*  
*Version 2.0 | Secure Custodian Clearance System*
