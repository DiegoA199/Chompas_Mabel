export interface Cliente {
  id?: number;
  nombres: string;
  apellidos?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  correo: string;
  nombreCompleto?: string;
}

export type ClientePayload = Omit<Cliente, 'id' | 'nombreCompleto'>;
