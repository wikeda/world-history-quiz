import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from '../state/AppDataContext';
import { StudyScreen } from './StudyScreen';

beforeEach(() => localStorage.clear());

function renderAt(path: string) {
  return render(
    <AppDataProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/study/:mode/:chapter" element={<StudyScreen />} />
          <Route path="/result" element={<div>リザルト</div>} />
        </Routes>
      </MemoryRouter>
    </AppDataProvider>,
  );
}

describe('StudyScreen', () => {
  it('進捗と問題を表示し、全問回答でリザルトへ', () => {
    renderAt('/study/chapter/古代オリエント');
    expect(screen.getByText(/\/\s*\d+/)).toBeInTheDocument();
    for (let i = 0; i < 60; i++) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      if (screen.queryByText('リザルト')) break;
    }
    expect(screen.getByText('リザルト')).toBeInTheDocument();
  });
});
