import { useCallback, useEffect, useState } from 'react';
import * as api from '../lib/api.js';
import { currentMonthKey, firstDayOfMonth } from '../lib/dates.js';

/**
 * Loads the room (room + members + expenses) in ONE request and exposes mutations.
 * After every mutation local state is updated from the row the database returned, so
 * both pages recalculate immediately. No realtime socket and no polling: the data is
 * simply re-fetched when the tab regains focus, which keeps request counts tiny.
 */
export function useRoomData(code, onInvalidCode) {
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const d = await api.getRoomData(code);
      setRoom(d.room);
      setMembers(d.members);
      setExpenses(d.expenses);
      setError('');
    } catch (err) {
      if (/invalid room code/i.test(err.message)) onInvalidCode?.();
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code, onInvalidCode]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  // Pick up roommates' changes when you come back to the tab.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && reload();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  const add = async (values) => {
    const row = await api.addExpense(code, values);
    setExpenses((prev) => (prev.some((x) => x.id === row.id) ? prev : [row, ...prev]));
  };

  const edit = async (id, values) => {
    const row = await api.updateExpense(code, id, values);
    setExpenses((prev) => prev.map((x) => (x.id === id ? row : x)));
  };

  const remove = async (id) => {
    await api.deleteExpense(code, id);
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  };

  const replaceMember = (row) => setMembers((prev) => prev.map((m) => (m.id === row.id ? row : m)));

  const rename = async (id, name) => replaceMember(await api.renameMember(code, id, name));

  /** Remove from the split starting this month (earlier months keep their original numbers). */
  const deactivate = async (id) =>
    replaceMember(await api.setMemberActiveUntil(code, id, firstDayOfMonth(currentMonthKey())));

  const reactivate = async (id) => replaceMember(await api.setMemberActiveUntil(code, id, null));

  const addMember = async (name) => {
    const row = await api.addMember(code, name, firstDayOfMonth(currentMonthKey()));
    setMembers((prev) => [...prev, row]);
  };

  return { room, members, expenses, loading, error, reload, add, edit, remove, rename, deactivate, reactivate, addMember };
}
