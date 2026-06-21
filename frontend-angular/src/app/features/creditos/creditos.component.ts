import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../core/models/pedido.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { PedidoService } from '../../core/services/pedido.service';

@Component({selector:'app-creditos',standalone:true,imports:[CurrencyPipe,DatePipe],templateUrl: './creditos.component.html',
  styleUrl: './creditos.component.css'})
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
