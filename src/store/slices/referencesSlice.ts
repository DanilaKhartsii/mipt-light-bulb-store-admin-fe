import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import type { Socle, Shape, GoodType } from '../../types';

interface ReferencesState {
  socles: Socle[];
  shapes: Shape[];
  types: GoodType[];
  loading: boolean;
  error: string | null;
}

const initialState: ReferencesState = {
  socles: [], shapes: [], types: [], loading: false, error: null,
};

// API returns { socle_id, title } etc — normalize to { id, title }
const norm = (raw: any[], idField: string): { id: number; title: string }[] =>
  raw.map(x => ({ id: x[idField], title: x.title }));

export const fetchSocles = createAsyncThunk('refs/fetchSocles', () => api.get<any[]>('/admin/socles'));
export const fetchShapes = createAsyncThunk('refs/fetchShapes', () => api.get<any[]>('/admin/shapes'));
export const fetchTypes  = createAsyncThunk('refs/fetchTypes',  () => api.get<any[]>('/admin/types'));

export const fetchAllRefs = createAsyncThunk('refs/fetchAll', async (_, { dispatch }) => {
  await Promise.all([dispatch(fetchSocles()), dispatch(fetchShapes()), dispatch(fetchTypes())]);
});

const makeRefThunks = (name: string, path: string, idField: string) => ({
  create: createAsyncThunk(`refs/create${name}`, async (title: string, { rejectWithValue }) => {
    try {
      const raw = await api.post<any>(`/admin/${path}`, { title });
      return { id: raw[idField], title: raw.title } as Socle;
    } catch (e: any) { return rejectWithValue(e.message); }
  }),
  update: createAsyncThunk(`refs/update${name}`, async ({ id, title }: { id: number; title: string }, { rejectWithValue }) => {
    try {
      const raw = await api.put<any>(`/admin/${path}/${id}`, { title });
      return { id: raw[idField], title: raw.title } as Socle;
    } catch (e: any) { return rejectWithValue(e.message); }
  }),
  remove: createAsyncThunk(`refs/delete${name}`, async (id: number, { rejectWithValue }) => {
    try { await api.delete(`/admin/${path}/${id}`); return id; }
    catch (e: any) { return rejectWithValue(e.message); }
  }),
});

export const socleThunks = makeRefThunks('Socle', 'socles', 'socle_id');
export const shapeThunks = makeRefThunks('Shape', 'shapes', 'shape_id');
export const typeThunks  = makeRefThunks('Type',  'types',  'type_id');

const referencesSlice = createSlice({
  name: 'references',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocles.fulfilled, (s, a) => { s.socles = norm(a.payload, 'socle_id'); })
      .addCase(fetchShapes.fulfilled, (s, a) => { s.shapes = norm(a.payload, 'shape_id'); })
      .addCase(fetchTypes.fulfilled,  (s, a) => { s.types  = norm(a.payload, 'type_id'); })

      .addCase(socleThunks.create.fulfilled, (s, a) => { s.socles.push(a.payload as Socle); })
      .addCase(socleThunks.update.fulfilled, (s, a) => {
        const i = s.socles.findIndex(x => x.id === (a.payload as Socle).id);
        if (i !== -1) s.socles[i] = a.payload as Socle;
      })
      .addCase(socleThunks.remove.fulfilled, (s, a) => { s.socles = s.socles.filter(x => x.id !== a.payload); })

      .addCase(shapeThunks.create.fulfilled, (s, a) => { s.shapes.push(a.payload as Shape); })
      .addCase(shapeThunks.update.fulfilled, (s, a) => {
        const i = s.shapes.findIndex(x => x.id === (a.payload as Shape).id);
        if (i !== -1) s.shapes[i] = a.payload as Shape;
      })
      .addCase(shapeThunks.remove.fulfilled, (s, a) => { s.shapes = s.shapes.filter(x => x.id !== a.payload); })

      .addCase(typeThunks.create.fulfilled, (s, a) => { s.types.push(a.payload as GoodType); })
      .addCase(typeThunks.update.fulfilled, (s, a) => {
        const i = s.types.findIndex(x => x.id === (a.payload as GoodType).id);
        if (i !== -1) s.types[i] = a.payload as GoodType;
      })
      .addCase(typeThunks.remove.fulfilled, (s, a) => { s.types = s.types.filter(x => x.id !== a.payload); })

      .addCase(socleThunks.create.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(socleThunks.update.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(socleThunks.remove.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(shapeThunks.create.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(shapeThunks.update.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(shapeThunks.remove.rejected, (s, a) => { s.error = a.payload as string; })
      .addCase(typeThunks.create.rejected,  (s, a) => { s.error = a.payload as string; })
      .addCase(typeThunks.update.rejected,  (s, a) => { s.error = a.payload as string; })
      .addCase(typeThunks.remove.rejected,  (s, a) => { s.error = a.payload as string; });
  },
});

export const { clearError } = referencesSlice.actions;
export default referencesSlice.reducer;