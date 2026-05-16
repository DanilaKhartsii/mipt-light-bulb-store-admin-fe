import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { OrderListItem, OrderResponse, OrderStatusUpdate, PaginatedResponse, OrderStatus } from '../../types';

interface OrdersState {
  items: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  statusFilter: OrderStatus | '';
  selected: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [], total: 0, page: 1, limit: 20,
  statusFilter: '', selected: null, loading: false, error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async ({ page, limit, status }: { page: number; limit: number; status?: string }) => {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) q.set('status', status);
    return api.get<PaginatedResponse<OrderListItem>>(`/admin/orders?${q}`);
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOne',
  async (id: number) => api.get<OrderResponse>(`/admin/orders/${id}`)
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, data }: { id: number; data: OrderStatusUpdate }, { rejectWithValue }) => {
    try { return await api.patch<OrderResponse>(`/admin/orders/${id}/status`, data); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
    setPage: (s, a) => { s.page = a.payload; },
    setStatusFilter: (s, a) => { s.statusFilter = a.payload; s.page = 1; },
    clearSelected: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items;
        s.total = a.payload.total;
        s.page = a.payload.page;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.loading = false; s.error = a.error.message || 'Ошибка загрузки заказов';
      })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.selected = a.payload; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const idx = s.items.findIndex(o => o.order_id === a.payload.order_id);
        if (idx !== -1) s.items[idx].status = a.payload.status;
        if (s.selected?.order_id === a.payload.order_id) s.selected = a.payload;
      })
      .addCase(updateOrderStatus.rejected, (s, a) => { s.error = a.payload as string; });
  },
});

export const { clearError, setPage, setStatusFilter, clearSelected } = ordersSlice.actions;
export default ordersSlice.reducer;