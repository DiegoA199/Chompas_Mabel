import { Component, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../core/models/cliente.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { ClienteService } from '../../core/services/cliente.service';

@Component({selector:'app-clientes',standalone:true,imports:[ReactiveFormsModule],template:`
<div class="d-flex justify-content-between align-items-center mb-4">
  <div><h1 class="fw-bold">Gestion de clientes</h1><p class="text-muted">Registro de clientes minoristas y empresas.</p></div>
</div>

@if(service.error()){
  <div class="alert alert-warning">{{service.error()}}</div>
}

<form [formGroup]="form" (ngSubmit)="guardar()" class="card-soft p-4 mb-4">
  <h4>Registrar cliente</h4>
  @if(errorFormulario()){
    <div class="alert alert-danger">{{errorFormulario()}}</div>
  }
  <div class="row g-3">
    <div class="col-md-3">
      <label class="form-label">Nombres</label>
      <input class="form-control" formControlName="nombres">
      @if(form.controls.nombres.invalid && form.controls.nombres.touched){<small class="text-danger">Minimo 3 caracteres.</small>}
    </div>
    <div class="col-md-3">
      <label class="form-label">Apellidos / Razon social</label>
      <input class="form-control" formControlName="apellidos">
    </div>
    <div class="col-md-2">
      <label class="form-label">Telefono</label>
      <input class="form-control" formControlName="telefono">
    </div>
    <div class="col-md-2">
      <label class="form-label">Correo</label>
      <input class="form-control" formControlName="correo">
      @if(form.controls.correo.invalid && form.controls.correo.touched){<small class="text-danger">Correo valido obligatorio.</small>}
    </div>
    <div class="col-md-2">
      <label class="form-label">Direccion</label>
      <input class="form-control" formControlName="direccion">
    </div>
    <div class="col-12">
      <button class="btn btn-brand" [disabled]="form.invalid || guardando()">{{guardando() ? 'Guardando...' : 'Guardar cliente'}}</button>
    </div>
  </div>
</form>

<div class="card-soft p-4">
  <div class="d-flex justify-content-between mb-3"><h4>Clientes registrados</h4><span class="badge bg-danger">{{service.totalClientes()}}</span></div>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead><tr><th>Cliente</th><th>Telefono</th><th>Correo</th><th>Direccion</th></tr></thead>
      <tbody>
        @for(c of clientesFiltrados(); track c.id){
          <tr><td><strong>{{c.nombreCompleto || (c.nombres + ' ' + (c.apellidos || ''))}}</strong></td><td>{{c.telefono}}</td><td>{{c.correo}}</td><td>{{c.direccion}}</td></tr>
        }
      </tbody>
    </table>
  </div>
</div>`})
export class ClientesComponent implements OnInit {
  guardando = signal(false);
  errorFormulario = signal('');

  form = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(3)]],
    apellidos: [''],
    telefono: [''],
    correo: ['', [Validators.required, Validators.email]],
    direccion: ['']
  });

  constructor(public service: ClienteService, private fb: NonNullableFormBuilder, private busqueda: BusquedaService) {}

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
    this.service.crear(this.form.getRawValue()).subscribe({
      next: () => this.form.reset({nombres:'', apellidos:'', telefono:'', correo:'', direccion:''}),
      error: () => this.errorFormulario.set('No se pudo registrar el cliente. Revisa el correo y los campos obligatorios.'),
      complete: () => this.guardando.set(false)
    });
  }

  clientesFiltrados(): Cliente[] {
    return this.service.clientes().filter(cliente => this.busqueda.coincide(
      cliente.nombreCompleto,
      cliente.nombres,
      cliente.apellidos,
      cliente.telefono,
      cliente.correo,
      cliente.direccion
    ));
  }
}
