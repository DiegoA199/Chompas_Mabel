import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Pedido, PedidoPayload } from '../models/pedido.model';
import { environment } from './environment';

@Injectable({providedIn:'root'})
export class PedidoService {
  private pedidosSignal = signal<Pedido[]>([]);

  pedidos = computed(() => this.pedidosSignal());
  ventasDia = computed(() => this.pedidosSignal().reduce((suma, pedido) => suma + pedido.total, 0));
  activos = computed(() => this.pedidosSignal().filter(pedido => pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO').length);
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<Pedido[]>(`${environment.apiUrl}/pedidos`).subscribe({
      next: pedidos => this.pedidosSignal.set(pedidos),
      error: () => this.error.set('No se pudo cargar pedidos desde el backend'),
      complete: () => this.cargando.set(false)
    });
  }

  crear(pedido: PedidoPayload): Observable<Pedido> {
    return this.http.post<Pedido>(`${environment.apiUrl}/pedidos`, pedido).pipe(
      tap(creado => this.pedidosSignal.update(pedidos => [creado, ...pedidos]))
    );
  }
}
