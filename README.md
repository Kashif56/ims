# StockFlowPro - Invoice Management System

A modern, full-featured Invoice Management System built with React, TypeScript, and Supabase. Perfect for small to medium businesses managing inventory, customers, and invoices.

## ✨ Features

### 📄 Invoice Management
- **Create Invoices**: Generate professional invoices with line items
- **Editable Pricing**: Adjust unit prices directly in the invoice
- **Customer Selection**: Quick search and select from customer database
- **Print-Ready**: Clean A4 portrait format for printing
- **Save & Track**: Store all invoices with full history

### 📦 Inventory Management
- **Product Catalog**: Maintain detailed product information
- **Stock Tracking**: Real-time stock quantity monitoring
- **Low Stock Alerts**: Automatic alerts when stock falls below reorder level
- **SKU Management**: Unique SKU for each product
- **Cost Tracking**: Track wholesale costs and margins

### 👥 Customer Management
- **Customer Database**: Store customer contact information
- **Due Tracking**: Monitor outstanding payments per customer
- **Quick Add**: Create new customers on-the-fly during invoice creation

### 📊 Business Dashboard
- **Revenue Overview**: Total revenue and profit tracking
- **Daily Statistics**: Today's invoice count
- **Low Stock Alerts**: Quick view of items needing reorder
- **Visual Analytics**: Clean, modern dashboard interface

### 🎨 Modern UI/UX
- **Persistent Navigation**: Top navbar available on all pages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme toggle for user preference
- **Clean Print Output**: Professional invoices without UI clutter

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   cd StockFlowPro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase** (See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed guide)
   - Create a Supabase project
   - Run the SQL schema from `supabase_schema.sql`
   - Get your API credentials

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
StockFlowPro/
├── client/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout.tsx     # Persistent navbar layout
│   │   │   ├── InvoiceHeader.tsx
│   │   │   ├── InvoiceLineItems.tsx
│   │   │   ├── CustomerSelector.tsx
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx       # Invoice creation
│   │   │   ├── Dashboard.tsx  # Business analytics
│   │   │   ├── Inventory.tsx  # Inventory management
│   │   │   ├── Invoices.tsx   # Invoice list
│   │   │   └── ViewInvoice.tsx # Invoice details
│   │   ├── context/           # State management
│   │   │   └── AppContext.tsx # Global app state
│   │   ├── lib/               # Utilities and services
│   │   │   ├── supabase.ts    # Supabase client config
│   │   │   └── supabaseService.ts # Database operations
│   │   └── App.tsx            # Main app component
├── server/                    # Express backend
├── supabase_schema.sql        # Database schema
├── SUPABASE_SETUP.md         # Supabase setup guide
└── CHANGES.md                # Recent changes log
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Wouter** - Lightweight routing
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security
  - Auto-generated APIs

### Development
- **ESLint** - Code linting
- **TypeScript** - Type checking

## 📖 Usage Guide

### Creating an Invoice

1. Navigate to the home page (New Invoice)
2. Select or create a customer
3. Search and add items from inventory
4. Edit quantities and unit prices as needed
5. Enter cash paid amount
6. Click "Save Invoice"
7. Use "Print Invoice" for a clean printout

### Managing Inventory

1. Click "Inventory" in the top navigation
2. Use the form on the left to add new items
3. Search existing items using the search bar
4. Click edit icon to modify items
5. Items below reorder level are highlighted in red

### Viewing Invoices

1. Click "Invoices" in the top navigation
2. Search by invoice number or customer name
3. Filter by date if needed
4. Click "View Details" to see full invoice
5. Print individual invoices from the detail page

### Dashboard Analytics

1. Click "Dashboard" in the top navigation
2. View total revenue and profit
3. Check today's invoice count
4. Review low stock alerts
5. Take action on items needing reorder

## 🎨 Customization

### Company Information
Update your company details in Supabase:
1. Go to Supabase Table Editor
2. Select `company_info` table
3. Edit the default entry with your details

### Styling
- Colors and themes: `client/src/index.css`
- Component styles: Individual component files
- Print styles: `@media print` section in `index.css`

## 🔒 Security

### Current Setup (Development)
- RLS enabled with permissive policies
- Public access to all tables
- Suitable for development/testing

### Production Recommendations
1. **Enable Authentication**
   - Set up Supabase Auth
   - Add login/signup pages
   - Restrict access to authenticated users

2. **Update RLS Policies**
   - Restrict data access by user
   - Implement role-based access
   - Secure sensitive operations

3. **Environment Variables**
   - Never commit `.env` file
   - Use secure environment variable management
   - Rotate API keys regularly

## 📝 Database Schema

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete schema details.

**Key Tables:**
- `company_info` - Business details
- `customers` - Customer records
- `inventory_items` - Product catalog
- `invoices` - Invoice headers
- `invoice_line_items` - Invoice line items

## 🐛 Troubleshooting

### Application won't start
- Check Node.js version (18+)
- Run `npm install` again
- Clear node_modules and reinstall

### Data not loading
- Verify Supabase credentials in `.env`
- Check Supabase project is active
- Review browser console for errors
- Verify database schema is created

### Print layout issues
- Use Chrome/Edge for best print results
- Check print preview before printing
- Ensure A4 paper size is selected

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

- **Documentation**: Check `SUPABASE_SETUP.md` and `CHANGES.md`
- **Issues**: Review browser console for error messages
- **Supabase**: https://supabase.com/docs

## 🎯 Roadmap

- [ ] User authentication
- [ ] Multi-user support with permissions
- [ ] Email invoice functionality
- [ ] Payment tracking and receipts
- [ ] Advanced reporting and analytics
- [ ] Export to PDF/Excel
- [ ] Barcode scanning for inventory
- [ ] Mobile app version

## 📸 Screenshots

### Invoice Creation
Clean, intuitive interface for creating invoices with real-time calculations.

### Dashboard
Business analytics at a glance with revenue, profit, and stock alerts.

### Inventory Management
Easy-to-use inventory system with search and low stock warnings.

---

**Built with ❤️ for small businesses**
