export type UserRole = 'ADMIN' | 'MECHANIC' | 'SUPERADMIN'

export type OrderStatus =
  | 'RECIBIDA'
  | 'EN_DIAGNOSTICO'
  | 'ESPERANDO_AUTORIZACION'
  | 'AUTORIZADA'
  | 'EN_REPARACION'
  | 'ESPERANDO_PIEZAS'
  | 'LISTA_PARA_ENTREGA'
  | 'ENTREGADA'
  | 'CANCELADA'

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO'
export type PhotoType = 'RECEPCION' | 'DANO' | 'DIAGNOSTICO' | 'AVANCE' | 'ENTREGA'
export type ExpenseCategory = 'RENTA' | 'LUZ' | 'AGUA' | 'HERRAMIENTA' | 'PIEZAS' | 'NOMINA' | 'OTRO'

export interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  is_active: boolean
  tenant_name?: string | null
  created_at: string
}

export interface Client {
  id: string
  full_name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Motorcycle {
  id: string
  client_id: string
  brand: string
  model: string
  year: number
  plate?: string
  vin?: string
  color?: string
  km?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ServiceOrder {
  id: string
  motorcycle_id: string
  client_id: string
  assigned_mechanic_id?: string
  status: OrderStatus
  entry_date: string
  estimated_delivery_date?: string
  problem_description?: string
  diagnosis?: string
  work_performed?: string
  labor_cost: string
  parts_cost: string
  total_cost: string
  paid_amount: string
  balance_due: string
  created_at: string
  updated_at: string
  closed_at?: string
}

export interface Part {
  id: string
  name: string
  sku?: string
  brand?: string
  description?: string
  stock_quantity: number
  unit_cost: string
  sale_price: string
  minimum_stock: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  service_order_id: string
  amount: string
  payment_method: PaymentMethod
  payment_date: string
  notes?: string
  created_at: string
}

export interface Photo {
  id: string
  service_order_id: string
  photo_url: string
  photo_type: PhotoType
  description?: string
  uploaded_by_id: string
  created_at: string
}

export interface ServiceOrderPart {
  id: string
  service_order_id: string
  part_id: string
  quantity: number
  unit_price: string
  total_price: string
  part?: Part
}

export interface Expense {
  id: string
  concept: string
  amount: string
  category: ExpenseCategory
  expense_date: string
  notes?: string
  created_at: string
}

export interface DashboardSummary {
  active_orders: number
  completed_orders: number
  todays_income: string
  monthly_income: string
  motorcycles_in_repair: number
  low_stock_parts: number
  pending_payments_total: string
  waiting_authorization_count: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface Tenant {
  id: string
  name: string
  owner_email: string
  is_active: boolean
  subscription_expires_at: string | null
  created_at: string
}

export interface TenantWithAdmin {
  tenant: Tenant
  admin_email: string
  admin_temp_password: string
}
