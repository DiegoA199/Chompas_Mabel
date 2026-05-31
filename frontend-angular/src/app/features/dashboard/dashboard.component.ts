import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductoService } from '../../core/services/producto.service';
import { PedidoService } from '../../core/services/pedido.service';

@Component({selector:'app-dashboard',standalone:true,imports:[CurrencyPipe],template:`
<h1 class="fw-bold">Dashboard ejecutivo</h1>
<p class="text-muted">Resumen operativo de Chompas Mabel.</p>
<div class="row g-4 mb-4">
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-wallet2"></i></div><div><small>Ventas registradas</small><h3>{{pedidos.ventasDia()|currency:'PEN':'symbol':'1.2-2'}}</h3><span class="text-success">Conectado al API</span></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-clipboard-check"></i></div><div><small>Pedidos activos</small><h3>{{pedidos.activos()}}</h3><span class="text-success">{{pedidos.pedidos().length}} pedidos</span></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-box"></i></div><div><small>Productos</small><h3>{{productos.productos().length}}</h3><span class="text-danger">Stock bajo: {{productos.stockBajo().length}}</span></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-cash"></i></div><div><small>Valor inventario</small><h3>{{productos.valorInventario()|currency:'PEN':'symbol':'1.2-2'}}</h3><span class="text-success">Actualizado</span></div></div></div>
</div>
<div class="row g-4">
  <div class="col-lg-8">
    <div class="card-soft p-4">
      <h4>Pedidos recientes</h4>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            @for(p of pedidos.pedidos().slice(0,5); track p.id){
              <tr><td class="text-brand fw-bold">{{p.numero}}</td><td>{{p.cliente}}</td><td>{{p.total|currency:'PEN':'symbol':'1.2-2'}}</td><td><span class="badge bg-info">{{p.estado}}</span></td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="col-lg-4">
    <div class="card-soft p-4">
      <h4>Alertas de bajo stock</h4>
      @for(p of productos.stockBajo(); track p.id){
        <div class="d-flex justify-content-between border-bottom py-3">
          <div><strong>{{p.nombre}}</strong><br><small>{{p.talla}} - {{p.color}}</small></div>
          <span class="badge bg-danger align-self-center">{{p.stock}}</span>
        </div>
      }
      @if(!productos.stockBajo().length){
        <p class="text-muted mb-0">No hay alertas de stock bajo.</p>
      }
    </div>
  </div>
</div>`})
export class DashboardComponent implements OnInit {
  constructor(public productos: ProductoService, public pedidos: PedidoService) {}

  ngOnInit(): void {
    this.productos.cargarDesdeApi();
    this.pedidos.cargarDesdeApi();
  }
}
