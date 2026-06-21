import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Pedido } from '../models/pedido.model';
import { Producto } from '../models/producto.model';
import { environment } from '../config/environment';

interface ResumenReportes {
  totalVentas: number;
  saldoCredito: number;
  creditosVencidos: number;
  valorInventario: number;
  productosStockBajo: number;
}

const resumenVacio: ResumenReportes = {
  totalVentas: 0,
  saldoCredito: 0,
  creditosVencidos: 0,
  valorInventario: 0,
  productosStockBajo: 0
};

@Injectable({providedIn:'root'})
export class ReportesService {
  private resumenSignal = signal<ResumenReportes>(resumenVacio);
  private pedidosSignal = signal<Pedido[]>([]);
  private productosSignal = signal<Producto[]>([]);

  resumen = computed(() => this.resumenSignal());
  pedidos = computed(() => this.pedidosSignal());
  productos = computed(() => this.productosSignal());
  ventasCerradas = computed(() => this.pedidosSignal().filter(pedido => this.esVentaCerrada(pedido)));
  totalVentas = computed(() => this.resumenSignal().totalVentas || this.ventasCerradas().reduce((suma, pedido) => suma + pedido.total, 0));
  creditos = computed(() => this.pedidosSignal().filter(pedido => pedido.estadoCredito !== 'SIN_CREDITO'));
  creditosPendientes = computed(() => this.creditos().filter(pedido => pedido.saldoPendiente > 0));
  saldoCredito = computed(() => this.resumenSignal().saldoCredito || this.creditos().reduce((suma, pedido) => suma + pedido.saldoPendiente, 0));
  creditosVencidos = computed(() => this.creditos().filter(pedido => pedido.saldoPendiente > 0 && pedido.creditoVencido));
  creditosVencidosTotal = computed(() => this.resumenSignal().creditosVencidos || this.creditosVencidos().length);
  productosStockBajo = computed(() => this.productosSignal().filter(producto => producto.stock <= 10));
  productosStockBajoTotal = computed(() => this.resumenSignal().productosStockBajo || this.productosStockBajo().length);
  valorInventario = computed(() => this.resumenSignal().valorInventario || this.productosSignal().reduce((suma, producto) => suma + producto.stock * producto.precio, 0));
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      resumen: this.http.get<ResumenReportes>(`${environment.apiUrl}/reportes/resumen`),
      pedidos: this.http.get<Pedido[]>(`${environment.apiUrl}/pedidos`),
      productos: this.http.get<Producto[]>(`${environment.apiUrl}/productos`)
    }).subscribe({
      next: datos => {
        this.resumenSignal.set(datos.resumen);
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
