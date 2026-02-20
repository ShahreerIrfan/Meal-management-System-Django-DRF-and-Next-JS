# Smart Flat Meal & Expense Management System

A production-ready SaaS application for managing shared meals and expenses in residential flats. Built with **Django 5+** (REST API) and **Next.js 14+** (App Router, TypeScript).

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│    Nginx     │────▶│   Django     │
│  Frontend    │     │  (Reverse    │     │  Backend     │
│  :3000       │     │   Proxy :80) │     │  :8000       │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                          ┌───────┴───────┐
                                          │               │
                                    ┌─────▼──┐     ┌──────▼──┐
                                    │PostgreSQL│    │  Redis   │
                                    │  :5432   │    │  :6379   │
                                    └──────────┘    └──────────┘
```

## Features

- **Email-based authentication** with JWT (access + refresh tokens)
- **Multi-tenant** — each flat is an isolated workspace via `X-Flat-ID` header
- **Dynamic permission system** — 16 granular permissions assignable per member
- **Excel-like meal grid** — click-to-edit cells with auto-save (500ms debounce, no submit button)
- **Calculation engine** — isolated service layer computing meal rate, balances, shares
- **Month locking** — prevent edits to finalized months
- **Expense tracking** — full CRUD with audit log
- **Analytics dashboard** — 4 interactive charts (bar, pie, line, composed)
- **Invite system** — shareable links with expiry and usage limits
- **Dark mode** — system-preference-aware with manual toggle
- **Docker-ready** — single `docker-compose up` for full stack

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Backend    | Django 5, Django REST Framework, SimpleJWT, Gunicorn           |
| Database   | PostgreSQL 16                                                  |
| Cache      | Redis 7                                                        |
| Frontend   | Next.js 14 (App Router), TypeScript, TailwindCSS              |
| State      | Zustand (auth), React Query v5 (server state)                 |
| Charts     | Recharts                                                       |
| Proxy      | Nginx                                                          |
| Container  | Docker & Docker Compose                                        |

## Project Structure

```
├── backend/
│   ├── apps/
│   │   ├── core/          # TimeStampedModel, custom exception handler, pagination
│   │   ├── accounts/      # Custom User model, registration, profile
│   │   ├── flats/         # Flat, FlatMembership, InviteToken, middleware
│   │   ├── permissions/   # AppPermission, MemberPermission, guards
│   │   ├── meals/         # MealEntry, MonthlySummary, calculation_engine
│   │   ├── expenses/      # Expense, AuditLog
│   │   └── analytics/     # Aggregation services, chart endpoints
│   ├── config/            # Django settings, URLs, WSGI/ASGI
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # Summary cards + balance table
│   │   │   │   ├── meals/          # Excel-like meal grid
│   │   │   │   ├── expenses/       # Expense CRUD
│   │   │   │   ├── analytics/      # 4 chart types
│   │   │   │   ├── members/        # Member list + permission modal
│   │   │   │   └── settings/       # Flat config + invite management
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── join/[token]/
│   │   ├── lib/
│   │   │   ├── api/               # Axios service modules
│   │   │   ├── axios.ts           # JWT interceptors
│   │   │   ├── store.ts           # Zustand auth store
│   │   │   ├── types.ts           # TypeScript types
│   │   │   └── utils.ts           # Helpers
│   │   └── hooks/                 # useDebounce, usePermission
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── default.conf
├── docker-compose.yml
└── README.md
```

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and enter project
cd Meal_Management_system

# 2. Create backend .env
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# 3. Start everything
docker-compose up --build

# 4. Open http://localhost
```

### Option 2: Local Development

**Backend:**

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY, etc.

# Run migrations & seed
python manage.py migrate
python manage.py seed_permissions
python manage.py createsuperuser

