import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../core/models/pedido.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { PedidoService } from '../../core/services/pedido.service';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({selector:'app-ventas',standalone:true,imports:[CurrencyPipe,DatePipe,TablePaginationComponent],templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'})
export class VentasComponent implements OnInit {
  pagina = signal(1);
  tamanoPagina = signal(5);

  constructor(public service: PedidoService, private busqueda: BusquedaService) {}

  ngOnInit(): void {
    this.service.cargarDesdeApi();
  }

  ventasFiltradas(): Pedido[] {
    return this.service.ventasCerradas().filter(venta => this.busqueda.coincide(
      venta.numero,
      venta.cliente,
      venta.usuario,
      venta.estado,
      venta.metodoPago,
      venta.total,
      venta.detalles.map(detalle => detalle.producto).join(' ')
    ));
  }

  totalFiltrado(): number {
    return this.ventasFiltradas().reduce((suma, venta) => suma + venta.total, 0);
  }

  unidadesFiltradas(): number {
    return this.ventasFiltradas().reduce((suma, venta) =>
      suma + venta.detalles.reduce((subtotal, detalle) => subtotal + detalle.cantidad, 0), 0);
  }

  resumenProductos(venta: Pedido): string {
    if (!venta.detalles.length) {
      return 'Sin detalle';
    }
    return venta.detalles
      .map(detalle => `${detalle.producto ?? 'Producto'} x${detalle.cantidad}`)
      .join(', ');
  }

  ventasPaginadas(): Pedido[] {
    const ventas = this.ventasFiltradas();
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return ventas.slice(inicio, inicio + this.tamanoPagina());
  }

  actualizarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  actualizarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  paginaActual(): number {
    return Math.min(this.pagina(), Math.max(1, Math.ceil(this.ventasFiltradas().length / this.tamanoPagina())));
  }
}
