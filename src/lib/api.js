// Thin wrapper around Supabase. No sign-in: every call sends the room code to a
// database function that only touches that room (see supabase/schema.sql).
import { supabase } from './supabase.js';

export const normalizeCode = (code) => String(code || '').trim().toUpperCase();

async function rpc(fn, args) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message || 'Something went wrong');
  return data;
}

const fixExpense = (e) => ({ ...e, amount_paise: Number(e.amount_paise) });

/** Creates a room, returns its room code. */
export const createRoom = (name) => rpc('create_room', { p_name: name });

/** ONE request: room + members + every expense. Also validates the code. */
export async function getRoomData(code) {
  const d = await rpc('get_room_data', { p_code: normalizeCode(code) });
  return { room: d.room, members: d.members, expenses: d.expenses.map(fixExpense) };
}

export const addExpense = async (code, { description, amount_paise, paid_by, expense_date }) =>
  fixExpense(
    await rpc('add_expense', {
      p_code: code, p_description: description, p_amount_paise: amount_paise, p_paid_by: paid_by, p_expense_date: expense_date,
    })
  );

export const updateExpense = async (code, id, { description, amount_paise, paid_by, expense_date }) =>
  fixExpense(
    await rpc('update_expense', {
      p_code: code, p_id: id, p_description: description, p_amount_paise: amount_paise, p_paid_by: paid_by, p_expense_date: expense_date,
    })
  );

export const deleteExpense = (code, id) => rpc('delete_expense', { p_code: code, p_id: id });

export const renameMember = (code, id, name) => rpc('rename_member', { p_code: code, p_id: id, p_name: name });

/** activeUntil = first day of the current month removes them from the split from this month on; null restores. */
export const setMemberActiveUntil = (code, id, activeUntil) =>
  rpc('set_member_active_until', { p_code: code, p_id: id, p_until: activeUntil });

export const addMember = (code, name, activeFrom) =>
  rpc('add_member', { p_code: code, p_name: name, p_active_from: activeFrom });