# Start server
python manage.py runserver
```

**Frontend:**

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Description                    | Default                        |
| --------------------- | ------------------------------ | ------------------------------ |
| `SECRET_KEY`          | Django secret key              | (generate one)                 |
| `DEBUG`               | Debug mode                     | `False`                        |
| `DATABASE_URL`        | PostgreSQL connection string   | `postgres://...`               |
| `REDIS_URL`           | Redis connection string        | `redis://localhost:6379/0`     |
| `ALLOWED_HOSTS`       | Comma-separated hosts          | `localhost,127.0.0.1`          |
| `CORS_ALLOWED_ORIGINS`| Frontend URL                   | `http://localhost:3000`        |

### Frontend (`frontend/.env.local`)

| Variable               | Description       | Default                         |
| ---------------------- | ----------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend API URL   | `http://localhost:8000/api/v1`  |

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

### Authentication
| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| POST   | `/auth/register/`           | Register + create flat |
| POST   | `/auth/token/`              | Get JWT tokens      |
| POST   | `/auth/token/refresh/`      | Refresh access token |
| GET    | `/auth/profile/`            | Get current user    |
| PUT    | `/auth/profile/`            | Update profile      |
| POST   | `/auth/change-password/`    | Change password     |

### Flats
| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/flats/my/`                | List user's flats        |
| GET    | `/flats/detail/`            | Get active flat details  |
| GET    | `/flats/members/`           | List flat members        |
| POST   | `/flats/invite/`            | Create invite link       |
| GET    | `/flats/invites/`           | List invites             |
| POST   | `/flats/join/`              | Join flat via token      |
| DELETE | `/flats/members/<id>/remove/` | Remove member          |

### Meals
| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/meals/grid/?year=&month=` | Get month's meal grid    |
| PATCH  | `/meals/cell/`              | Update single meal cell  |
| GET    | `/meals/summary/?year=&month=` | Month summary         |
| POST   | `/meals/lock/`              | Lock month               |
| POST   | `/meals/unlock/`            | Unlock month             |

### Expenses
| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/expenses/`                | List expenses (filtered) |
| POST   | `/expenses/`                | Create expense           |
| GET    | `/expenses/<id>/`           | Get expense detail       |
| PUT    | `/expenses/<id>/`           | Update expense           |
| DELETE | `/expenses/<id>/`           | Delete expense           |
| GET    | `/expenses/audit-log/`      | View audit trail         |

### Permissions
| Method | Endpoint                                | Description               |
| ------ | --------------------------------------- | ------------------------- |
| GET    | `/permissions/all/`                     | List all permissions      |
| GET    | `/permissions/my/`                      | Current user's permissions |
| GET    | `/permissions/member/<id>/`             | Member's permissions      |
| POST   | `/permissions/member/<id>/set/`         | Set member permissions    |

### Analytics
| Method | Endpoint                             | Description              |
| ------ | ------------------------------------ | ------------------------ |
| GET    | `/analytics/meals-per-user/`         | Meal count per user      |
| GET    | `/analytics/expenses-per-user/`      | Expense share per user   |
| GET    | `/analytics/daily-trend/`            | Daily meal trend         |
| GET    | `/analytics/monthly-comparison/`     | Month-over-month data    |

## Permission System

16 granular permissions across 5 modules:

| Module    | Permissions                                                    |
| --------- | -------------------------------------------------------------- |
| meals     | `view_meals`, `add_meal`, `edit_own_meal`, `edit_any_meal`, `delete_meal` |
| expenses  | `view_expenses`, `add_expense`, `edit_own_expense`, `edit_any_expense`, `delete_expense` |
| analytics | `view_analytics`, `export_analytics`                           |
| flat      | `edit_flat`, `lock_month`                                      |
| members   | `manage_permissions`, `create_invite`                          |

- **Owners** bypass all permission checks automatically
- Permissions are assigned per-membership (a user can have different permissions in different flats)

## Calculation Engine

The core calculation logic lives in `apps/meals/calculation_engine.py`:

```
meal_rate = total_expenses / total_meals
individual_cost = user_meals × meal_rate
balance = total_paid_by_user − individual_cost
```

- Positive balance = overpaid (owed money back)
- Negative balance = underpaid (owes the group)
- Recalculation triggers automatically on meal/expense mutations
- Results are cached in `MonthlySummary` table

## License

MIT
