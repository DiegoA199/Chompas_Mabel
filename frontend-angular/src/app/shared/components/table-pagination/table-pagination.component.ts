import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  templateUrl: './table-pagination.component.html',
  styleUrl: './table-pagination.component.css'
})
export class TablePaginationComponent {
  @Input() totalItems = 0;
  @Input() page = 1;
  @Input() pageSize = 5;
  @Input() pageSizeOptions = [5, 10, 15, 20, 50];
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  paginaActual(): number {
    return Math.min(Math.max(1, this.page), this.totalPaginas());
  }

  desde(): number {
    return this.totalItems ? (this.paginaActual() - 1) * this.pageSize + 1 : 0;
  }

  hasta(): number {
    return Math.min(this.paginaActual() * this.pageSize, this.totalItems);
  }

  irA(pagina: number): void {
    const siguiente = Math.min(Math.max(1, pagina), this.totalPaginas());
    if (siguiente !== this.page) {
      this.pageChange.emit(siguiente);
    }
  }

  cambiarTamano(evento: Event): void {
    const input = evento.target as HTMLSelectElement;
    const tamano = Number(input.value) || 5;
    this.pageSizeChange.emit(tamano);
    this.pageChange.emit(1);
  }
}
