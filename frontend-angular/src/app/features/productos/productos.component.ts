import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto, ProductoPayload } from '../../core/models/producto.model';
import { AuthService } from '../../core/services/auth.service';
import { BusquedaService } from '../../core/services/busqueda.service';
import { ProductoService } from '../../core/services/producto.service';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({selector:'app-productos',standalone:true,imports:[ReactiveFormsModule,CurrencyPipe,TablePaginationComponent],templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'})
export class ProductosComponent implements OnInit {
  categorias = ['Clasicas', 'Juveniles', 'Cardigans', 'Alpaca', 'Corporativas'];
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  errorFormulario = signal('');
  categoriaActiva = signal('Todas');
  pagina = signal(1);
  tamanoPagina = signal(5);

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(140)]],
    descripcion: [''],
    categoria: ['Clasicas', [Validators.required, Validators.minLength(3)]],
    talla: ['M', [Validators.required]],
    color: ['Beige', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  constructor(
    public service: ProductoService,
    private fb: NonNullableFormBuilder,
    public auth: AuthService,
    public busqueda: BusquedaService
  ) {}

  ngOnInit(): void {
    this.service.cargarDesdeApi();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');
    const raw = this.form.getRawValue();
    const payload: ProductoPayload = {
      ...raw,
      descripcion: raw.descripcion || null,
      categoriaId: null
    };
    const id = this.editandoId();
    const request = id ? this.service.actualizar(id, payload) : this.service.crear(payload);

    request.subscribe({
      next: () => {
        this.form.reset({codigo:'', nombre:'', descripcion:'', categoria:'Clasicas', talla:'M', color:'Beige', precio:0, stock:0});
        this.editandoId.set(null);
        this.pagina.set(1);
      },
      error: () => this.errorFormulario.set('No se pudo guardar el producto. Revisa codigo unico y datos obligatorios.'),
      complete: () => this.guardando.set(false)
    });
  }

  editar(producto: Producto): void {
    this.editandoId.set(producto.id ?? null);
    this.form.patchValue({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      categoria: producto.categoria,
      talla: producto.talla,
      color: producto.color,
      precio: producto.precio,
      stock: producto.stock
    });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({codigo:'', nombre:'', descripcion:'', categoria:'Clasicas', talla:'M', color:'Beige', precio:0, stock:0});
  }

  eliminar(producto: Producto): void {
    if (!producto.id || !window.confirm(`Eliminar ${producto.nombre}?`)) {
      return;
    }
    this.service.eliminar(producto.id).subscribe({
      error: () => this.errorFormulario.set('No se pudo eliminar el producto porque puede tener pedidos asociados.')
    });
  }

  buscar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.busqueda.actualizar(input.value);
    this.pagina.set(1);
  }

  filtrarCategoria(categoria: string): void {
    this.categoriaActiva.set(categoria);
    this.pagina.set(1);
  }

  categoriasCatalogo(): string[] {
    return Array.from(new Set(this.service.productos().map(producto => producto.categoria))).filter(Boolean);
  }

  productosFiltrados(): Producto[] {
    const categoria = this.categoriaActiva();
    return this.service.productos().filter(producto => {
      const coincideCategoria = categoria === 'Todas' || producto.categoria === categoria;
      return coincideCategoria && this.busqueda.coincide(
        producto.codigo,
        producto.nombre,
        producto.descripcion,
        producto.categoria,
        producto.talla,
        producto.color,
        producto.precio,
        producto.stock
      );
    });
  }

  productosPaginados(): Producto[] {
    return this.paginar(this.productosFiltrados());
  }

  actualizarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  actualizarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  paginaActual(): number {
    return Math.min(this.pagina(), Math.max(1, Math.ceil(this.productosFiltrados().length / this.tamanoPagina())));
  }

  private paginar(items: Producto[]): Producto[] {
    const pagina = this.paginaActual();
    const inicio = (pagina - 1) * this.tamanoPagina();
    return items.slice(inicio, inicio + this.tamanoPagina());
  }

  imagenProducto(producto: Producto): string {
    const categoria = producto.categoria.toLowerCase();
    const imagenes: Record<string, string> = {
      alpaca: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=70',
      juveniles: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=70',
      cardigans: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=70',
      corporativas: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=70',
      clasicas: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=70'
    };
    const url = imagenes[categoria] ?? imagenes['clasicas'];
    return `linear-gradient(180deg, rgba(17,24,39,.05), rgba(17,24,39,.45)), url('${url}')`;
  }

  colorVisual(color: string): string {
    const value = color.toLowerCase();
    if (value.includes('beige')) return '#d6b88f';
    if (value.includes('azul marino')) return '#1f2a44';
    if (value.includes('azul')) return '#2f6fb3';
    if (value.includes('vino')) return '#7f1d35';
    if (value.includes('gris')) return '#8b9198';
    if (value.includes('rojo')) return '#c1121f';
    return '#d90429';
  }
}
