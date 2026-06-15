import { Injectable, computed, signal } from '@angular/core';

@Injectable({providedIn:'root'})
export class BusquedaService {
  private terminoSignal = signal('');

  termino = computed(() => this.terminoSignal());
  terminoNormalizado = computed(() => this.normalizar(this.terminoSignal()));

  actualizar(valor: string): void {
    this.terminoSignal.set(valor);
  }

  limpiar(): void {
    this.terminoSignal.set('');
  }

  coincide(...valores: Array<string | number | null | undefined>): boolean {
    const termino = this.terminoNormalizado();
    if (!termino) {
      return true;
    }
    const contenido = this.normalizar(valores.filter(valor => valor !== null && valor !== undefined).join(' '));
    return contenido.includes(termino);
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
