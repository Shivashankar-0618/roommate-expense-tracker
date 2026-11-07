# RoomMate — shared room expense tracker

React + Vite + Tailwind + Recharts on the front, Supabase (PostgreSQL + Row Level Security, no sign-in) on the back.
Theme: Forest & Sand. Money is stored and calculated as integer paise and shown in ₹.

## 1. Supabase setup (one time)

1. Create a project at https://supabase.com.
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
   (If you ran an earlier sign-in version of the file, uncomment the `drop table ...` line at its top first.)
3. **Project Settings → API**: copy the **Project URL** and the **anon public** key.

There is no sign-up or sign-in and nothing to configure under Authentication.

## 2. Run locally

```bash
cd roommate
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env and paste VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev                 # opens http://localhost:5173
```

Other commands:

```bash
npm test          # unit tests: paise math, 4-way split, month filtering/transitions
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## 3. First use

1. Open the app and, under **First time? Create a new room**, create your room. It starts with Shivuu, Ankush, Shashi, Tushar.
2. Copy the **room code** shown (it is also under **Roommates** at the top right) and send it to the other three.
3. Everyone types the code under **Enter your room**. The code is remembered on that device, so it's a one-time step.
   Use the exit icon in the header to switch rooms.

## How it works

- **Per head** = total ÷ number of active members (4 by default). **Balance** = paid − share.
  Positive (sage) = receives, negative (terracotta) = pays. Leftover paise are handed out one each
  so balances always net to exactly ₹0.00.
- **Monthly reset is date filtering only.** A month is just `YYYY-MM` of an expense's date. A new month matches
  no rows, so it starts at zero. Nothing is deleted or carried over; old months stay viewable with their original numbers.
- **Roommate changes**: removing someone applies from the current month onward, so past months keep their original split.
- **Few requests**: the whole room loads in ONE request, each add/edit/delete is one request, and the data is
  re-fetched only when you return to the tab. No sign-in calls, no realtime socket, no polling.
- **Security without accounts**: tables have Row Level Security on with no policies and all direct privileges revoked, so the
  public anon key cannot read or write them. The app can only call the functions in `schema.sql`, and every one requires the
  room code and touches only that room. **The room code is the password** (10 random characters): anyone who has it can view and
  edit that room, so share it only with your roommates. Never put the `service_role` key in this project.

## Deploy (optional)

`npm run build`, then upload `dist/` to Netlify/Vercel/Cloudflare Pages and set the same two `VITE_` variables there.

## Structure

```
supabase/schema.sql      tables, locked-down RLS, room-code protected functions
src/lib/money.js         paise <-> rupees, ₹ formatting
src/lib/dates.js         month keys, ranges
src/lib/calc.js          the ONE calculation used by both pages
src/hooks/useRoomData.js data loading and CRUD
src/pages/               Expenses, Analysis, EnterRoom
src/components/          table, form, month picker, charts, modals
```
