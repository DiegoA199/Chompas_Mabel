export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PROCESO' | 'ENTREGADO' | 'CANCELADO';
export type EstadoCredito = 'SIN_CREDITO' | 'PENDIENTE' | 'VENCIDO' | 'PAGADO';

export interface DetallePedido {
  id?: number;
  productoId: number;
  producto?: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface Pedido {
  id?: number;
  numero: string;
  clienteId: number;
  cliente: string;
  usuarioId: number;
  usuario?: string;
  fechaPedido: string;
  fechaEntrega: string;
  total: number;
  estado: EstadoPedido;
  metodoPago?: string | null;
  montoPagado: number;
  saldoPendiente: number;
  fechaVencimientoCredito?: string | null;
  estadoCredito: EstadoCredito;
  creditoVencido: boolean;
  diasVencido: number;
  ventaId?: number | null;
  detalles: DetallePedido[];
}

export interface PedidoPayload {
  numero?: string | null;
  clienteId: number;
  usuarioId: number;
  metodoPago?: string | null;
  fechaEntrega?: string | null;
  estado: EstadoPedido;
  montoPagado?: number | null;
  fechaVencimientoCredito?: string | null;
  detalles: DetallePedido[];
}
