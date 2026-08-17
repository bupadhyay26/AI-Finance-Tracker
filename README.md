# PocketIQ

A full-stack personal finance tracker built with React, Vite, Tailwind CSS, Node.js, Express and Supabase.

## Features

- Add, edit and delete income/expense transactions
- Search and filter transactions
- Automatic balance, income and expense calculations
- Profile with sign-in/sign-out state stored in the browser
- Job details, monthly salary and saving goal
- Monthly salary automatically contributes to the **Total Income** card
- Saving goal and planned spending information in Profile
- Quick Add for common transactions (Food, Travel, Shopping, Bills, Salary)
- CSV bank-statement import with preview before importing
- Expense analytics chart
- Press **Enter** while editing a transaction to save changes

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- CORS

### Database
- Supabase

## Project Structure

```text
PocketIQ/
├── client/
│   └── src/
│       ├── api/
│       └── components/
└── server/
    ├── config/
    ├── controllers/
    └── routes/
```

## Run Locally

### 1. Frontend

Open Terminal 1:

```bash
cd client
npm install
npm run dev
```

Frontend: `http://localhost:6784`

### 2. Backend

Open Terminal 2:

```bash
cd server
npm install
npm run dev
```

Backend: `http://localhost:6913`

The backend requires the Supabase values in `server/.env`.

## Bank Statement CSV Format

The importer works with CSV files containing at least a description/title column and an amount column. It also understands common names such as:

- Title / Description / Narration / Merchant / Particulars
- Amount / Value / Transaction Amount
- Type / Transaction Type / Credit-Debit
- Date / Transaction Date

Example:

```csv
Description,Amount,Type,Date
Salary,50000,Credit,2026-08-01
Grocery,1200,Debit,2026-08-03
Travel,500,Debit,2026-08-05
```

Review the imported rows in the app before clicking **Import Transactions**.

## Important

The current Profile sign-in/sign-out is browser-local state. It is not production-grade authentication. Supabase Auth can be added later without changing the transaction UI.


## Latest features

- Profile avatar in the navbar with local profile storage.
- Monthly salary is included automatically in Total Income and Balance.
- Add Transaction form is always available for manual entries.
- Transaction Edit has been removed; Delete remains.
- Salary review prompt appears on the first or last day of a month and lets the user update salary after an increment.
- Quick Add and CSV Bank Statement import.
- AI Financial Insights endpoint at `POST /api/ai/insights`.
- AI uses OpenAI when `OPENAI_API_KEY` is configured; otherwise a local finance-analysis fallback keeps the feature usable.

### Enable live AI

In `server/.env` add:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-mini
```

Keep the API key on the server only; never put it in React/client code.


## Latest UI update
- Quick Add and Bank Statement are displayed above the manual Add Transaction form.
- Quick Add includes browser voice input. In Chrome/Edge, say commands such as `food 500`, `travel 300`, or `salary 50000`.
- Voice input uses the browser Speech Recognition API and does not require an additional AI API key.


## PWA & Notifications

The latest client is installable as a PWA and includes the selected Finance Progress app icon. Use the bell button in the top-right corner to enable browser notifications.

Scheduled reminders (local browser time):
- 7:00 AM — morning expense check
- 12:00 PM — midday expense check
- 7:00 PM — day-end expense check
- 1st of every month, 9:00 AM — salary / allowance update
- 5th of every month, 9:00 AM — follow-up income reminder

For local development, scheduled notifications run while the app/PWA is open. Reliable delivery while the browser is completely closed requires a deployed Web Push backend (VAPID + push service).
