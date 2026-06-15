export type TipoMovimientoInventario = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface InventarioMovimiento {
  id: number;
  productoId: number;
  codigoProducto: string;
  producto: string;
  categoria: string;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  fechaMovimiento: string;
  observacion?: string | null;
}
