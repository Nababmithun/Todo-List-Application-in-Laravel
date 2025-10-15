
# Laravel 12 Todo API (Tasks + Subtasks + Sanctum)

Simple, production-ready REST API for a Todo application built with **Laravel 12**.  
Features token-based auth (Laravel **Sanctum**), per-user task ownership, nested **subtasks**, validation, pagination, and a ready Postman collection.

---

## ✨ Features

- 🔐 **Token Auth (Sanctum)** — Register/Login/Logout, `/api/me`
- 👤 **Per-user data** — প্রতিটি ইউজার শুধু নিজের task/subtask দেখতে/এডিট করতে পারবে
- ✅ **Tasks CRUD** — title, description, due_date, priority, is_completed, completed_at
- ✅ **Subtasks CRUD** — `task_id` FK + cascade delete; shallow routes for show/update/delete
- 🔀 **Toggle complete** — quick PATCH endpoints for task & subtask completion
- 🔎 **Filtering & Pagination** — `q`, `is_completed`, `due_date_from`, `due_date_to`, `priority`, `per_page`
- 🧹 **Soft deletes** — নিরাপদে ডিলিট (future restore-ready)
- 🧰 **Form Request Validation** + **API Resources** for clean JSON
- 🧪 **Postman Collection** — Auth/Tasks/Subtasks সব রেডি

---

## 🧱 Tech Stack

- PHP 8.2+, Laravel 12
- MySQL 8+ (or MariaDB)
- Composer
- Laravel Sanctum

---

## ✅ Prerequisites

- PHP 8.2+, Composer
- MySQL running
- Node.js (optional, not needed for pure API)
- Git (optional)

---

## 🚀 Quick Start

```bash
# 1) Clone & enter
git clone <your-repo-url>
cd Todo-List-Application-in-Laravel

# 2) Install deps
composer install

# 3) Environment
cp .env.example .env
php artisan key:generate

# 4) Configure database in .env
# DB_DATABASE=todos_db, DB_USERNAME=..., DB_PASSWORD=...

# 5) Sanctum (if not already installed)
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 6) Migrate (and seed if you enabled seeders)
php artisan migrate
# php artisan db:seed   # optional

# 7) Serve
php artisan serve
# App: http://127.0.0.1:8000



cmd:
    composer create-project laravel/laravel project-name
    project location to cmd:
    code .
    
Terminal Open:
    ctrl + j
    
    Basic Command:
    php artisan serve
    npm i
    npm run dev
Cash Clear & Run:
    php artisan optimize:clear
    npm run dev
    php artisan serve

C panel & H panel & AWS :
   Server a deploy:
   Server a updated:

admin login:
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

password:
fNF=ruF?8

Database Clear :
php artisan migrate:fresh --seed

local database export 
H panel -- database -- cleardata--drop--import--database

