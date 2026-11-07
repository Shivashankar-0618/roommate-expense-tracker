import { useState } from 'react';
import { ArrowRight, Check, Copy, DoorOpen, Home, KeyRound } from 'lucide-react';
import { Button, Card, ErrorNote, Field, inputCls } from '../components/ui.jsx';
import * as api from '../lib/api.js';

export default function EnterRoomPage({ onEnter }) {
  const [code, setCode] = useState('');
  const [roomName, setRoomName] = useState('Our Room');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null); // room code just created
  const [copied, setCopied] = useState(false);

  const enter = async (e) => {
    e.preventDefault();
    setBusy('enter');
    setError('');
    try {
      await api.getRoomData(code); // validates the code
      onEnter(api.normalizeCode(code));
    } catch (err) {
      setError(/invalid room code/i.test(err.message) ? 'That room code was not found. Check it and try again.' : err.message);
      setBusy('');
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setBusy('create');
    setError('');
    try {
      setCreated(await api.createRoom(roomName.trim() || 'Our Room'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(created);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* the code is visible anyway */
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-forest p-8 text-ivory sm:p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-forest"><Home size={20} /></span>
          <span className="font-display text-2xl font-semibold">RoomMate</span>
        </div>
        <div className="my-14 max-w-md lg:my-0">
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Shared rent and bills, settled without the spreadsheet.
          </h1>
          <p className="mt-5 text-sage">Enter your room code and you are in. No accounts, no passwords.</p>
        </div>
        <p className="hidden text-xs text-sage/80 lg:block">Every month starts at zero. Nothing from the past is ever deleted.</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-rise space-y-8">
          {created ? (
            <Card className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-forest">Room created</h2>
              <p className="text-sm text-ink-soft">Save this code and share it with your roommates. It is the only way in.</p>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-ivory p-4">
                <span className="font-display text-2xl font-semibold tracking-[0.18em] text-forest">{created}</span>
                <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
              </div>
              <Button className="w-full" icon={ArrowRight} onClick={() => onEnter(created)}>Open my room</Button>
            </Card>
          ) : (
            <>
              <form onSubmit={enter} className="space-y-5">
                <div>
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sand text-forest"><KeyRound size={19} /></span>
                  <h2 className="font-display text-3xl font-semibold text-forest">Enter your room</h2>
                  <p className="mt-1 text-sm text-ink-soft">Type the room code your roommates use.</p>
                </div>
                <Field label="Room code">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={20}
                    autoComplete="off"
                    autoCapitalize="characters"
                    placeholder="A1B2C3D4E5"
                    className={`${inputCls} font-semibold uppercase tracking-[0.2em]`}
                  />
                </Field>
                <ErrorNote>{error}</ErrorNote>
                <Button type="submit" loading={busy === 'enter'} disabled={code.trim().length < 4} className="w-full">Enter room</Button>
              </form>

              <div className="border-t border-sand-deep pt-6">
                <form onSubmit={create} className="space-y-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-forest"><DoorOpen size={16} /> First time? Create a new room</p>
                  <Field label="Room name">
                    <input value={roomName} onChange={(e) => setRoomName(e.target.value)} maxLength={60} className={inputCls} />
                  </Field>
                  <Button type="submit" variant="secondary" loading={busy === 'create'} className="w-full">Create room</Button>
                </form>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
