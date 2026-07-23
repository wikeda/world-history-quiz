import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Flashcard } from './Flashcard';

const q = { no: 1, chapter: 'A', question: 'Qテキスト', answer: 'Aテキスト' };

describe('Flashcard', () => {
  it('問題文を表示する', () => {
    render(<Flashcard question={q} onJudge={() => {}} />);
    expect(screen.getByText('Qテキスト')).toBeInTheDocument();
  });

  it('→キーで known 判定', () => {
    const onJudge = vi.fn();
    render(<Flashcard question={q} onJudge={onJudge} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onJudge).toHaveBeenCalledWith('known');
  });

  it('↑キーで unsure, ←キーで failed', () => {
    const onJudge = vi.fn();
    render(<Flashcard question={q} onJudge={onJudge} />);
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onJudge).toHaveBeenNthCalledWith(1, 'unsure');
    expect(onJudge).toHaveBeenNthCalledWith(2, 'failed');
  });

  it('↓キーで解答が表示される', () => {
    render(<Flashcard question={q} onJudge={() => {}} />);
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    const ans = screen.getByText('Aテキスト');
    expect(ans).toBeVisible();
  });
});
