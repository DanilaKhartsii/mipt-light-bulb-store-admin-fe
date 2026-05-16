import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchSuppliers, createSupplier, updateSupplier,
  deleteSupplier, addGoodToSupplier, removeGoodFromSupplier, clearError,
} from '../../store/slices/suppliersSlice';
import { fetchGoods } from '../../store/slices/goodsSlice';
import type { Supplier } from '../../types';
import c from '../../components/common/common.module.css';
import s from './SuppliersPage.module.css';

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const dispatch = useAppDispatch();
  const allGoods = useAppSelector(st => st.goods.items);
  const [selectedGoodId, setSelectedGoodId] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(supplier.name);
  const [busy, setBusy] = useState(false);

  const linkedGoods = allGoods.filter(g => g.suppliers_id === supplier.id);
  const linkedIds = new Set(linkedGoods.map(g => g.good_id));
  const available = allGoods.filter(g => !linkedIds.has(g.good_id));

  const handleAdd = async () => {
    if (!selectedGoodId) return;
    setBusy(true);
    try {
      await dispatch(addGoodToSupplier({ supplierId: supplier.id, goodId: +selectedGoodId })).unwrap();
      setSelectedGoodId('');
      dispatch(fetchGoods({ page: 1, limit: 200 }));
    } finally { setBusy(false); }
  };

  const handleRemove = async (goodId: number) => {
    await dispatch(removeGoodFromSupplier({ supplierId: supplier.id, goodId })).unwrap();
    dispatch(fetchGoods({ page: 1, limit: 200 }));
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить поставщика "${supplier.name}"?`)) return;
    dispatch(deleteSupplier(supplier.id));
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === supplier.name) { setEditing(false); return; }
    setBusy(true);
    try {
      await dispatch(updateSupplier({ id: supplier.id, name: editName.trim() })).unwrap();
      setEditing(false);
    } finally { setBusy(false); }
  };

  return (
    <div className={s.supplierCard}>
      <div className={s.supplierHead}>
        <div className={s.supplierIcon}>🏭</div>
        <div className={s.supplierInfo}>
          {editing ? (
            <input
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 5, padding: '3px 8px', color: '#fff', fontSize: 14, width: '100%', fontFamily: 'Outfit, sans-serif' }}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
          ) : (
            <>
              <div className={s.supplierName}>{supplier.name}</div>
              <div className={s.supplierId}>ID #{supplier.id} · {linkedGoods.length} товаров</div>
            </>
          )}
        </div>
        <div className={s.supplierActions}>
          {editing
            ? <button className={s.headBtn} onClick={handleSaveName} title="Сохранить">✓</button>
            : <button className={s.headBtn} onClick={() => setEditing(true)} title="Переименовать">✏️</button>
          }
          <button className={`${s.headBtn} ${s.headBtnDanger}`} onClick={handleDelete} title="Удалить">🗑</button>
        </div>
      </div>

      <div className={s.goodsList}>
        {linkedGoods.length === 0 ? (
          <div className={s.emptyGoods}>Товары не привязаны</div>
        ) : (
          linkedGoods.map(g => (
            <div key={g.good_id} className={s.goodItem}>
              <span className={s.goodSku}>#{g.good_id}</span>
              <span className={s.goodName}>{g.title}</span>
              <button className={s.removeGoodBtn} onClick={() => handleRemove(g.good_id)} title="Отвязать">×</button>
            </div>
          ))
        )}
      </div>

      {available.length > 0 && (
        <div className={s.addGoodRow}>
          <select
            className={s.addGoodSelect}
            value={selectedGoodId}
            onChange={e => setSelectedGoodId(e.target.value)}
          >
            <option value="">Привязать товар...</option>
            {available.map(g => <option key={g.good_id} value={g.good_id}>{g.title}</option>)}
          </select>
          <button className={s.addGoodBtn} onClick={handleAdd} disabled={busy || !selectedGoodId}>
            + Привязать
          </button>
        </div>
      )}
    </div>
  );
}

export default function SuppliersPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(st => st.suppliers);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchGoods({ page: 1, limit: 200 }));
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await dispatch(createSupplier(newName.trim())).unwrap();
      setNewName('');
    } finally { setCreating(false); }
  };

  return (
    <>
      {error && (
        <div className={c.errorBanner}>
          <span>⚠</span> {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: 'auto', fontSize: 16 }}>×</button>
        </div>
      )}

      <div className={s.toolbar}>
        <div className={s.addSupplierForm}>
          <input
            className={c.input}
            placeholder="Название поставщика..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
          />
          <button className={c.btnPrimary} onClick={handleCreate} disabled={creating || !newName.trim()}>
            + Добавить
          </button>
        </div>
        <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Поставщиков: <b style={{ color: 'var(--gray-900)' }}>{items.length}</b>
        </span>
      </div>

      {loading ? (
        <div className={c.loadingWrap}><div className={c.spinner} /></div>
      ) : items.length === 0 ? (
        <div className={c.empty}>
          <div className={c.emptyIcon}>🏭</div>
          <div>Поставщиков пока нет</div>
        </div>
      ) : (
        <div className={s.grid}>
          {items.map(sup => <SupplierCard key={sup.id} supplier={sup} />)}
        </div>
      )}
    </>
  );
}
