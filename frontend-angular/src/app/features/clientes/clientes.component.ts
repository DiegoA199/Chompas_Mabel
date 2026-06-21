import { Component, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../core/models/cliente.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { ClienteService } from '../../core/services/cliente.service';

@Component({selector:'app-clientes',standalone:true,imports:[ReactiveFormsModule],templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'})
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
