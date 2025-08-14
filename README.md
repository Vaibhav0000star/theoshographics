
# Brochure Print Spec Dashboard (Full‑Stack)

A Node.js + SQLite web app to capture, store, and manage brochure print specifications in a clean dashboard UI.

## Quick Start

```bash
# 1) Move into the project
cd brochure-spec-dashboard

# 2) Install dependencies
npm install

# 3) Run the app
npm run dev
# Open http://localhost:3000
```

The app creates `data.db` (SQLite) and an `uploads/` folder on first run.

## Features

- Dashboard UI built with Tailwind (no build step).
- REST API with Express.
- SQLite via `better-sqlite3` for simple, zero-config persistence.
- File upload endpoint for keyline images (served from `/uploads/...`).
- CRUD (Create/Read/Update/Delete) for specs.
- Export current form to JSON and print/save as PDF (via browser print dialog).

## API

- `GET /api/specs` → list all
- `GET /api/specs/:id` → get one
- `POST /api/specs` → create
- `PUT /api/specs/:id` → update
- `DELETE /api/specs/:id` → delete
- `POST /api/upload` → multipart upload (`file` field)

## Deploy Notes

- For a quick cloud deploy, use services like Render, Railway, Fly.io, or a VPS.
- Ensure the `uploads/` directory is writable.
- For HTTPS & domain: put this behind Nginx or use your platform’s SSL.
- Set `PORT` env var if your host provides one.

## Mapping to Your Original Form

All fields from your **Brochure Print Specification Form** are included:
- Project details (title, client, date, qty, sizes, orientation, pages, sides)
- Paper & printing (cover/inner stock, printing type, finish, foil area, spot UV)
- Binding & finishing (binding type, spine, creasing, trimming)
- Special instructions
- Artwork delivery notes (file format, bleed, safe zone, color profile)
- Keyline upload (image URL stored)

## Optional Enhancements

- User login (JWT) if multi-user access is needed.
- PDF generation on the server with Puppeteer.
- Dropdown presets for common GSM and finishes.
- Multi-file uploads for keyline and die-cut guides.
- Audit log with who edited what, when.
