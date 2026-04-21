# Awlad Elsaman POS - Desktop Application Distribution Guide

## 📦 What's Included

Your React POS application has been built and is ready to distribute to other users. The app is a complete desktop application that runs locally on Windows with SQLite database built-in.

---

## 🚀 **Option 1: Distribution via Folder (Simplest)**

### For Users Who Want to Run It Now:

1. **Copy the app folder** to any location on their PC
2. **Double-click** `run-app-portable.exe` if it exists in dist/win-unpacked
3. Or manually run the Electron app using Node.js (requires Node.js installation)

### Folder Structure to Share:
```
ReactPos/
├── dist/
│   ├── win-unpacked/           ← The Electron app files
│   │   ├── ReactPos.exe        ← Main application executable
│   │   ├── resources/
│   │   │   └── app/            ← React app & Electron files
│   │   └── (other support files)
│   └── (web build files)
├── node_modules/               ← Include this for Node dependencies
├── src/db/
│   └── pos.db                  ← Database (created on first run)
└── package.json
```

---

## 📋 **Option 2: Create an Installer (NSIS)**

### To create a Windows installer (.exe setup file):

```bash
# Requirements:
# 1. Have electron-builder installed (already included)
# 2. Ensure better-sqlite3 is built for your system

# Build steps:
npm run electron:build
```

This will create: **`dist/ReactPos Setup 0.0.0.exe`** (installer file to distribute)

**Note**: If you encounter file lock errors:
1. Close all instances of the app
2. Delete the `dist` folder manually
3. Run `npm run electron:build` again

---

## ✨ **Demo Accounts for Testing**

All demo accounts use password: **`123456`**

| Username | Role | Access Level |
|----------|------|--------------|
| `admin` | Administrator | Full system access, user management, audit logs |
| `manager1` | Manager | Products, invoices, audit logs |
| `accountant1` | Accountant | View invoices and audit logs only |
| `cashier1` | Cashier | POS and invoice creation only |

---

## 🔧 **System Requirements for End Users**

### Minimum Requirements:
- **OS**: Windows 10 or higher
- **RAM**: 512 MB
- **Disk Space**: 500 MB (first run installs ~300 MB)
- **Internet**: No internet required (all local)

### Optional:
- Node.js 18+ (only if running from source)

---

## 📥 **Installation Instructions for End Users**

### Step 1: Get the Application
```
Receive the installer or application folder
```

### Step 2: If Using Installer
- Double-click **`ReactPos Setup 0.0.0.exe`**
- Follow installation wizard
- Choose installation directory
- Create Start Menu shortcuts

### Step 3: If Using Portable Version
- Extract the app folder to desired location
- Run **`dist/win-unpacked/ReactPos.exe`**

### Step 4: First Run
- App will auto-initialize database on first launch
- Demo accounts automatically created
- Login with any demo account above

---

## 🔒 **Data & Security**

✅ **Database is Local** - All data stored in `src/db/pos.db` on user's PC
✅ **No Cloud Sync** - Completely offline operation
✅ **Password Protected** - All users have bcrypt-hashed passwords
✅ **Audit Trail** - All actions logged with timestamps
✅ **Backup System** - Built-in backup/restore functionality

### Where Data is Stored:
```
User's PC:
  → AppData/Roaming/ReactPos/      (if installed)
  → Or same directory as app.exe   (if portable)
     → pos.db                       ← SQLite database
     → backups/                     ← Automatic backups
```

---

## 🆕 **Creating Additional User Accounts**

**Admin Only:**
1. Login as `admin` (password: `123456`)
2. Navigate to **Users** menu
3. Click **Add New User**
4. Fill in:
   - Username (3-20 chars)
   - Password (8+ chars, must have uppercase, lowercase, numbers)
   - Email
   - Role (Admin, Manager, Accountant, Cashier, Warehouse)
   - Display Name

---

## 🔄 **Updating to New Version**

When new versions are released:

### If Using Installer:
- Run the new `ReactPos Setup X.X.X.exe`
- Choose **Upgrade existing installation**
- Database and settings preserved automatically

### If Using Portable:
- Replace the application folder
- Keep the `pos.db` file and `backups/` folder
- New version will auto-migrate database if needed

---

## ⚙️ **Configuration**

### Change Database Location:
Edit `electron/main.cjs` and modify:
```javascript
const dbPath = path.join(process.cwd(), "src", "db", "pos.db");
```

### Change Default Language:
App defaults to English but supports Arabic
- Click language toggle in login page
- Settings persist per user session

### Backup Settings:
Automatic daily backup, keeps last 10 backups in `src/db/backups/`

---

## 🐛 **Troubleshooting**

### "App won't start"
- Check Windows Defender didn't quarantine it (add exception)
- Ensure port 5173 is not in use (for dev mode only)
- Try running as Administrator

### "Database locked"
- Close all app instances
- Wait 5 seconds
- Restart app
- If persists: Delete `pos.db` (backup first!) and app will recreate it

### "Can't login"
- Ensure CAPS LOCK is OFF
- Password is case-sensitive
- Check username spelling exactly:  `admin`, `manager1`, `accountant1`, `cashier1`
- For demo testing, all default password is: `123456`

### "Better-sqlite3 errors"
- Run: `npm rebuild better-sqlite3`
- Ensure Windows Build Tools installed
- May require Administrator privileges

---

## 📊 **Features Available**

### Core POS Features:
✅ Customer invoices with items and tax
✅ Product management (add, edit, delete)
✅ Inventory tracking and reservations
✅ Invoice history and search

### Security & Admin:
✅ Role-based access control (5 roles)
✅ User management and creation
✅ Audit logging (all actions tracked)
✅ Password-based authentication (bcrypt hashing)
✅ Backup and restore functionality

### Coming in Phase 2:
🔜 Purchases module (vendor orders)
🔜 Customer profiles and credit tracking
🔜 Employee management
🔜 Daily account reconciliation
🔜 Advanced reporting (PDF/Excel export)

---

## 📞 **Support & Modifications**

See the project README.md for development setup if you want to:
- Add custom features
- Integrate with external systems
- Modify the UI/branding
- Deploy to multiple locations

---

## ✅ **Deployment Checklist**

Before distributing to users:

- [ ] Test login with all demo accounts
- [ ] Verify products can be added/edited
- [ ] Test creating an invoice
- [ ] Verify backup/restore works
- [ ] Check that audit log records actions
- [ ] Test on clean Windows PC (with minimal software)
- [ ] Verify database backs up automatically
- [ ] Test user creation by admin

---

**App Version**: 0.0.0  
**Built**: April 12, 2026  
**Technology**: Electron + React + SQLite  
**License**: [Your License Here]

For technical questions, contact: Awlad Elsaman Development Team
