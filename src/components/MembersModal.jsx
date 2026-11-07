import { useState } from 'react';
import { Check, Copy, UserMinus, UserPlus, Undo2 } from 'lucide-react';
import { Button, ErrorNote, IconButton, Modal, inputCls } from './ui.jsx';
import { currentMonthKey } from '../lib/dates.js';
import { isActiveInMonth } from '../lib/calc.js';

function MemberRow({ member, active, onRename, onDeactivate, onReactivate, setError }) {
  const [name, setName] = useState(member.name);
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const commit = () => {
    const v = name.trim();
    if (!v) return setName(member.name);
    if (v !== member.name) run(() => onRename(member.id, v));
  };

  return (
    <li className="flex items-center gap-2">
      <input
        aria-label={`Name of roommate ${member.name}`}
        value={name}
        disabled={busy}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`${inputCls} ${active ? '' : 'opacity-50'}`}
      />
      {active ? (
        <IconButton icon={UserMinus} label={`Remove ${member.name} from this month's split`} tone="danger" disabled={busy} onClick={() => run(() => onDeactivate(member.id))} />
      ) : (
        <IconButton icon={Undo2} label={`Restore ${member.name}`} disabled={busy} onClick={() => run(() => onReactivate(member.id))} />
      )}
    </li>
  );
}

export default function MembersModal({ room, members, actions, onClose }) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const now = currentMonthKey();
  const activeCount = members.filter((m) => isActiveInMonth(m, now)).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(room.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable - the code is visible anyway */
    }
  };

  const add = async (e) => {
    e.preventDefault();
    const v = newName.trim();
    if (!v) return;
    try {
      setError('');
      await actions.addMember(v);
      setNewName('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="Roommates" onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Room code</p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="font-display text-2xl font-semibold tracking-[0.18em] text-forest">{room.join_code}</span>
            <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy} className="!bg-ivory">
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Anyone with this code can open the room and edit expenses, so share it only with your roommates.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm text-ink-soft">
            Splitting between <strong className="text-forest">{activeCount}</strong> {activeCount === 1 ? 'person' : 'people'} this month. Tap a name to rename it.
          </p>
          <ul className="space-y-2">
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                active={isActiveInMonth(m, now)}
                onRename={actions.rename}
                onDeactivate={actions.deactivate}
                onReactivate={actions.reactivate}
                setError={setError}
              />
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-soft">
            Removing someone only changes the split from the current month onward. Earlier months keep their original numbers.
          </p>
        </div>

        <form onSubmit={add} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add another roommate"
            maxLength={40}
            className={inputCls}
            aria-label="New roommate name"
          />
          <Button type="submit" variant="secondary" icon={UserPlus} disabled={!newName.trim()}>Add</Button>
        </form>

        <ErrorNote>{error}</ErrorNote>
      </div>
    </Modal>
  );
}
