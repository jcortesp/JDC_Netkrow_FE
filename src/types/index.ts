// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  sub: string;       // email (subject del JWT)
  name?: string;     // claim agregado en JwtUtils.generateToken
  roles?: string[];  // claim agregado en JwtUtils.generateToken
  exp: number;
  iat: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

// ── Remission ────────────────────────────────────────────────────────────────

export interface Remission {
  id: number;
  remissionId: string;
  totalValue: number;
  depositValue: number;
  metodoAbono: string | null;
  metodoSaldo: string | null;
  saldo: number;
  createdAt: string;        // ISO string
  fechaSalida: string | null;
  garantia: boolean;
  celular: string | null;
}

export interface DeliveryRequest {
  metodoSaldo: string;
}

export interface DropRequest {
  cobrarRevision: boolean;
  revisionValue: number | null;
}

// ── TechnicalRecord ──────────────────────────────────────────────────────────

export interface TechnicalRecord {
  id: number;
  equipo: string;
  valor: number;
  marca: string;
  serial: string;
  brazalete: string;
  pilas: string;
  revision: string;
  mantenimiento: string;
  limpieza: string;
  calibracion: string;
  notasDiagnostico: string;
  dadoBaja?: boolean;
  revisionValor?: number | null;
  createdAt: string;
}

// ── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  productId: number;
  category: string;
  type: string;
  name: string;
  price: number | null;
  code: string;
  brand: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
}

// ── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  documentId: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
}

// ── Sale ─────────────────────────────────────────────────────────────────────

/** Flat DTO returned by GET /sales — matches BE SaleDTO */
export interface Sale {
  saleId: number;
  saleDate: string;
  remisionVenta: string | null;
  transactionType: string;
  productId: number | null;
  productName?: string;
  channel: string;
  unitQty?: number;
  saleValue: number;
  paymentMethod: string;
  customerId: number | null;
  customerName?: string;
}

// ── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: number;
  specialistId: number;
  clientId: number;
  startTime: string;
  endTime: string;
  status: string;
}

// ── SpecialistProfile ────────────────────────────────────────────────────────
// Matches BE SpecialistProfile entity (user is @JsonIgnore, not serialized)

export interface SpecialistProfile {
  id: number;
  headline: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  languages: string | null;
  education: string | null;
  experience: string | null;
  skills: string[];
  ratePerHour: number | null;
}

// ── RCA ──────────────────────────────────────────────────────────────────────
// Matches BE RCARecord entity

export interface RCARecord {
  id: number;
  title: string;
  description: string | null;
  errorCode: string | null;
  omsComponent: string | null;
  rootCause: string | null;
  resolutionSteps: string | null;
  tags: string | null;
  exampleStacktrace: string | null;
}

export interface RCARouteNode {
  type: 'service' | 'flow' | 'server' | 'transaction';
  label: string;
  subFlowKey?: string;
  flowKey?: string;
  serverKey?: string;
  flowName?: string;
  [key: string]: unknown;
}

export interface RCABacktraceResponse {
  routes: RCARouteNode[][];
  transactions: RCARouteNode[];
}

// ── Reports ──────────────────────────────────────────────────────────────────
// All types match their BE DTO counterparts exactly

/** Matches BE RemissionKpiDto */
export interface RemissionKpi {
  totalRemisiones: number;
  totalEquipos: number;
  totalValorRemisiones: number;
  ticketPromedioRemision: number;
  unidadesPromedioPorRemision: number;
}

/** Matches BE SalesKpiDto */
export interface SalesKpi {
  totalTransacciones: number;
  productosTotales: number;
  totalVentas: number;
  ticketPromedioVenta: number;
  unidadesPromedioPorVenta: number;
}

/** Matches BE GlobalKpiDto */
export interface GlobalKpi {
  ingresosTotales: number;
  totalGastos: number;
  ingresoNeto: number;
}

/** Matches BE FullReportDto */
export interface FullReportDto {
  remisiones: RemissionKpi;
  ventas: SalesKpi;
  global: GlobalKpi;
}

/** Matches BE MonthlyRemissionDto */
export interface MonthlyRemissionPoint {
  year: number;
  month: number;
  ingresosRemisiones: number;
  ticketPromedio: number;
}

/** Matches BE MonthlySalesDto */
export interface MonthlySalesPoint {
  year: number;
  month: number;
  ingresosVentas: number;
  ticketPromedio: number;
}

/** Matches BE MonthlyGlobalDto */
export interface MonthlyGlobalPoint {
  year: number;
  month: number;
  ingresoNeto: number;
}

/** Matches BE MonthlyReportDto */
export interface MonthlyReportDto {
  remisiones: MonthlyRemissionPoint[];
  ventas: MonthlySalesPoint[];
  global: MonthlyGlobalPoint[];
}
