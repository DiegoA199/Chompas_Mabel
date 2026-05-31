import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PedidoService } from '../../core/services/pedido.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({selector:'app-reportes',standalone:true,imports:[CurrencyPipe],template:`
<h1 class="fw-bold">Reportes</h1>
<p class="text-muted">Indicadores de ventas, inventario y pedidos con datos del backend.</p>
<div class="row g-4">
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-receipt"></i></div><div><small>Ventas</small><h3>{{pedidos.ventasDia()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-boxes"></i></div><div><small>Inventario</small><h3>{{productos.valorInventario()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-exclamation-circle"></i></div><div><small>Stock bajo</small><h3>{{productos.stockBajo().length}}</h3></div></div></div>
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
