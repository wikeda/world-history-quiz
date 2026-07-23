import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useAppData } from '../state/AppDataContext';
import { Flashcard } from '../components/Flashcard';
import { buildChapterSession, buildUnsureSession, pickByNumbers } from '../domain/session';
import { countStates, masteryPct } from '../domain/aggregate';
import type { SwipeResult, Counts } from '../domain/types';

export function StudyScreen() {
  const { mode = 'chapter', chapter = '' } = useParams();
  const questions = useQuestions();
  const { data, recordAnswer, recordRound } = useAppData();
  const navigate = useNavigate();
  const loc = useLocation();

  const session = useMemo(() => {
    const opts = { order: data.settings.order, sessionSize: data.settings.sessionSize };
    if (mode === 'failed') {
      const nos = (loc.state as { failedNos?: number[] } | null)?.failedNos ?? [];
      return pickByNumbers(questions, nos);
    }
    if (mode === 'unsure') return buildUnsureSession(questions, data.progress, chapter, opts);
    return buildChapterSession(questions, data.progress, chapter, { ...opts, maintenanceRatio: 0.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [idx, setIdx] = useState(0);
  const tally = useRef({ known: 0, unsure: 0, failed: 0 });

  if (session.length === 0) {
    return <div style={{ padding: 24 }}>この条件の問題はありません。<button onClick={() => navigate(-1)}>戻る</button></div>;
  }

  const q = session[idx];

  function judge(result: SwipeResult) {
    recordAnswer(q.no, result);
    tally.current[result]++;
    const next = idx + 1;
    if (next >= session.length) finish();
    else setIdx(next);
  }

  function finish() {
    const counts: Counts = countStates(questions, data.progress, chapter);
    const round = (data.chapterRounds[chapter]?.length ?? 0) + 1;
    recordRound(chapter, { round, timestamp: Date.now(), counts, masteryPct: masteryPct(counts) });
    navigate('/result', {
      state: { chapter, total: session.length, tally: tally.current,
        failedNos: session.filter((_, i) => i <= idx).map((s) => s.no)
          .filter((no) => data.progress[no]?.state === 'failed') },
    });
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
        <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', color: 'var(--muted)' }}>‹ {chapter}</button>
        <span>{idx + 1} / {session.length}</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, margin: '8px 0 20px' }}>
        <div style={{ width: `${((idx + 1) / session.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
      </div>
      <Flashcard question={q} onJudge={judge} />
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--muted)' }}>
        ← できなかった ・ ↑ あやふや ・ → 覚えた ・ ↓ 解答
      </div>
    </div>
  );
}
