import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchSocles, fetchShapes, fetchTypes,
  socleThunks, shapeThunks, typeThunks, clearError,
} from '../../store/slices/referencesSlice';
import type { AsyncThunk } from '@reduxjs/toolkit';
import c from '../../components/common/common.module.css';
import s from './ReferencesPage.module.css';

interface RefItem { id: number; title: string }

interface SectionProps {
  title: string;
  items: RefItem[];
  onCreate: (title: string) => Promise<void>;
  onUpdate: (id: number, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function RefSection({ title, items, onCreate, onUpdate, onDelete }: SectionProps) {
  const [newVal, setNewVal] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!newVal.trim()) return;
    setBusy(true);
    try { await onCreate(newVal.trim()); setNewVal(''); }
    finally { setBusy(false); }
  };

  const startEdit = (item: RefItem) => { setEditId(item.id); setEditVal(item.title); };
  const cancelEdit = () => setEditId(null);

  const handleUpdate = async (id: number) => {
    if (!editVal.trim()) return;
    setBusy(true);
    try { await onUpdate(id, editVal.trim()); setEditId(null); }
    finally { setBusy(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить запись?')) return;
    await onDelete(id);
  };

  return (
    <div className={c.card}>
      <div className={s.sectionHead}>
        <span className={s.sectionTitle}>{title}</span>
        <span className={s.sectionCount}>{items.length}</span>
      </div>
      <div className={s.list}>
        {items.length === 0 ? (
          <div style={{ padding: '20px 18px', color: 'var(--gray-400)', fontSize: 13 }}>Список пуст</div>
        ) : items.map(item => (
          <div key={item.id} className={s.item}>
            <span className={s.itemId}>#{item.id}</span>
            {editId === item.id ? (
              <div className={s.itemEdit}>
                <input
                  className={s.itemInput}
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdate(item.id); if (e.key === 'Escape') cancelEdit(); }}
                  autoFocus
                />
                <button className={s.iconBtn} onClick={() => handleUpdate(item.id)} title="Сохранить">✓</button>
                <button className={s.iconBtn} onClick={cancelEdit} title="Отмена">×</button>
              </div>
            ) : (
              <>
                <span className={s.itemName}>{item.title}</span>
                <div className={s.itemActions}>
                  <button className={s.iconBtn} onClick={() => startEdit(item)} title="Изменить">✏️</button>
                  <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => handleDelete(item.id)} title="Удалить">🗑</button>
                </div>
              </>
            )}
          </div>
        ))}
        </div>
      <div className={s.addRow}>
        <input
          className={s.addInput}
          placeholder={`Добавить ${title.toLowerCase()}...`}
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
        />
        <button className={s.addBtn} onClick={handleCreate} disabled={busy || !newVal.trim()}>
          + Добавить
        </button>
      </div>
    </div>
  );
}

export default function ReferencesPage() {
  const dispatch = useAppDispatch();
  const { socles, shapes, types, error } = useAppSelector(st => st.references);

  useEffect(() => {
    dispatch(fetchSocles());
    dispatch(fetchShapes());
    dispatch(fetchTypes());
  }, [dispatch]);

  const wrap = (thunk: AsyncThunk<any, any, any>) =>
    (...args: any[]) => dispatch(thunk(...args)).unwrap();

  return (
    <>
      {error && (
        <div className={c.errorBanner}>
          <span>⚠</span> {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: 'auto', fontSize: 16 }}>×</button>
        </div>
      )}

      <div className={s.grid}>
        <RefSection
          title="Цоколи"
          items={socles}
          onCreate={title => wrap(socleThunks.create)(title)}
          onUpdate={(id, title) => wrap(socleThunks.update)({ id, title })}
          onDelete={id => wrap(socleThunks.remove)(id)}
        />
        <RefSection
          title="Формы"
          items={shapes}
          onCreate={title => wrap(shapeThunks.create)(title)}
          onUpdate={(id, title) => wrap(shapeThunks.update)({ id, title })}
          onDelete={id => wrap(shapeThunks.remove)(id)}
        />
        <RefSection
          title="Типы"
          items={types}
          onCreate={title => wrap(typeThunks.create)(title)}
          onUpdate={(id, title) => wrap(typeThunks.update)({ id, title })}
          onDelete={id => wrap(typeThunks.remove)(id)}
        />
      </div>
    </>
  );
}