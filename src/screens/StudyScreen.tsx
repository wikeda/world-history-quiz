import { useEffect, useMemo, useRef, useState } from 'react';
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

  // セッションと「開始時点」のスナップショットを初回に固定する
  const initial = useMemo(() => {
    const opts = { order: data.settings.order, sessionSize: data.settings.sessionSize };
    let session;
    if (mode === 'failed') {
      const nos = (loc.state as { failedNos?: number[] } | null)?.failedNos ?? [];
      session = pickByNumbers(questions, nos);
    } else if (mode === 'unsure') {
      session = buildUnsureSession(questions, data.progress, chapter, opts);
    } else {
      session = buildChapterSession(questions, data.progress, chapter, { ...opts, maintenanceRatio: 0.2 });
    }
    const beforePct = chapter === 'all' ? 0 : masteryPct(countStates(questions, data.progress, chapter));
    const streakBefore = data.streak.current;
    return { session, beforePct, streakBefore };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const session = initial.session;
  const [idx, setIdx] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const tally = useRef({ known: 0, unsure: 0, failed: 0 });
  const finished = useRef(false);

  // 最後の回答がストアへ反映された後の描画で round を記録して遷移する（off-by-one 回避）
  useEffect(() => {
    if (!finishing || finished.current) return;
    finished.current = true;
    if (chapter !== 'all') {
      const counts: Counts = countStates(questions, data.progress, chapter);
      const round = (data.chapterRounds[chapter]?.length ?? 0) + 1;
      recordRound(chapter, { round, timestamp: Date.now(), counts, masteryPct: masteryPct(counts) });
    }
    const failedNos = session.map((s) => s.no).filter((no) => data.progress[no]?.state === 'failed');
    navigate('/result', {
      replace: true,
      state: {
        chapter, mode, total: session.length, tally: tally.current,
        failedNos, beforePct: initial.beforePct, streakBefore: initial.streakBefore,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishing, data]);

  if (session.length === 0) {
    return <div style={{ padding: 24 }}>この条件の問題はありません。<button onClick={() => navigate(-1)}>戻る</button></div>;
  }

  const q = session[idx];

  function judge(result: SwipeResult) {
    recordAnswer(q.no, result);
    tally.current[result]++;
    const next = idx + 1;
    if (next >= session.length) setFinishing(true);
    else setIdx(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '18px 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <button onClick={() => navigate(-1)}
          style={{ border: 'none', background: 'none', color: 'var(--text)', fontSize: 18, fontWeight: 800, padding: 0, cursor: 'pointer' }}>
          <span style={{ color: 'var(--muted)', fontWeight: 400, marginRight: 4 }}>‹</span>{chapter === 'all' ? 'あやふや復習' : chapter}
        </button>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, marginTop: 12 }}>
        <div style={{ width: `${((idx + 1) / session.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 6, transition: 'width .2s' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 69, fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{idx + 1}</span>
          <span style={{ fontSize: 27, fontWeight: 700, color: 'var(--muted)', marginLeft: 7 }}>/ {session.length}</span>
        </div>
        {/* key を問題ごとに変えてカードを作り直す＝解答の表示状態を確実にリセット（一瞬の解答表示を防止） */}
        <Flashcard key={q.no} question={q} onJudge={judge} />
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
        ← できなかった ・ ↑ あやふや ・ → 覚えた ・ ↓ 解答
      </div>
    </div>
  );
}
