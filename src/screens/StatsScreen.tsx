import { useNavigate } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useAppData } from '../state/AppDataContext';
import { chapterList, countStates, masteryPct, overallMastery } from '../domain/aggregate';
import { MasteryRing } from '../components/MasteryRing';
import { masteryColor } from '../domain/colors';

export function StatsScreen() {
  const nav = useNavigate();
  const questions = useQuestions();
  const { data } = useAppData();
  const chapters = chapterList(questions);
  const overall = overallMastery(questions, data.progress);

  const ranked = chapters
    .map((c) => ({ c, pct: masteryPct(countStates(questions, data.progress, c)) }))
    .filter((x) => x.pct < 100)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18 }}>成績</h1>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--surface)', borderRadius: 18, padding: 16, boxShadow: 'var(--shadow)' }}>
        <MasteryRing pct={overall.pct} size={70} />
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>全体の習熟度</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{overall.mastered} / {overall.total} 問マスター</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 14, marginTop: 12, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ fontWeight: 700 }}>🔥 ストリーク</span>
          <span style={{ color: 'var(--muted)' }}>現在 {data.streak.current} / 最長 {data.streak.longest}</span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', margin: '0 2px 6px' }}>苦手な章（優先的に）</div>
        <div style={{ background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          {ranked.map((r) => (
            <div key={r.c} onClick={() => nav(`/chapter/${encodeURIComponent(r.c)}`)}
              style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: masteryColor(r.pct) }} />
              <span style={{ flex: 1, fontSize: 13 }}>{r.c}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: masteryColor(r.pct) }}>{r.pct}<span style={{ fontSize: 8 }}>%</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
