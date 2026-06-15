import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../core/models/pedido.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { PedidoService } from '../../core/services/pedido.service';

@Component({selector:'app-creditos',standalone:true,imports:[CurrencyPipe,DatePipe],template:`
<div class="d-flex justify-content-between mb-4">
  <div>
    <h1 class="fw-bold">Creditos y cuentas por cobrar</h1>
    <p class="text-muted">Pedidos entregados o vendidos con saldo pendiente de pago.</p>
  </div>
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

<div class="row g-4 mb-4">
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-credit-card"></i></div><div><small>Creditos</small><h3>{{service.creditos().length}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-cash-coin"></i></div><div><small>Saldo pendiente</small><h3>{{service.saldoCredito()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-calendar-x"></i></div><div><small>Vencidos</small><h3>{{service.creditosVencidos().length}}</h3></div></div></div>
  <div class="col-md-3"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-check2-circle"></i></div><div><small>Pagados</small><h3>{{service.creditosPagados().length}}</h3></div></div></div>
</div>

<div class="card-soft p-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h4 class="mb-0">Seguimiento de creditos</h4>
    <span class="text-muted">{{service.creditosPendientes().length}} pendientes</span>
  </div>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Vencimiento</th><th>Estado</th><th></th></tr>
      </thead>
      <tbody>
        @for(credito of creditosFiltrados(); track credito.id){
          <tr>
            <td class="text-brand fw-bold">{{credito.numero}}</td>
            <td>{{credito.cliente}}</td>
            <td>{{credito.total|currency:'PEN':'symbol':'1.2-2'}}</td>
            <td>{{credito.montoPagado|currency:'PEN':'symbol':'1.2-2'}}</td>
            <td class="fw-bold">{{credito.saldoPendiente|currency:'PEN':'symbol':'1.2-2'}}</td>
            <td>{{credito.fechaVencimientoCredito|date:'mediumDate'}}</td>
            <td>
              <span class="badge" [class.bg-danger]="credito.creditoVencido" [class.bg-warning]="!credito.creditoVencido && credito.saldoPendiente > 0" [class.bg-success]="credito.saldoPendiente === 0">
                {{etiquetaEstado(credito)}}
              </span>
            </td>
            <td class="text-end">
              @if(credito.saldoPendiente > 0){
                <button class="btn btn-sm btn-outline-success" [disabled]="pagandoId() === credito.id" (click)="marcarPagado(credito)">
                  {{pagandoId() === credito.id ? 'Registrando...' : 'Marcar pagado'}}
                </button>
              } @else {
                <span class="text-success">Cancelado</span>
              }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="8" class="text-center text-muted py-4">No hay pedidos registrados a credito.</td></tr>
        }
      </tbody>
    </table>
  </div>
</div>`})
export class CreditosComponent implements OnInit {
  pagandoId = signal<number | null>(null);

  constructor(public service: PedidoService, private busqueda: BusquedaService) {}

  ngOnInit(): void {
    this.service.cargarDesdeApi();
  }

  marcarPagado(credito: Pedido): void {
    if (!credito.id) {
      return;
    }
    this.pagandoId.set(credito.id);
    this.service.pagarCredito(credito.id).subscribe({
      complete: () => this.pagandoId.set(null),
      error: () => this.pagandoId.set(null)
    });
  }

  etiquetaEstado(credito: Pedido): string {
    if (credito.saldoPendiente === 0) {
      return 'PAGADO';
    }
    if (credito.creditoVencido) {
      return `VENCIDO ${credito.diasVencido} dia(s)`;
    }
    return 'PENDIENTE';
  }

  creditosFiltrados(): Pedido[] {
    return this.service.creditos().filter(credito => this.busqueda.coincide(
      credito.numero,
      credito.cliente,
      credito.estadoCredito,
      this.etiquetaEstado(credito),
      credito.total,
      credito.montoPagado,
      credito.saldoPendiente,
      credito.fechaVencimientoCredito
    ));
  }
}
