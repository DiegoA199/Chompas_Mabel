import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pedido } from '../../core/models/pedido.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { PedidoService } from '../../core/services/pedido.service';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({selector:'app-creditos',standalone:true,imports:[CurrencyPipe,DatePipe,TablePaginationComponent],templateUrl: './creditos.component.html',
  styleUrl: './creditos.component.css'})
export class CreditosComponent implements OnInit {
  pagandoId = signal<number | null>(null);
  pagina = signal(1);
  tamanoPagina = signal(5);

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

  creditosPaginados(): Pedido[] {
    const creditos = this.creditosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return creditos.slice(inicio, inicio + this.tamanoPagina());
  }

  actualizarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  actualizarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  paginaActual(): number {
    return Math.min(this.pagina(), Math.max(1, Math.ceil(this.creditosFiltrados().length / this.tamanoPagina())));
  }
}
