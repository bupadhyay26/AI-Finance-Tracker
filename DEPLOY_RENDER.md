# AI Finance Tracker — Render deployment

This project uses two Render services:

1. **ai-finance-tracker-api** — Node/Express backend
2. **ai-finance-tracker** — React/Vite frontend

## 1. Put the project on GitHub

Create a GitHub repository and push this project (do not commit any `.env` file or API keys).

## 2. Deploy with Render Blueprint

In Render: **New → Blueprint** and select the GitHub repository containing `render.yaml`.

Render will create both services.

## 3. Backend environment variables

For `ai-finance-tracker-api`, add:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_ANON_KEY` = your Supabase anon/public key
- `OPENAI_API_KEY` = optional; leave blank if not using OpenAI insights
- `OPENAI_MODEL` = `gpt-5-mini`

Never put API keys into the frontend or GitHub.

## 4. Connect the frontend to the backend

After the API service deploys, copy its public URL, for example:

`https://ai-finance-tracker-api.onrender.com`

In the frontend Render service, add:

`VITE_API_URL=https://ai-finance-tracker-api.onrender.com`

Then redeploy the frontend.

## 5. Local development still works

Without `VITE_API_URL`, the frontend falls back to:

`http://localhost:6913`

So local development is not broken.
