import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import s from './Layout.module.css';

const NAV = [
  { to: '/admin/goods',      icon: '💡', label: 'Товары' },
  { to: '/admin/orders',     icon: '📦', label: 'Заказы' },
  { to: '/admin/references', icon: '📋', label: 'Справочники' },
  { to: '/admin/suppliers',  icon: '🏭', label: 'Поставщики' },
];

const TITLES: Record<string, string> = {
  '/admin/goods':      'Товары',
  '/admin/orders':     'Заказы',
  '/admin/references': 'Справочники',
  '/admin/suppliers':  'Поставщики',
};

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector(st => st.auth.token);
  const title = TITLES[pathname] ?? 'Админ-панель';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className={s.root}>
      <aside className={s.sidebar}>
        <div className={s.logo}>
          <div className={s.logoIcon}>💡</div>
          <div className={s.logoText}>
            <span className={s.logoName}>LightAdmin</span>
            <span className={s.logoSub}>Магазин лампочек</span>
          </div>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${s.navItem}${isActive ? ' ' + s.active : ''}`}
            >
              <span className={s.navIcon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={s.sidebarFooter}>
          {token && (
            <button className={s.logoutBtn} onClick={handleLogout}>
              <span>🚪</span> Выйти
            </button>
          )}
          <div className={s.version}>v1.0.0 · Light Bulb Store</div>
        </div>
      </aside>

      <div className={s.main}>
        <header className={s.header}>
          <span className={s.pageTitle}>{title}</span>
        </header>
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}