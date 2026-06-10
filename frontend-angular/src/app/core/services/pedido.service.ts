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
  creditos = computed(() => this.pedidosSignal().filter(pedido => pedido.estadoCredito !== 'SIN_CREDITO'));
  creditosPendientes = computed(() => this.creditos().filter(pedido => pedido.saldoPendiente > 0 && !pedido.creditoVencido));
  creditosVencidos = computed(() => this.creditos().filter(pedido => pedido.saldoPendiente > 0 && pedido.creditoVencido));
  creditosPagados = computed(() => this.creditos().filter(pedido => pedido.estadoCredito === 'PAGADO'));
  saldoCredito = computed(() => this.creditos().reduce((suma, pedido) => suma + pedido.saldoPendiente, 0));
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

  pagarCredito(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${environment.apiUrl}/pedidos/${id}/credito/pagar`, {}).pipe(
      tap(actualizado => this.pedidosSignal.update(pedidos =>
        pedidos.map(pedido => pedido.id === actualizado.id ? actualizado : pedido)
      ))
    );
  }
}
