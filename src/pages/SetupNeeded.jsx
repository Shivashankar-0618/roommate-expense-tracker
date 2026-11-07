import { DatabaseZap } from 'lucide-react';
import { Card } from '../components/ui.jsx';

export default function SetupNeeded() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <Card>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-forest"><DatabaseZap size={20} /></span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-forest">Connect Supabase to start</h1>
        <p className="mt-2 text-ink-soft">RoomMate stores everything in your own Supabase project. Two quick steps:</p>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm text-ink">
          <li>
            In Supabase, open <strong>SQL Editor</strong>, paste the contents of <code className="rounded bg-ivory px-1.5 py-0.5">supabase/schema.sql</code> and run it.
          </li>
          <li>
            Copy <code className="rounded bg-ivory px-1.5 py-0.5">.env.example</code> to <code className="rounded bg-ivory px-1.5 py-0.5">.env</code>, fill in
            <code className="mx-1 rounded bg-ivory px-1.5 py-0.5">VITE_SUPABASE_URL</code> and
            <code className="mx-1 rounded bg-ivory px-1.5 py-0.5">VITE_SUPABASE_ANON_KEY</code>, then restart <code className="rounded bg-ivory px-1.5 py-0.5">npm run dev</code>.
          </li>
        </ol>
        <p className="mt-5 text-xs text-ink-soft">See README.md for the full walkthrough.</p>
      </Card>
    </main>
  );
}
