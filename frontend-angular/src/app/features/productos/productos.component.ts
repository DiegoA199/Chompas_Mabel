import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto, ProductoPayload } from '../../core/models/producto.model';
import { AuthService } from '../../core/services/auth.service';
import { BusquedaService } from '../../core/services/busqueda.service';
import { ProductoService } from '../../core/services/producto.service';

@Component({selector:'app-productos',standalone:true,imports:[ReactiveFormsModule,CurrencyPipe],template:`
<div class="d-flex justify-content-between align-items-center mb-3">
  <div>
    <h1 class="fw-bold">{{auth.isAdmin() ? 'Gestion de productos e inventario' : 'Catalogo para clientes'}}</h1>
    <p class="text-muted">{{auth.isAdmin() ? 'Catalogo, stock y valorizacion del inventario.' : 'Variedad de chompas disponible para mostrar precios, tallas, colores y stock.'}}</p>
  </div>
  @if(auth.isAdmin()){
    <button class="btn btn-brand" data-bs-toggle="collapse" data-bs-target="#formProducto"><i class="bi bi-plus"></i> Nuevo producto</button>
  }
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

@if(auth.isAdmin()){
  <div class="row g-4 mb-4">
    <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-box"></i></div><div><small>Productos totales</small><h3>{{service.productos().length}}</h3></div></div></div>
    <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-exclamation-triangle"></i></div><div><small>Stock bajo</small><h3>{{service.stockBajo().length}}</h3></div></div></div>
    <div class="col-md-4"><div class="card-soft kpi"><div class="kpi-icon"><i class="bi bi-cash"></i></div><div><small>Valorizacion</small><h3>{{service.valorInventario()|currency:'PEN':'symbol':'1.2-2'}}</h3></div></div></div>
  </div>

  <div id="formProducto" class="collapse show">
    <form [formGroup]="form" (ngSubmit)="guardar()" class="card-soft p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0">{{editandoId() ? 'Editar producto' : 'Registrar producto'}}</h4>
        @if(editandoId()){
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="cancelarEdicion()">Cancelar</button>
        }
      </div>
      @if(errorFormulario()){
        <div class="alert alert-danger">{{errorFormulario()}}</div>
      }
      <div class="row g-3">
        <div class="col-md-2">
          <label class="form-label">Codigo</label>
          <input class="form-control" formControlName="codigo">
        </div>
        <div class="col-md-3">
          <label class="form-label">Nombre</label>
          <input class="form-control" formControlName="nombre">
          @if(form.controls.nombre.invalid && form.controls.nombre.touched){<small class="text-danger">Minimo 3 caracteres.</small>}
        </div>
        <div class="col-md-2">
          <label class="form-label">Categoria</label>
          <select class="form-select" formControlName="categoria">
            @for(categoria of categorias; track categoria){<option [value]="categoria">{{categoria}}</option>}
          </select>
        </div>
        <div class="col-md-1">
          <label class="form-label">Talla</label>
          <input class="form-control" formControlName="talla">
        </div>
        <div class="col-md-1">
          <label class="form-label">Color</label>
          <input class="form-control" formControlName="color">
        </div>
        <div class="col-md-1">
          <label class="form-label">Precio</label>
          <input type="number" class="form-control" formControlName="precio">
          @if(form.controls.precio.invalid && form.controls.precio.touched){<small class="text-danger">Debe ser >= 0.</small>}
        </div>
        <div class="col-md-1">
          <label class="form-label">Stock</label>
          <input type="number" class="form-control" formControlName="stock">
          @if(form.controls.stock.invalid && form.controls.stock.touched){<small class="text-danger">Debe ser >= 0.</small>}
        </div>
        <div class="col-md-1 d-flex align-items-end">
          <button class="btn btn-brand w-100" [disabled]="form.invalid || guardando()">{{guardando() ? '...' : 'Guardar'}}</button>
        </div>
        <div class="col-12">
          <label class="form-label">Descripcion</label>
          <input class="form-control" formControlName="descripcion" placeholder="Material, acabado, temporada o notas de produccion">
        </div>
      </div>
    </form>
  </div>

  <div class="card-soft p-4">
    <div class="d-flex justify-content-between mb-3"><h4>Listado de productos</h4></div>
    <div class="table-responsive">
      <table class="table table-hover">
        <thead><tr><th>Codigo</th><th>Producto</th><th>Categoria</th><th>Talla</th><th>Color</th><th>Stock</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          @for(p of productosFiltrados(); track p.id){
            <tr>
              <td>{{p.codigo}}</td>
              <td><strong>{{p.nombre}}</strong><br><small class="text-muted">{{p.descripcion}}</small></td>
              <td>{{p.categoria}}</td>
              <td>{{p.talla}}</td>
              <td>{{p.color}}</td>
              <td [class.text-danger]="p.stock<=10">{{p.stock}}</td>
              <td>{{p.precio|currency:'PEN':'symbol':'1.2-2'}}</td>
              <td><span class="badge" [class.bg-success]="p.stock>10" [class.bg-warning]="p.stock<=10">{{p.stock<=10?'Stock bajo':'Activo'}}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-secondary me-2" type="button" (click)="editar(p)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" type="button" (click)="eliminar(p)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
} @else {
  <section class="catalog-banner mb-4">
    <div>
      <span class="catalog-eyebrow">Chompas Mabel</span>
      <h2>Catalogo visual para atencion al cliente</h2>
      <p>Modelos listos para cotizar por talla, color, stock y precio.</p>
    </div>
    <div class="catalog-summary">
      <strong>{{service.productos().length}}</strong>
      <span>modelos disponibles</span>
    </div>
  </section>

  <div class="catalog-toolbar mb-4">
    <div class="input-group">
      <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
      <input class="form-control" [value]="busqueda.termino()" (input)="buscar($event)" placeholder="Buscar por modelo, color o talla">
    </div>
    <div class="catalog-categories">
      <button type="button" class="btn btn-sm" [class.btn-brand]="categoriaActiva()==='Todas'" [class.btn-outline-secondary]="categoriaActiva()!=='Todas'" (click)="filtrarCategoria('Todas')">Todas</button>
      @for(categoria of categoriasCatalogo(); track categoria){
        <button type="button" class="btn btn-sm" [class.btn-brand]="categoriaActiva()===categoria" [class.btn-outline-secondary]="categoriaActiva()!==categoria" (click)="filtrarCategoria(categoria)">{{categoria}}</button>
      }
    </div>
  </div>

  <div class="catalog-grid">
    @for(producto of productosFiltrados(); track producto.id){
      <article class="catalog-card">
        <div class="catalog-image" [style.background-image]="imagenProducto(producto)">
          <span class="catalog-badge">{{producto.categoria}}</span>
          <span class="catalog-stock" [class.stock-low]="producto.stock <= 10">{{producto.stock > 10 ? 'Disponible' : 'Stock bajo'}}</span>
        </div>
        <div class="catalog-body">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h3>{{producto.nombre}}</h3>
              <p>{{producto.descripcion || 'Modelo de temporada para venta inmediata.'}}</p>
            </div>
            <strong class="catalog-price">{{producto.precio|currency:'PEN':'symbol':'1.2-2'}}</strong>
          </div>
          <div class="catalog-meta">
            <span><i class="bi bi-rulers"></i>{{producto.talla}}</span>
            <span><i class="bi bi-palette"></i>{{producto.color}}</span>
            <span><i class="bi bi-box-seam"></i>{{producto.stock}} und.</span>
          </div>
          <div class="catalog-actions">
            <span class="color-chip" [style.background]="colorVisual(producto.color)"></span>
            <span class="text-muted">Codigo {{producto.codigo}}</span>
          </div>
        </div>
      </article>
    } @empty {
      <div class="card-soft p-4 text-center text-muted">No hay productos que coincidan con la busqueda.</div>
    }
  </div>
}
`})
export class ProductosComponent implements OnInit {
  categorias = ['Clasicas', 'Juveniles', 'Cardigans', 'Alpaca', 'Corporativas'];
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  errorFormulario = signal('');
  categoriaActiva = signal('Todas');

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
  }

  filtrarCategoria(categoria: string): void {
    this.categoriaActiva.set(categoria);
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
