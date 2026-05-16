import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { GoodResponse, GoodCreate, PaginatedResponse } from '../../types';

interface GoodsState {
  items: GoodResponse[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

const initialState: GoodsState = {
  items: [], total: 0, page: 1, limit: 20, loading: false, error: null,
};

export const fetchGoods = createAsyncThunk(
  'goods/fetchAll',
  async ({ page, limit }: { page: number; limit: number }) =>
    api.get<PaginatedResponse<GoodResponse>>(`/admin/goods?page=${page}&limit=${limit}`)
);

export const createGood = createAsyncThunk(
  'goods/create',
  async (data: GoodCreate, { rejectWithValue }) => {
    try { return await api.post<GoodResponse>('/admin/goods', data); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const updateGood = createAsyncThunk(
  'goods/update',
  async ({ id, data }: { id: number; data: GoodCreate }, { rejectWithValue }) => {
    try { return await api.put<GoodResponse>(`/admin/goods/${id}`, data); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const toggleGoodVisibility = createAsyncThunk(
  'goods/toggleVisibility',
  async ({ id, is_visible }: { id: number; is_visible: boolean }, { rejectWithValue }) => {
    try { return await api.patch<GoodResponse>(`/admin/goods/${id}/visibility`, { is_visible }); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const deleteGood = createAsyncThunk(
  'goods/delete',
  async (id: number, { rejectWithValue }) => {
    try { await api.delete(`/admin/goods/${id}`); return id; }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const goodsSlice = createSlice({
  name: 'goods',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setPage: (state, action) => { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoods.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGoods.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items;
        s.total = a.payload.total;
        s.page = a.payload.page;
      })
      .addCase(fetchGoods.rejected, (s, a) => {
        s.loading = false; s.error = a.error.message || 'Ошибка загрузки';
      })
      .addCase(createGood.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(updateGood.fulfilled, (s, a) => {
        const idx = s.items.findIndex(g => g.good_id === a.payload.good_id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(updateGood.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(toggleGoodVisibility.fulfilled, (s, a) => {
        const idx = s.items.findIndex(g => g.good_id === a.payload.good_id);
        if (idx !== -1) s.items[idx].is_visible = a.payload.is_visible;
      })
      .addCase(toggleGoodVisibility.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(deleteGood.fulfilled, (s, a) => {
        s.items = s.items.filter(g => g.good_id !== a.payload);
        s.total = Math.max(0, s.total - 1);
      })
      .addCase(deleteGood.rejected, (s, a) => { s.error = a.payload as string; });
  },
});

export const { clearError, setPage } = goodsSlice.actions;
export default goodsSlice.reducer;