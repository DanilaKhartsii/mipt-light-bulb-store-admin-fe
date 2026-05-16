import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchGoods, createGood, updateGood,
  toggleGoodVisibility, deleteGood, clearError,
} from '../../store/slices/goodsSlice';
import { fetchAllRefs } from '../../store/slices/referencesSlice';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import type { GoodResponse, GoodCreate } from '../../types';
import c from '../../components/common/common.module.css';
import s from './GoodsPage.module.css';

const EMPTY_FORM: GoodCreate = {
  title: '', description: null, price: 0, quantity: 0,
  is_visible: true, socle_id: null, shape_id: null, type_id: null, suppliers_id: null,
};

export default function GoodsPage() {
  const dispatch = useAppDispatch();
  const { items, total, page, limit, loading, error } = useAppSelector(st => st.goods);
  const { socles, shapes, types } = useAppSelector(st => st.references);
  const suppliers = useAppSelector(st => st.suppliers.items);

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<GoodResponse | null>(null);
  const [form, setForm] = useState<GoodCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback((p: number) => {
    dispatch(fetchGoods({ page: p, limit }));
  }, [dispatch, limit]);

  useEffect(() => {
    load(1);
    dispatch(fetchAllRefs());
  }, [load, dispatch]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal('create');
  };

  const openEdit = (g: GoodResponse) => {
    setEditing(g);
    setForm({
      title: g.title,
      description: g.description,
      price: g.price,
      quantity: g.quantity,
      is_visible: g.is_visible,
      socle_id: g.socle_id,
      shape_id: g.shape_id,
      type_id: g.type_id,
      suppliers_id: g.suppliers_id,
    });
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await dispatch(createGood(form)).unwrap();
        load(1);
      } else if (editing) {
        await dispatch(updateGood({ id: editing.good_id, data: form })).unwrap();
      }
      setModal(null);
    } catch {
      // error shown by slice
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (g: GoodResponse) => {
    dispatch(toggleGoodVisibility({ id: g.good_id, is_visible: !g.is_visible }));
  };

  const handleDelete = (id: number) => {
    if (!confirm('Удалить товар?')) return;
    dispatch(deleteGood(id));
  };

  const f = (field: keyof GoodCreate, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const lookupTitle = (arr: { id: number; title: string }[], id: number | null) =>
    arr.find(x => x.id === id)?.title ?? null;

  return (
    <>
      {error && (
        <div className={c.errorBanner}>
          <span>⚠</span> {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: 'auto', fontSize: 16 }}>×</button>
        </div>
      )}

      <div className={s.toolbar}>
        <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Всего: <b style={{ color: 'var(--gray-900)' }}>{total}</b>
        </span>
        <button className={c.btnPrimary} onClick={openCreate}>+ Добавить товар</button>
      </div>

      <div className={c.card}>
        {loading ? (
          <div className={c.loadingWrap}><div className={c.spinner} /></div>
        ) : items.length === 0 ? (
          <div className={c.empty}>
            <div className={c.emptyIcon}>💡</div>
            <div>Товаров пока нет</div>
          </div>
        ) : (
          <table className={c.table}>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Кол-во</th>
                <th>Видимость</th>
                <th>Цоколь</th>
                <th>Форма</th>
                <th>Тип</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(g => {
                const socleName  = lookupTitle(socles, g.socle_id);
                const shapeName  = lookupTitle(shapes, g.shape_id);
                const typeName   = lookupTitle(types,  g.type_id);
                return (
                  <tr key={g.good_id}>
                    <td><span className={s.sku}>#{g.good_id}</span></td>
                    <td className={s.titleCell}>
                      <div className={s.goodTitle}>{g.title}</div>
                      {g.description && <div className={s.goodDesc}>{g.description}</div>}
                    </td>
                    <td><span className={s.price}>{g.price.toLocaleString('ru-RU')} ₽</span></td>
                    <td><span className={s.qty}>{g.quantity} шт.</span></td>
                    <td>
                      <label className={c.toggle}>
                        <input
                          type="checkbox"
                          checked={g.is_visible}
                          onChange={() => handleToggle(g)}
                        />
                        <span className={c.toggleTrack} />
                      </label>
                    </td>
                    <td>{socleName ? <span className={s.tag}>{socleName}</span> : <span className={s.dash}>—</span>}</td>
                    <td>{shapeName ? <span className={s.tag}>{shapeName}</span> : <span className={s.dash}>—</span>}</td>
                    <td>{typeName  ? <span className={s.tag}>{typeName}</span>  : <span className={s.dash}>—</span>}</td>
                    <td>
                      <div className={s.actions}>
                        <button className={c.btnGhost} onClick={() => openEdit(g)}>✏️</button>
                        <button className={c.btnDanger} onClick={() => handleDelete(g.good_id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} total={total} limit={limit} onChange={load} />

      {modal && (
        <Modal title={modal === 'create' ? 'Новый товар' : 'Редактировать товар'} onClose={() => setModal(null)}>
          <div className={c.field}>
            <label className={c.label}>Название *</label>
            <input className={c.input} value={form.title} onChange={e => f('title', e.target.value)} placeholder="Лампочка LED E27" />
          </div>
          <div className={c.field}>
            <label className={c.label}>Описание</label>
            <textarea className={c.textarea} value={form.description ?? ''} onChange={e => f('description', e.target.value || null)} placeholder="Необязательно..." />
          </div>
          <div className={c.formRow}>
            <div className={c.field}>
              <label className={c.label}>Цена (₽) *</label>
              <input className={c.input} type="number" min="0" step="0.01" value={form.price} onChange={e => f('price', parseFloat(e.target.value) || 0)} />
            </div>
            <div className={c.field}>
              <label className={c.label}>Количество</label>
              <input className={c.input} type="number" min="0" value={form.quantity} onChange={e => f('quantity', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className={c.formRow}>
            <div className={c.field}>
              <label className={c.label}>Цоколь</label>
              <select className={c.select} value={form.socle_id ?? ''} onChange={e => f('socle_id', e.target.value ? +e.target.value : null)}>
                <option value="">Не выбрано</option>
                {socles.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
            </div>
            <div className={c.field}>
              <label className={c.label}>Форма</label>
              <select className={c.select} value={form.shape_id ?? ''} onChange={e => f('shape_id', e.target.value ? +e.target.value : null)}>
                <option value="">Не выбрано</option>
                {shapes.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
            </div>
          </div>
          <div className={c.formRow}>
            <div className={c.field}>
              <label className={c.label}>Тип</label>
              <select className={c.select} value={form.type_id ?? ''} onChange={e => f('type_id', e.target.value ? +e.target.value : null)}>
                <option value="">Не выбрано</option>
                {types.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
            </div>
            <div className={c.field}>
              <label className={c.label}>Поставщик</label>
              <select className={c.select} value={form.suppliers_id ?? ''} onChange={e => f('suppliers_id', e.target.value ? +e.target.value : null)}>
                <option value="">Не выбрано</option>
                {suppliers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
          </div>
          <div className={s.checkRow}>
            <label className={c.toggle}>
              <input type="checkbox" checked={form.is_visible} onChange={e => f('is_visible', e.target.checked)} />
              <span className={c.toggleTrack} />
            </label>
            <label>Показывать в магазине</label>
          </div>
          <div className={c.formActions}>
            <button className={c.btnGhost} onClick={() => setModal(null)}>Отмена</button>
            <button className={c.btnPrimary} onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}