// Normalized (id always = number for convenience in UI)
export interface Socle    { id: number; title: string }
export interface Shape    { id: number; title: string }
export interface GoodType { id: number; title: string }
export interface Supplier { id: number; name: string }

// Exact API response (flat, only IDs for relations)
export interface GoodResponse {
  good_id: number;
  socle_id: number | null;
  shape_id: number | null;
  type_id: number | null;
  suppliers_id: number | null;
  title: string;
  price: number;
  quantity: number;
  description: string | null;
  is_visible: boolean;
}

export interface GoodCreate {
  title: string;
  description: string | null;
  price: number;
  quantity: number;
  is_visible: boolean;
  socle_id: number | null;
  shape_id: number | null;
  type_id: number | null;
  suppliers_id: number | null;
}

export type GoodUpdate = GoodCreate;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled';

// List response (GET /admin/orders)
export interface OrderListItem {
  order_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

// Item inside a single order
export interface OrderItemResponse {
  item_id: number;
  good_id: number;
  good_title: string;
  good_sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Full order response (GET /admin/orders/{id})
export interface OrderResponse extends OrderListItem {
  comment: string | null;
  updated_at: string;
  items: OrderItemResponse[];
  status_history: {
    history_id: number;
    old_status: string | null;
    new_status: string;
    changed_by: string | null;
    change_reason: string | null;
    changed_at: string;
  }[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  change_reason?: string;
}