import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto, ProductoPayload } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';

@Component({selector:'app-productos',standalone:true,imports:[ReactiveFormsModule,CurrencyPipe],template:`
<div class="d-flex justify-content-between align-items-center mb-3">
  <div><h1 class="fw-bold">Gestion de productos e inventario</h1><p class="text-muted">Catalogo, stock y valorizacion del inventario.</p></div>
  <button class="btn btn-brand" data-bs-toggle="collapse" data-bs-target="#formProducto"><i class="bi bi-plus"></i> Nuevo producto</button>
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

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
        @for(p of service.productos(); track p.id){
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
</div>`})
export class ProductosComponent implements OnInit {
  categorias = ['Clasicas', 'Juveniles', 'Cardigans', 'Alpaca', 'Corporativas'];
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  errorFormulario = signal('');

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

  constructor(public service: ProductoService, private fb: NonNullableFormBuilder) {}

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
}
