# PocketIQ updates

## Branding
- App name is now PocketIQ.
- Browser/PWA title and manifest use PocketIQ.

## Money Lent / Money Borrowed
Users only enter:
- Person name
- Original amount

PocketIQ stores these entries locally and automatically calculates:
- Original
- Received / Paid Back
- Remaining
- To Receive / To Pay

Repayments are added with one button and a small amount prompt.

## Balance behavior
- Money Lent: original amount reduces cash balance; received repayments increase it.
- Money Borrowed: original amount increases cash balance; repayments reduce it.
- Lent/borrowed amounts are not counted as ordinary income/expense.

The loan records use browser localStorage so the existing Supabase transaction schema does not need new columns for this UI feature.
