import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PedidoService } from '../../core/services/pedido.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({selector:'app-reportes',standalone:true,imports:[CurrencyPipe],template:`
<h1 class="fw-bold">Reportes</h1>
<p class="text-muted">Indicadores de ventas, inventario y pedidos con datos del backend.</p>
<div class="row g-4">
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-receipt"></i></div><div><small>Ventas</small><h3>{{pedidos.ventasDia()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-credit-card"></i></div><div><small>Cuentas por cobrar</small><h3>{{pedidos.saldoCredito()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-exclamation-circle"></i></div><div><small>Creditos vencidos</small><h3>{{pedidos.creditosVencidos().length}}</h3></div></div></div>
</div>
<div class="card-soft p-4 mt-4">
  <h4>Creditos pendientes</h4>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead><tr><th>Pedido</th><th>Cliente</th><th>Saldo</th><th>Vencimiento</th><th>Estado</th></tr></thead>
      <tbody>
        @for(credito of pedidos.creditos().slice(0,6); track credito.id){
          <tr>
            <td class="text-brand fw-bold">{{credito.numero}}</td>
            <td>{{credito.cliente}}</td>
            <td>{{credito.saldoPendiente|currency:'PEN':'symbol':'1.2-2'}}</td>
            <td>{{credito.fechaVencimientoCredito}}</td>
            <td>{{credito.estadoCredito}}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</div>
<div class="card-soft p-4 mt-4">
  <h4>Productos con stock bajo</h4>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead><tr><th>Codigo</th><th>Producto</th><th>Stock</th><th>Valor</th></tr></thead>
      <tbody>
        @for(producto of productos.stockBajo(); track producto.id){
          <tr><td>{{producto.codigo}}</td><td>{{producto.nombre}}</td><td>{{producto.stock}}</td><td>{{(producto.stock * producto.precio)|currency:'PEN':'symbol':'1.2-2'}}</td></tr>
        }
      </tbody>
    </table>
  </div>
</div>`})
export class ReportesComponent implements OnInit {
  constructor(public pedidos: PedidoService, public productos: ProductoService) {}

  ngOnInit(): void {
    this.pedidos.cargarDesdeApi();
    this.productos.cargarDesdeApi();
  }
}
