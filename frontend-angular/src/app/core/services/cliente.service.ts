import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cliente, ClientePayload } from '../models/cliente.model';
import { environment } from './environment';

@Injectable({providedIn:'root'})
export class ClienteService {
  private clientesSignal = signal<Cliente[]>([]);

  clientes = computed(() => this.clientesSignal());
  totalClientes = computed(() => this.clientesSignal().length);
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<Cliente[]>(`${environment.apiUrl}/clientes`).subscribe({
      next: clientes => this.clientesSignal.set(clientes),
      error: () => this.error.set('No se pudo cargar clientes desde el backend'),
      complete: () => this.cargando.set(false)
    });
  }

  crear(cliente: ClientePayload): Observable<Cliente> {
    return this.http.post<Cliente>(`${environment.apiUrl}/clientes`, cliente).pipe(
      tap(creado => this.clientesSignal.update(clientes => [creado, ...clientes]))
    );
  }
}
