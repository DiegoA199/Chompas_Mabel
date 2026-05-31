import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoPedido, PedidoPayload } from '../../core/models/pedido.model';
import { ClienteService } from '../../core/services/cliente.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({selector:'app-pedidos',standalone:true,imports:[ReactiveFormsModule,CurrencyPipe,DatePipe],template:`
<div class="d-flex justify-content-between mb-4">
  <div><h1 class="fw-bold">Gestion de pedidos y ventas</h1><p class="text-muted">Seguimiento de pedidos, ventas y entregas.</p></div>
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

<div class="row g-4 mb-4">
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-clipboard"></i></div><div><small>Pedidos</small><h3>{{service.pedidos().length}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-wallet"></i></div><div><small>Ventas registradas</small><h3>{{service.ventasDia()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
</div>

<form [formGroup]="form" (ngSubmit)="guardar()" class="card-soft p-4 mb-4">
  <h4>Registrar pedido</h4>
  @if(errorFormulario()){
    <div class="alert alert-danger">{{errorFormulario()}}</div>
  }
  <div class="row g-3">
    <div class="col-md-3">
      <label class="form-label">Cliente</label>
      <select class="form-select" formControlName="clienteId">
        <option [ngValue]="0">Seleccionar</option>
        @for(cliente of clientes.clientes(); track cliente.id){
          <option [ngValue]="cliente.id ?? 0">{{cliente.nombreCompleto || cliente.nombres}}</option>
        }
      </select>
    </div>
    <div class="col-md-3">
      <label class="form-label">Producto</label>
      <select class="form-select" formControlName="productoId">
        <option [ngValue]="0">Seleccionar</option>
        @for(producto of productos.productos(); track producto.id){
          <option [ngValue]="producto.id ?? 0">{{producto.nombre}} - stock {{producto.stock}}</option>
        }
      </select>
    </div>
    <div class="col-md-1">
      <label class="form-label">Cantidad</label>
      <input type="number" class="form-control" formControlName="cantidad">
    </div>
    <div class="col-md-2">
      <label class="form-label">Pago</label>
      <select class="form-select" formControlName="metodoPago">
        <option value="Efectivo">Efectivo</option>
        <option value="Yape">Yape</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Tarjeta">Tarjeta</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label">Estado</label>
      <select class="form-select" formControlName="estado">
        @for(estado of estados; track estado){<option [value]="estado">{{estado}}</option>}
      </select>
    </div>
    <div class="col-md-1 d-flex align-items-end">
      <button class="btn btn-brand w-100" [disabled]="form.invalid || guardando()">Guardar</button>
    </div>
  </div>
</form>

<div class="card-soft p-4">
  <ul class="nav nav-tabs mb-3">
    <li class="nav-item"><span class="nav-link active">Todos</span></li>
    <li class="nav-item"><span class="nav-link">Activos {{service.activos()}}</span></li>
  </ul>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead><tr><th>Nro Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Metodo de pago</th><th>Entrega</th><th>Venta</th></tr></thead>
      <tbody>
        @for(p of service.pedidos(); track p.id){
          <tr>
            <td class="text-brand fw-bold">{{p.numero}}</td>
            <td>{{p.cliente}}</td>
            <td>{{p.fechaPedido|date:'short'}}</td>
            <td>{{p.total|currency:'PEN':'symbol':'1.2-2'}}</td>
            <td><span class="badge bg-info">{{p.estado}}</span></td>
            <td>{{p.metodoPago}}</td>
            <td>{{p.fechaEntrega|date:'mediumDate'}}</td>
            <td>{{p.ventaId ? 'Generada' : 'Pendiente'}}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</div>`})
export class PedidosComponent implements OnInit {
  estados: EstadoPedido[] = ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO'];
  guardando = signal(false);
  errorFormulario = signal('');

  form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    productoId: [0, [Validators.required, Validators.min(1)]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    metodoPago: ['Yape', [Validators.required]],
    estado: this.fb.control<EstadoPedido>('CONFIRMADO', {validators: [Validators.required]})
  });

  constructor(
    public service: PedidoService,
    public clientes: ClienteService,
    public productos: ProductoService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {
    this.service.cargarDesdeApi();
    this.clientes.cargarDesdeApi();
    this.productos.cargarDesdeApi();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: PedidoPayload = {
      clienteId: raw.clienteId,
      usuarioId: 1,
      metodoPago: raw.metodoPago,
      estado: raw.estado,
      detalles: [{productoId: raw.productoId, cantidad: raw.cantidad}]
    };

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.service.crear(payload).subscribe({
      next: () => {
        this.productos.cargarDesdeApi();
        this.form.reset({clienteId:0, productoId:0, cantidad:1, metodoPago:'Yape', estado:'CONFIRMADO'});
      },
      error: () => this.errorFormulario.set('No se pudo registrar el pedido. Revisa cliente, producto y stock disponible.'),
      complete: () => this.guardando.set(false)
    });
  }
}
