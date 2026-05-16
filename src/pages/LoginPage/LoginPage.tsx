import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { login, clearError } from '../../store/slices/authSlice';
import s from './LoginPage.module.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(st => st.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      navigate('/admin/goods', { replace: true });
    }
  };

  return (
    <div className={s.root}>
      <div className={s.card}>
        <div className={s.top}>
          <div className={s.logoWrap}>
            <div className={s.logoIcon}>💡</div>
            <span className={s.logoName}>LightAdmin</span>
          </div>
          <div className={s.subtitle}>Панель управления магазином лампочек</div>
        </div>

        <div className={s.body}>
          <div className={s.heading}>Добро пожаловать</div>
          <div className={s.hint}>Войдите в аккаунт администратора</div>

          {error && (
            <div className={s.error}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={s.field}>
              <label className={s.label}>Логин</label>
              <input
                className={s.input}
                type="text"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Пароль</label>
              <input
                className={s.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button
              className={s.submit}
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <button
            className={s.demoBtn}
            type="button"
            onClick={() => { setUsername('admin'); setPassword('admin123'); }}
          >
            Войти под admin / admin123
          </button>
        </div>
      </div>
    </div>
  );
}