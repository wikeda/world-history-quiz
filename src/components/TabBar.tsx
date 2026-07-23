import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'ホーム', icon: '🏠' },
  { to: '/stats', label: '成績', icon: '📊' },
  { to: '/settings', label: '設定', icon: '⚙️' },
];

export function TabBar() {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>{t.icon}</span><span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
