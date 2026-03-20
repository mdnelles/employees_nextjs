# Employee Dashboard

A full-featured employee management dashboard built with Next.js 14, featuring interactive analytics, comprehensive data views, and a demo-safe architecture that prevents any modifications to the underlying data store.

**Live Demo:** [https://emp-dash.nelles.io/login](https://emp-dash.nelles.io/login)

![Analytics Dashboard](/public/readme/read2.png)

![Employee Detail with Salary History](/public/readme/read1.png)

## Overview

This application provides an interactive interface for exploring and analyzing employee data across multiple dimensions — departments, salaries, titles, managers, and more. It was built as a demonstration tool, so all edit and delete operations are handled exclusively in React session state and never persisted to the data store.

The dataset is seeded from a parsed SQL dump containing 524 employees across 9 departments, with full relational data including salary histories, title progressions, department assignments, and management records.

## Tech Stack

### Frontend

- **Next.js 14** (App Router) — React framework with file-based routing, server components, and API routes
- **React 18** — UI library with hooks-based state management
- **TypeScript** — Type safety across the entire codebase
- **Tailwind CSS** — Utility-first CSS framework with custom component classes (`card`, `input`, `btn-primary`, etc.)
- **Recharts** — Composable charting library used for bar charts, pie charts, area charts, line charts, and stacked bar charts

### Backend

- **Next.js API Routes** — RESTful endpoints under `/api` for all data operations
- **In-Memory JSON Data Store** — Parsed from a 170MB SQL dump into a ~1MB `seed.json` file, loaded into memory at startup
- **JWT Authentication** — Token-based auth using `jsonwebtoken` with Bearer token headers
- **No External Database Required** — The entire dataset lives in memory, making the app fully self-contained and portable

### Infrastructure

- **Node.js v24** — Runtime environment
- **PM2** — Process manager for production deployment
- **Nginx** — Reverse proxy with SSL termination
- **Let's Encrypt** — SSL certificates
- **GitHub Actions** — CI/CD pipeline for automated builds and deployments

## Features

### Analytics Dashboard

The main dashboard provides 10 interactive visualizations:

- **Summary Cards** — Total employees, departments, and average salary at a glance
- **Department Salary Comparison** — Bar chart comparing average salaries across all 9 departments
- **Gender Distribution** — Pie chart showing workforce gender breakdown
- **Hiring Trend** — Area chart displaying hiring volume by year
- **Title Distribution** — Horizontal bar chart of employee counts by job title
- **Salary Range Distribution** — Histogram of salary brackets
- **Tenure Distribution** — Bar chart of employee tenure ranges
- **Department Size** — Bar chart of headcount per department
- **Age Distribution** — Bar chart of employee age ranges
- **Salary by Title** — Grouped bar chart showing min, avg, and max salary per title
- **Gender by Department** — Stacked bar chart of gender breakdown per department

### Employee Management

- Paginated employee list with search and department filtering (50 per page)
- Expandable employee rows showing birth date, age, tenure, current salary, and an interactive salary history line chart
- Session-only edit and delete capabilities (changes never persist to the data store)

### Department Explorer

- Card-based grid view of all 9 departments showing employee count and average salary
- Click-through detail modals with salary statistics, title distribution, and gender breakdown charts

### Additional Views

- **Managers** — List of department managers with assignment periods
- **Salaries** — Filterable salary records with department and range filters, paginated
- **Titles** — Employee title assignments with date ranges

### Demo Mode

All destructive operations (edit, delete) are intercepted at the API layer and handled via React Context session state. The `AxiosLike` API wrapper returns success responses for PUT and DELETE requests without touching the data store. A session edit counter in the sidebar tracks how many changes have been made, with a reset button to clear them.

### Authentication

JWT-based login with a demo account pre-filled on the login page. Protected routes redirect unauthenticated users to the login screen. Tokens are stored in localStorage and sent as Bearer tokens on all API requests.

## Project Structure

```
NextJS/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── analytics/          # Dashboard analytics endpoint
│   │   │   ├── auth/login/         # JWT authentication
│   │   │   ├── departments/        # Department CRUD + detail
│   │   │   ├── employees/          # Employee CRUD + detail
│   │   │   ├── managers/           # Manager listings
│   │   │   ├── salaries/           # Salary records with filtering
│   │   │   └── titles/             # Title assignments
│   │   ├── (protected)/            # Auth-guarded route group
│   │   │   ├── dashboard/          # Analytics dashboard
│   │   │   ├── departments/        # Department cards + detail modals
│   │   │   ├── employees/          # Employee table with expandable rows
│   │   │   ├── managers/           # Manager list
│   │   │   ├── salaries/           # Salary browser
│   │   │   └── titles/             # Title browser
│   │   ├── login/                  # Login page
│   │   └── layout.tsx              # Root layout
│   ├── components/
│   │   ├── AuthProvider.tsx        # Auth context + session edit tracking
│   │   ├── Modal.tsx               # Reusable modal component
│   │   ├── Pagination.tsx          # Pagination controls
│   │   └── Sidebar.tsx             # Navigation sidebar
│   ├── data/
│   │   └── seed.json               # In-memory dataset (524 employees)
│   ├── lib/
│   │   ├── api-client.ts           # Raw fetch API client
│   │   ├── api.ts                  # AxiosLike wrapper (demo-safe PUT/DELETE)
│   │   ├── auth.ts                 # Server-side JWT utilities
│   │   └── db.ts                   # In-memory data store
│   └── types/                      # TypeScript interfaces
├── public/
│   └── readme/                     # Screenshot assets
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind theme with custom colors
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js v24+
- npm

### Installation

```bash
cd NextJS
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

### Demo Credentials

```
Email:    demo@emplo.yees
Password: f98h34F#$FT
```

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to the production server on push to `main` or `master`. The workflow:

1. Checks out code and installs dependencies
2. Builds the Next.js production bundle
3. Creates a deployment archive with the build output, node_modules, and source files
4. Deploys via SSH to `/var/www/emp-dash.nelles.io/app`
5. Preserves the server's `.env.production` across deployments
6. Restarts the PM2 process on port 3015
7. Verifies the deployment is responding

### Required GitHub Secrets

- `SERVER_HOST` — Server IP or hostname
- `SERVER_USER` — SSH username
- `SSH_PRIVATE_KEY` — SSH private key for authentication
- `SSH_PORT` — SSH port (defaults to 22)

## Data

The dataset originates from a parsed MySQL `employees.sql` dump and includes:

- **524 employees** with birth dates, hire dates, and gender
- **9 departments** (Customer Service, Development, Finance, Human Resources, Marketing, Production, Quality Management, Research, Sales)
- **24 department managers** across all departments
- **576 department-employee assignments**
- **5,111 salary records** with date ranges
- **787 title records** with date ranges
- **30 user accounts** for authentication
