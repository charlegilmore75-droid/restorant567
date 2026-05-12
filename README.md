# Restorant — Full-Stack Restaurant Platform

A complete, production-ready restaurant ordering platform with customer website, admin dashboard, multilingual support (5 languages), Arabic RTL, wallet system, order management, and support chat.

## Features

- **Customer Website**: Browse menu, add to cart, checkout, track orders
- **Admin Dashboard**: Manage orders, products, users, support, payments, and site settings
- **Authentication**: Email/password with roles (Customer, Admin, Superadmin)
- **Multilingual**: English, Arabic (RTL), German, French, Russian
- **Wallet System**: Recharge balance, pay with wallet, auto-refund on cancellation
- **Support Chat**: Customers open threads, admins reply from dashboard
- **Activity Logs**: Every important action is logged
- **Payment Settings**: Stripe, PayPal, Cash on Delivery management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (external)
- **ORM**: Prisma
- **Auth**: NextAuth v5 (credentials)
- **i18n**: next-intl
- **Hashing**: bcryptjs

## Quick Start (Local)

### 1. Clone and install

```bash
cd Restorant
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="your-random-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
SUPERADMIN_EMAIL="admin738ehdi83jje8eihe8@gmail.com"
SUPERADMIN_PASSWORD="SuperAdmin@2024!"
```

### 3. Set up database

```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed superadmin + sample data
```

### 4. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

Default language is English. Visit `/ar` for Arabic RTL.

---

## Railway Deployment

### 1. Create Railway project

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo or upload the `Restorant` folder directly
3. Add a **PostgreSQL** service to your project

### 2. Configure environment variables in Railway

In Railway → Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Auto-provided by Railway Postgres |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Railway app URL (e.g., `https://restorant.up.railway.app`) |
| `SUPERADMIN_EMAIL` | `admin738ehdi83jje8eihe8@gmail.com` |
| `SUPERADMIN_PASSWORD` | Your secure password |
| `NODE_ENV` | `production` |

### 3. Deploy

Railway will automatically:
1. Run `npm run db:migrate` (apply migrations)
2. Run `npm run db:seed` (create superadmin + sample data)
3. Run `npm run build` (build Next.js app)
4. Start with `npm run start`

### 4. Access Admin Panel

- Go to `/en/login` (or your locale)
- Login with `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`
- Admin panel at `/en/admin`

---

## Project Structure

```
Restorant/
├── app/
│   ├── [locale]/           # All pages with i18n routing
│   │   ├── page.tsx        # Homepage
│   │   ├── login/          # Auth pages
│   │   ├── register/
│   │   ├── menu/           # Menu & product pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Order placement
│   │   ├── orders/         # Order tracking
│   │   ├── wallet/         # Wallet management
│   │   ├── support/        # Customer support chat
│   │   └── admin/          # Admin dashboard
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Shared UI components
│   ├── admin/              # Admin-specific components
│   └── ...                 # Navbar, Footer, etc.
├── i18n/                   # i18n configuration
├── lib/                    # Utilities & Prisma client
├── messages/               # Translation files (en, ar, de, fr, ru)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── hooks/                  # React hooks
├── .env.example
├── next.config.ts
├── railway.json
└── README.md
```

## URL Structure

- `/en` — English homepage  
- `/ar` — Arabic homepage (RTL)
- `/en/menu` — Menu
- `/en/admin` — Admin dashboard
- `/en/admin/orders` — Order management
- `/en/admin/products` — Product management
- `/en/admin/users` — User management
- `/en/admin/settings` — Site settings
- `/en/admin/payments` — Payment settings
- `/en/admin/support` — Support messages
- `/en/admin/logs` — Activity logs

## Superadmin Credentials (Default)

- **Email**: `admin738ehdi83jje8eihe8@gmail.com`
- **Password**: Set via `SUPERADMIN_PASSWORD` env var (default: `SuperAdmin@2024!`)

> Change the password after first login!

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:push` | Push schema (dev only) |
| `npm run db:studio` | Open Prisma Studio |
