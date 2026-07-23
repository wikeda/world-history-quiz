import { useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import { useQuestions } from '../hooks/useQuestions';
import { countStates, masteryPct } from '../domain/aggregate';
import { Confetti } from '../components/Confetti';

interface ResultState {
  chapter: string; total: number;
  tally: { known: number; unsure: number; failed: number };
  failedNos: number[];
}

export function ResultScreen() {
  const nav = useNavigate();
  const { data } = useAppData();
  const questions = useQuestions();
  const st = (useLocation().state ?? null) as ResultState | null;

  if (!st) { nav('/'); return null; }

  const pct = masteryPct(countStates(questions, data.progress, st.chapter));

  return (
    <div style={{ minHeight: '100vh', position: 'relative', padding: '34px 22px 100px', textAlign: 'center' }}>
      <Confetti />
      <div style={{ fontSize: 42 }}>🎉</div>
      <div style={{ fontSize: 21, fontWeight: 800 }}>おつかれさま！</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{st.chapter} ・ {st.total}問</div>

      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 18, padding: 16, marginTop: 18, boxShadow: 'var(--shadow)' }}>
        <Stat n={st.tally.known} label="覚えた" color="#3f9e5a" />
        <Stat n={st.tally.unsure} label="あやふや" color="#c98a00" border />
        <Stat n={st.tally.failed} label="できなかった" color="#d23b3b" />
      </div>

      <div style={{ background: '#f0f7f2', border: '1px solid #d6ecdd', borderRadius: 16, padding: 14, marginTop: 12, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: '#5a8a68' }}>この章の習熟度</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#3f9e5a', marginTop: 4 }}>{pct}<span style={{ fontSize: 10 }}>%</span> ・ グラフに記録しました 📈</div>
      </div>

      <div style={{ position: 'fixed', bottom: 18, left: 22, right: 22, maxWidth: 436, margin: '0 auto' }}>
        <button className="btn-primary" style={{ marginBottom: 9 }}
          onClick={() => nav(`/study/chapter/${encodeURIComponent(st.chapter)}`, { replace: true })}>
          🔁 もう一度挑戦
        </button>
        {st.failedNos.length > 0 && (
          <button onClick={() => nav(`/study/failed/${encodeURIComponent(st.chapter)}`, { replace: true, state: { failedNos: st.failedNos } })}
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid #f2e2b0', color: '#c98a00', borderRadius: 14, padding: 11, fontWeight: 800, marginBottom: 9 }}>
            ⚡ できなかった{st.failedNos.length}問だけ復習
          </button>
        )}
        <button onClick={() => nav('/')} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--muted)', padding: 8, fontWeight: 700 }}>
          ホームにもどる
        </button>
      </div>
    </div>
  );
}

function Stat({ n, label, color, border }: { n: number; label: string; color: string; border?: boolean }) {
  return (
    <div style={{ flex: 1, borderLeft: border ? '1px solid var(--border)' : undefined, borderRight: border ? '1px solid var(--border)' : undefined }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{n}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
