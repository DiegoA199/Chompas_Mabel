import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventarioMovimiento } from '../models/inventario.model';
import { environment } from '../config/environment';

@Injectable({providedIn:'root'})
export class InventarioService {
  private movimientosSignal = signal<InventarioMovimiento[]>([]);

  movimientos = computed(() => this.movimientosSignal());
  entradas = computed(() => this.movimientosSignal().filter(movimiento => movimiento.tipoMovimiento === 'ENTRADA'));
  salidas = computed(() => this.movimientosSignal().filter(movimiento => movimiento.tipoMovimiento === 'SALIDA'));
  ajustes = computed(() => this.movimientosSignal().filter(movimiento => movimiento.tipoMovimiento === 'AJUSTE'));
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<InventarioMovimiento[]>(`${environment.apiUrl}/inventario/movimientos`).subscribe({
      next: movimientos => this.movimientosSignal.set(movimientos),
      error: () => this.error.set('No se pudo cargar movimientos de inventario desde el backend'),
      complete: () => this.cargando.set(false)
    });
  }
}
