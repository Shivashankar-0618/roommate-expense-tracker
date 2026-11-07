import { useCallback, useMemo, useState } from 'react';
import { isConfigured } from './lib/supabase.js';
import { useRoomData } from './hooks/useRoomData.js';
import { buildHistory, calculateMonth } from './lib/calc.js';
import { currentMonthKey, monthKeyOf } from './lib/dates.js';
import { ErrorNote, Spinner } from './components/ui.jsx';
import Header from './components/Header.jsx';
import MembersModal from './components/MembersModal.jsx';
import EnterRoomPage from './pages/EnterRoomPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import SetupNeeded from './pages/SetupNeeded.jsx';

const KEY = 'roommate.code';
// The room code is only remembered on this device so you don't retype it.
// All expense data lives in Supabase, never in the browser.
const readCode = () => {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
};
const writeCode = (v) => {
  try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* private mode */ }
};

export default function App() {
  const [code, setCode] = useState(readCode);
  const enter = (c) => { writeCode(c); setCode(c); };
  const leave = useCallback(() => { writeCode(''); setCode(''); }, []);

  if (!isConfigured) return <SetupNeeded />;
  if (!code) return <EnterRoomPage onEnter={enter} />;
  return <Shell key={code} code={code} onLeave={leave} />;
}

function Shell({ code, onLeave }) {
  const [page, setPage] = useState('expenses');
  const [month, setMonth] = useState(currentMonthKey());
  const [showMembers, setShowMembers] = useState(false);
  const data = useRoomData(code, onLeave);

  // Monthly "reset" = filtering by date. Nothing is ever deleted or carried over.
  const monthExpenses = useMemo(
    () => data.expenses.filter((e) => monthKeyOf(e.expense_date) === month),
    [data.expenses, month]
  );
  // One calculation feeds BOTH pages, so the numbers can never disagree.
  const summary = useMemo(() => calculateMonth(monthExpenses, data.members, month), [monthExpenses, data.members, month]);
  const history = useMemo(() => buildHistory(data.expenses, data.members), [data.expenses, data.members]);

  const openMonth = (key) => {
    setMonth(key);
    setPage('expenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (data.loading && !data.room) return <Spinner />;

  return (
    <div className="min-h-screen">
      <Header
        page={page}
        onPage={setPage}
        roomName={data.room?.name || 'Room'}
        onMembers={() => setShowMembers(true)}
        onSignOut={onLeave}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {data.error && <div className="mb-6"><ErrorNote>{data.error}</ErrorNote></div>}
        {data.loading ? (
          <Spinner />
        ) : page === 'expenses' ? (
          <ExpensesPage
            month={month}
            onMonth={setMonth}
            summary={summary}
            expenses={monthExpenses}
            members={data.members}
            actions={data}
          />
        ) : (
          <AnalysisPage month={month} onMonth={setMonth} summary={summary} history={history} onOpenMonth={openMonth} />
        )}
      </main>

      {showMembers && data.room && (
        <MembersModal room={data.room} members={data.members} actions={data} onClose={() => setShowMembers(false)} />
      )}
    </div>
  );
}
