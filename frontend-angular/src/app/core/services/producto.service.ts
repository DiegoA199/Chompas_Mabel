import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Producto, ProductoPayload } from '../models/producto.model';
import { environment } from '../config/environment';

@Injectable({providedIn:'root'})
export class ProductoService {
  private productosSignal = signal<Producto[]>([]);

  productos = computed(() => this.productosSignal());
  stockBajo = computed(() => this.productosSignal().filter(producto => producto.stock <= 10));
  valorInventario = computed(() => this.productosSignal().reduce((suma, producto) => suma + producto.stock * producto.precio, 0));
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<Producto[]>(`${environment.apiUrl}/productos`).subscribe({
      next: productos => this.productosSignal.set(productos),
      error: () => this.error.set('No se pudo cargar productos desde el backend'),
      complete: () => this.cargando.set(false)
    });
  }

  crear(producto: ProductoPayload): Observable<Producto> {
    return this.http.post<Producto>(`${environment.apiUrl}/productos`, producto).pipe(
      tap(creado => this.productosSignal.update(productos => [creado, ...productos]))
    );
  }

  actualizar(id: number, producto: ProductoPayload): Observable<Producto> {
    return this.http.put<Producto>(`${environment.apiUrl}/productos/${id}`, producto).pipe(
      tap(actualizado => this.productosSignal.update(productos => productos.map(productoActual => productoActual.id === id ? actualizado : productoActual)))
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/productos/${id}`).pipe(
      tap(() => this.productosSignal.update(productos => productos.filter(producto => producto.id !== id)))
    );
  }
}
