# Dental CMS

A full-stack dental clinic management system built with Laravel, Inertia, React, and TypeScript.

It provides patient records, appointments, treatment plans, billing, inventory, insurance workflows, employees, SMS reminders, reports, and activity logs in one app.

## Tech Stack

- Backend: Laravel 12 (PHP), MySQL, Eloquent ORM
- Frontend: React 19 + TypeScript + Inertia.js
- Build tooling: Vite 7, Tailwind CSS 4
- Routing helpers: Laravel Wayfinder (`@laravel/vite-plugin-wayfinder`)
- Runtime process stack (Docker): Nginx + PHP-FPM + Supervisor
- Deployment target: Render (Docker service)

## Core Features

- Authentication (login/logout) and role-based access control (`admin`, `dentist`, `receptionist`)
- Patient management with timeline and image uploads
- Appointment scheduling and status workflows
- Dental chart entries (role-protected)
- Treatment plans and treatment plan items
- Billing/invoices, payment recording, official receipt issuing
- Insurance providers, patient insurance, and claims
- Inventory categories, stock, and transaction history
- Employee records, attendance, and leave management
- SMS reminder management and settings
- Reports (daily collection and patient visits)
- Activity log trail for key events

## How The App Works

### 1) Request / Response Flow

1. Browser requests a route.
2. Laravel route maps to a controller in `app/Http/Controllers`.
3. Controller queries models and returns an Inertia page.
4. React page in `resources/js/pages` renders UI and handles interactions.
5. Form/actions post back to Laravel endpoints and update data.

### 2) Authorization Model

- Most app routes are behind `auth` middleware.
- Additional authorization uses `role` middleware alias configured in `bootstrap/app.php`.
- Role-specific route groups are declared in `routes/web.php`.

### 3) Frontend Navigation + Actions

- Inertia handles page transitions without full page reloads.
- Wayfinder generates typed frontend action helpers under `resources/js/wayfinder` during build.

## Project Structure

- `app/Http/Controllers` - main business endpoints per module
- `app/Models` - Eloquent models and relationships
- `app/Http/Middleware` - request middleware (Inertia, role checks)
- `routes/web.php` - main authenticated route map
- `routes/auth.php` - login/logout routes
- `resources/js/pages` - page-level React/Inertia components
- `resources/js/layouts` - shared layouts
- `database/migrations` - schema history
- `database/seeders/DatabaseSeeder.php` - demo/test seed data
- `conf/nginx/nginx-site.conf` - Nginx server config (Docker runtime)
- `conf/supervisord.conf` - process supervisor config (Docker runtime)
- `scripts/start.sh` - container startup/bootstrap script
- `Dockerfile` - production container build/runtime definition

## Local Development

### Prerequisites

- PHP 8.2+ (project is compatible; Docker runtime currently uses PHP 8.4)
- Composer
- Node.js 22 recommended (for Vite 7)
- npm
- MySQL (or adjust DB settings)

### Setup

1. Install backend deps:

```bash
composer install
```

2. Install frontend deps:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Generate app key:

```bash
php artisan key:generate
```

5. Configure DB in `.env`, then migrate:

```bash
php artisan migrate
```

6. Optional: seed demo data:

```bash
php artisan db:seed
```

7. Run development stack:

```bash
composer run dev
```

This starts:
- Laravel app server
- queue listener
- Vite dev server

## Seeded Demo Accounts

When seeding is run (`php artisan db:seed`), these users are created:

- `admin@clinic.ph` / `password` (Admin)
- `drsantos@clinic.ph` / `password` (Dentist)
- `drreyes@clinic.ph` / `password` (Dentist)
- `staff@clinic.ph` / `password` (Receptionist)

## Build, Lint, and Test Commands

Frontend:

- `npm run dev` - Vite dev server
- `npm run build` - production frontend build
- `npm run lint:check` - ESLint check
- `npm run format:check` - Prettier check
- `npm run types:check` - TypeScript check

Backend:

- `composer run lint:check` - Pint check
- `composer run test` - Laravel test flow
- `composer run ci:check` - combined CI checks

## Docker Deployment

The container image:

1. Installs PHP, Nginx, Supervisor, Node, and Composer.
2. Installs PHP dependencies (`composer install --no-dev`).
3. Builds frontend assets (`npm ci && npm run build`).
4. Starts via `scripts/start.sh`:
   - ensures `.env` exists
   - ensures `APP_KEY` exists
   - fixes permissions for `storage` and `bootstrap/cache`
   - binds Nginx to dynamic `PORT`
   - launches Supervisor (`php-fpm` + `nginx`)

## Render Deployment Guide

Create a **Web Service** from this repo using the `Dockerfile`.

Set these environment variables in Render:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://<your-render-domain>`
- `APP_KEY=<your-base64-key>`
- `LOG_CHANNEL=stderr`
- `SESSION_DRIVER=file` (or `database` only if session table exists)
- `CACHE_STORE=file` (or `database` only if cache table exists)
- `DB_CONNECTION=mysql`
- `DB_HOST=...`
- `DB_PORT=3306`
- `DB_DATABASE=...`
- `DB_USERNAME=...`
- `DB_PASSWORD=...`

Recommended post-deploy checks:

- Open `/login` and confirm assets load over `https://`
- Confirm app can connect to DB
- Run migrations if needed

## Troubleshooting

### 500 Internal Server Error

Common causes:
- missing/invalid `APP_KEY`
- incorrect DB credentials
- using `database` session/cache driver without required tables
- permissions not writable for `storage` and `bootstrap/cache`

### Mixed Content (`http://` assets on `https://`)

If CSS/JS are blocked due to `http://` links:
- ensure `APP_URL` uses `https://...` on Render
- keep trusted proxy headers enabled in `bootstrap/app.php`
- clear browser cache after redeploy

### Build failures at `npm run build`

Check for:
- Node version mismatch (Node 22 recommended for Vite 7)
- Wayfinder build-time issues (requires Laravel app to boot during build)

## Security Notes

- Never commit real production secrets.
- Keep `.env` out of version control.
- Rotate `APP_KEY` and DB credentials if exposed.

## License

## The SMS feature is still not functional

This project is currently private/internal unless you add a license file.


###### The project is late to be uploaded in github as my laptop got broken while developing and also some other personal projects. 