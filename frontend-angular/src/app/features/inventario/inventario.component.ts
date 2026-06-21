import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InventarioMovimiento } from '../../core/models/inventario.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({selector:'app-inventario',standalone:true,imports:[DatePipe,TablePaginationComponent],templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'})
export class InventarioComponent implements OnInit {
  productoSeleccionado = signal<number | null>(null);
  pagina = signal(1);
  tamanoPagina = signal(5);

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
    this.pagina.set(1);
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

  movimientosPaginados(): InventarioMovimiento[] {
    const movimientos = this.movimientosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return movimientos.slice(inicio, inicio + this.tamanoPagina());
  }

  actualizarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  actualizarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  paginaActual(): number {
    return Math.min(this.pagina(), Math.max(1, Math.ceil(this.movimientosFiltrados().length / this.tamanoPagina())));
  }
}
