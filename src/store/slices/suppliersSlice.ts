import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { Supplier } from '../../types';

interface SuppliersState {
  items: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = { items: [], loading: false, error: null };

const normSupplier = (raw: any): Supplier => ({ id: raw.supplier_id ?? raw.id, name: raw.name });

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchAll',
  () => api.get<any[]>('/admin/suppliers')
);

export const createSupplier = createAsyncThunk(
  'suppliers/create',
  async (name: string, { rejectWithValue }) => {
    try { return normSupplier(await api.post<any>('/admin/suppliers', { name })); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/update',
  async ({ id, name }: { id: number; name: string }, { rejectWithValue }) => {
    try { return normSupplier(await api.put<any>(`/admin/suppliers/${id}`, { name })); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/delete',
  async (id: number, { rejectWithValue }) => {
    try { await api.delete(`/admin/suppliers/${id}`); return id; }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const addGoodToSupplier = createAsyncThunk(
  'suppliers/addGood',
  async ({ supplierId, goodId }: { supplierId: number; goodId: number }, { rejectWithValue }) => {
    try {
      await api.post<void>(`/admin/suppliers/${supplierId}/goods`, { good_id: goodId });
      return { supplierId, goodId };
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const removeGoodFromSupplier = createAsyncThunk(
  'suppliers/removeGood',
  async ({ supplierId, goodId }: { supplierId: number; goodId: number }, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/suppliers/${supplierId}/goods/${goodId}`);
      return { supplierId, goodId };
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSuppliers.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.map(normSupplier); })
      .addCase(fetchSuppliers.rejected,  (s, a) => { s.loading = false; s.error = a.error.message || 'Ошибка'; })
      .addCase(createSupplier.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(createSupplier.rejected,  (s, a) => { s.error = a.payload as string; })
      .addCase(updateSupplier.fulfilled, (s, a) => {
        const i = s.items.findIndex(x => x.id === a.payload.id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(updateSupplier.rejected,  (s, a) => { s.error = a.payload as string; })
      .addCase(deleteSupplier.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); })
      .addCase(deleteSupplier.rejected,  (s, a) => { s.error = a.payload as string; })
      .addCase(addGoodToSupplier.rejected,    (s, a) => { s.error = a.payload as string; })
      .addCase(removeGoodFromSupplier.rejected,(s, a) => { s.error = a.payload as string; });
  },
});

export const { clearError } = suppliersSlice.actions;
export default suppliersSlice.reducer;