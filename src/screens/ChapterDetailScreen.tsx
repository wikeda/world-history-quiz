import { useNavigate, useParams } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useAppData } from '../state/AppDataContext';
import { countStates, masteryPct } from '../domain/aggregate';
import { StackedBarChart } from '../components/StackedBarChart';

export function ChapterDetailScreen() {
  const { chapter = '' } = useParams();
  const nav = useNavigate();
  const questions = useQuestions();
  const { data } = useAppData();

  const total = questions.filter((q) => q.chapter === chapter).length;
  const counts = countStates(questions, data.progress, chapter);
  const pct = masteryPct(counts);
  const rounds = data.chapterRounds[chapter] ?? [];
  const complete = pct >= 100;

  return (
    <div style={{ padding: 16, paddingBottom: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => nav(-1)} style={{ border: 'none', background: 'none', fontSize: 18, color: 'var(--muted)' }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{chapter}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{total}問</div>
        </div>
        <div style={{ fontWeight: 800, color: complete ? '#b8860b' : '#3f9e5a' }}>
          {complete ? '🏆 ' : ''}{pct}<span style={{ fontSize: 9, opacity: 0.7 }}>%</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--muted)', marginTop: 10 }}>
        <span>🟢 マスター {counts.mastered}</span>
        <span>🟡 あやふや {counts.unsure}</span>
        <span>🔴 できなかった {counts.failed}</span>
        <span>⚪ 未回答 {counts.unanswered}</span>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '14px 12px', marginTop: 14, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>この章の伸び 📈</div>
        {rounds.length === 0
          ? <div style={{ fontSize: 12, color: 'var(--muted)', padding: '20px 0', textAlign: 'center' }}>学習するとここに伸びが記録されます</div>
          : <StackedBarChart rounds={rounds} total={total} />}
      </div>

      <div style={{ position: 'fixed', bottom: 18, left: 16, right: 16, maxWidth: 448, margin: '0 auto' }}>
        {counts.unsure > 0 && (
          <button onClick={() => nav(`/study/unsure/${encodeURIComponent(chapter)}`)}
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid #f2e2b0', color: '#c98a00', borderRadius: 14, padding: 11, fontWeight: 800, marginBottom: 10 }}>
            ⚡ あやふや {counts.unsure}問だけ
          </button>
        )}
        <button className="btn-primary" onClick={() => nav(`/study/chapter/${encodeURIComponent(chapter)}`)}>
          {complete ? '🔁 もう一度ぜんぶ復習する' : '▶ この章を学習'}
        </button>
      </div>
    </div>
  );
}
