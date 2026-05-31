export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'EN_PROCESO' | 'ENTREGADO' | 'CANCELADO';

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
  detalles: DetallePedido[];
}
