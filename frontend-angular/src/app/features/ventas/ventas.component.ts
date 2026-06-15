import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../core/models/pedido.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { PedidoService } from '../../core/services/pedido.service';

@Component({selector:'app-ventas',standalone:true,imports:[CurrencyPipe,DatePipe],template:`
<div class="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h1 class="fw-bold">Historial de ventas</h1>
    <p class="text-muted">Pedidos cerrados con estado ENTREGADO o VENDIDO.</p>
  </div>
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

<div class="row g-4 mb-4">
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-receipt"></i></div><div><small>Ventas cerradas</small><h3>{{ventasFiltradas().length}}</h3></div></div></div>
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-cash-coin"></i></div><div><small>Total vendido</small><h3>{{totalFiltrado()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-box-seam"></i></div><div><small>Unidades vendidas</small><h3>{{unidadesFiltradas()}}</h3></div></div></div>
</div>

<div class="card-soft p-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h4 class="mb-0">Ventas registradas</h4>
    <span class="text-muted">Fuente: GET /api/pedidos</span>
  </div>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Metodo</th><th>Estado</th><th>Comprobante</th></tr></thead>
      <tbody>
        @for(venta of ventasFiltradas(); track venta.id){
          <tr>
            <td class="text-brand fw-bold">{{venta.numero}}</td>
            <td>{{venta.cliente}}</td>
            <td>{{venta.fechaPedido|date:'short'}}</td>
            <td>{{resumenProductos(venta)}}</td>
            <td>{{venta.total|currency:'PEN':'symbol':'1.2-2'}}</td>
            <td>{{venta.metodoPago || 'No registrado'}}</td>
            <td><span class="badge bg-success">{{venta.estado}}</span></td>
            <td>{{venta.ventaId ? ('Venta #' + venta.ventaId) : 'Sin registro'}}</td>
          </tr>
        } @empty {
          <tr><td colspan="8" class="text-center text-muted py-4">No hay ventas cerradas para mostrar.</td></tr>
        }
      </tbody>
    </table>
  </div>
</div>`})
export class VentasComponent implements OnInit {
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
}
