export type EstadoProducto = 'ACTIVO' | 'STOCK_BAJO' | 'INACTIVO';

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaId?: number | null;
  categoria: string;
  talla: string;
  color: string;
  precio: number;
  stock: number;
  estado?: EstadoProducto;
}

export type ProductoPayload = Omit<Producto, 'id' | 'estado'>;
