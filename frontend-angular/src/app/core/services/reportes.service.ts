import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Pedido } from '../models/pedido.model';
import { Producto } from '../models/producto.model';
import { environment } from './environment';

@Injectable({providedIn:'root'})
export class ReportesService {
  private pedidosSignal = signal<Pedido[]>([]);
  private productosSignal = signal<Producto[]>([]);

  pedidos = computed(() => this.pedidosSignal());
  productos = computed(() => this.productosSignal());
  ventasCerradas = computed(() => this.pedidosSignal().filter(pedido => this.esVentaCerrada(pedido)));
  totalVentas = computed(() => this.ventasCerradas().reduce((suma, pedido) => suma + pedido.total, 0));
  creditos = computed(() => this.pedidosSignal().filter(pedido => pedido.estadoCredito !== 'SIN_CREDITO'));
  saldoCredito = computed(() => this.creditos().reduce((suma, pedido) => suma + pedido.saldoPendiente, 0));
  creditosVencidos = computed(() => this.creditos().filter(pedido => pedido.saldoPendiente > 0 && pedido.creditoVencido));
  productosStockBajo = computed(() => this.productosSignal().filter(producto => producto.stock <= 10));
  valorInventario = computed(() => this.productosSignal().reduce((suma, producto) => suma + producto.stock * producto.precio, 0));
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      pedidos: this.http.get<Pedido[]>(`${environment.apiUrl}/pedidos`),
      productos: this.http.get<Producto[]>(`${environment.apiUrl}/productos`)
    }).subscribe({
      next: datos => {
        this.pedidosSignal.set(datos.pedidos);
        this.productosSignal.set(datos.productos);
      },
      error: () => this.error.set('No se pudo cargar datos reales para reportes'),
      complete: () => this.cargando.set(false)
    });
  }

  private esVentaCerrada(pedido: Pedido): boolean {
    return pedido.estado === 'ENTREGADO' || pedido.estado === 'VENDIDO' || !!pedido.ventaId;
  }
}
