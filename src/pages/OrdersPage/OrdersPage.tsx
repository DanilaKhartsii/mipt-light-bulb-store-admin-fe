import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchOrders, updateOrderStatus, setStatusFilter, clearError,
} from '../../store/slices/ordersSlice';
import Pagination from '../../components/Pagination/Pagination';
import type { OrderListItem, OrderStatus } from '../../types';
import c from '../../components/common/common.module.css';
import s from './OrdersPage.module.css';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый', processing: 'В обработке', completed: 'Выполнен', cancelled: 'Отменён',
};

const BADGE_MAP: Record<OrderStatus, string> = {
  new: c.badgeNew, processing: c.badgeProcessing,
  completed: c.badgeCompleted, cancelled: c.badgeCancelled,
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  new:        ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed:  [],
  cancelled:  [],
};

function StatusCell({ order }: { order: OrderListItem }) {
  const dispatch = useAppDispatch();
  const options = NEXT_STATUSES[order.status] ?? [];
  const [next, setNext] = useState<OrderStatus>(options[0] ?? order.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  if (options.length === 0) {
    return <span className={`${c.badge} ${BADGE_MAP[order.status]}`}>{STATUS_LABELS[order.status]}</span>;
  }

  const handleApply = async () => {
    setSaving(true);
    try {
      await dispatch(updateOrderStatus({
        id: order.order_id,
        data: { status: next, change_reason: reason || undefined },
      })).unwrap();
      setReason('');
    } finally { setSaving(false); }
  };

  return (
    <div className={s.statusForm}>
      <span className={`${c.badge} ${BADGE_MAP[order.status]}`}>{STATUS_LABELS[order.status]}</span>
      <div className={s.statusRow}>
        <select className={s.statusSelect} value={next} onChange={e => setNext(e.target.value as OrderStatus)}>
          {options.map(st => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
        </select>
        <button className={s.applyBtn} onClick={handleApply} disabled={saving}>
          {saving ? '...' : '→'}
        </button>
      </div>
      <input
        className={s.reasonInput}
        placeholder="Причина (необязательно)..."
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
    </div>
  );
}

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { items, total, page, limit, statusFilter, loading, error } = useAppSelector(st => st.orders);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit, status: statusFilter || undefined }));
  }, [dispatch, page, limit, statusFilter]);

  const handlePage = (p: number) => {
    dispatch(fetchOrders({ page: p, limit, status: statusFilter || undefined }));
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
        <span className={s.filterLabel}>Статус:</span>
        <select
          className={s.filterSelect}
          value={statusFilter}
          onChange={e => dispatch(setStatusFilter(e.target.value as OrderStatus | ''))}
        >
          <option value="">Все</option>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(st => (
            <option key={st} value={st}>{STATUS_LABELS[st]}</option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--gray-500)' }}>
          Всего: <b style={{ color: 'var(--gray-900)' }}>{total}</b>
        </span>
      </div>

      <div className={c.card}>
        {loading ? (
          <div className={c.loadingWrap}><div className={c.spinner} /></div>
        ) : items.length === 0 ? (
          <div className={c.empty}>
            <div className={c.emptyIcon}>📦</div>
            <div>Заказов не найдено</div>
          </div>
        ) : (
          <table className={c.table}>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Покупатель</th>
                <th>Телефон</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус / Действие</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o, i) => (
                <tr key={o.order_id ?? i}>
                  <td><span className={s.orderId}>#{o.order_id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{o.customer_email}</div>
                  </td>
                  <td><span style={{ fontSize: 13 }}>{o.customer_phone}</span></td>
                  <td>
                    <span className={s.date}>
                      {new Date(o.created_at).toLocaleString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td><span className={s.total}>{o.total_amount?.toLocaleString('ru-RU')} ₽</span></td>
                  <td><StatusCell order={o} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} total={total} limit={limit} onChange={handlePage} />
    </>
  );
}
