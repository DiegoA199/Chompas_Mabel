import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InventarioMovimiento } from '../../core/models/inventario.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({selector:'app-inventario',standalone:true,imports:[DatePipe],template:`
<div class="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h1 class="fw-bold">Movimientos de inventario</h1>
    <p class="text-muted">Entradas, salidas y ajustes reales registrados en inventario_movimientos.</p>
  </div>
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

<div class="row g-4 mb-4">
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-list-check"></i></div><div><small>Movimientos</small><h3>{{movimientosFiltrados().length}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-arrow-down-circle"></i></div><div><small>Entradas</small><h3>{{contarTipo('ENTRADA')}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-arrow-up-circle"></i></div><div><small>Salidas</small><h3>{{contarTipo('SALIDA')}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-sliders"></i></div><div><small>Ajustes</small><h3>{{contarTipo('AJUSTE')}}</h3></div></div></div>
</div>

<div class="card-soft p-4">
  <div class="inventory-toolbar mb-3">
    <div>
      <h4 class="mb-1">Historial de movimientos</h4>
      <small class="text-muted">Filtra por producto o usa la busqueda superior.</small>
    </div>
    <select class="form-select" [value]="productoSeleccionado() ?? 0" (change)="filtrarProducto($event)">
      <option [value]="0">Todos los productos</option>
      @for(producto of productos.productos(); track producto.id){
        <option [value]="producto.id ?? 0">{{producto.codigo}} - {{producto.nombre}}</option>
      }
    </select>
  </div>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead><tr><th>Fecha</th><th>Codigo</th><th>Producto</th><th>Categoria</th><th>Tipo</th><th>Cantidad</th><th>Observacion</th></tr></thead>
      <tbody>
        @for(movimiento of movimientosFiltrados(); track movimiento.id){
          <tr>
            <td>{{movimiento.fechaMovimiento|date:'short'}}</td>
            <td class="text-brand fw-bold">{{movimiento.codigoProducto}}</td>
            <td>{{movimiento.producto}}</td>
            <td>{{movimiento.categoria}}</td>
            <td><span class="badge" [class.bg-success]="movimiento.tipoMovimiento==='ENTRADA'" [class.bg-danger]="movimiento.tipoMovimiento==='SALIDA'" [class.bg-secondary]="movimiento.tipoMovimiento==='AJUSTE'">{{movimiento.tipoMovimiento}}</span></td>
            <td>{{movimiento.cantidad}}</td>
            <td>{{movimiento.observacion || 'Sin observacion'}}</td>
          </tr>
        } @empty {
          <tr><td colspan="7" class="text-center text-muted py-4">No hay movimientos para el filtro actual.</td></tr>
        }
      </tbody>
    </table>
  </div>
</div>`})
export class InventarioComponent implements OnInit {
  productoSeleccionado = signal<number | null>(null);

  constructor(
    public service: InventarioService,
    public productos: ProductoService,
    private busqueda: BusquedaService
  ) {}

  ngOnInit(): void {
    this.service.cargarDesdeApi();
    this.productos.cargarDesdeApi();
  }

  filtrarProducto(evento: Event): void {
    const input = evento.target as HTMLSelectElement;
    const id = Number(input.value);
    this.productoSeleccionado.set(id > 0 ? id : null);
  }

  movimientosFiltrados(): InventarioMovimiento[] {
    const productoId = this.productoSeleccionado();
    return this.service.movimientos().filter(movimiento => {
      const coincideProducto = !productoId || movimiento.productoId === productoId;
      return coincideProducto && this.busqueda.coincide(
        movimiento.codigoProducto,
        movimiento.producto,
        movimiento.categoria,
        movimiento.tipoMovimiento,
        movimiento.cantidad,
        movimiento.observacion
      );
    });
  }

  contarTipo(tipo: InventarioMovimiento['tipoMovimiento']): number {
    return this.movimientosFiltrados().filter(movimiento => movimiento.tipoMovimiento === tipo).length;
  }
}
