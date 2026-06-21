import { Component, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../core/models/cliente.model';
import { BusquedaService } from '../../core/services/busqueda.service';
import { ClienteService } from '../../core/services/cliente.service';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({selector:'app-clientes',standalone:true,imports:[ReactiveFormsModule,TablePaginationComponent],templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'})
export class ClientesComponent implements OnInit {
  guardando = signal(false);
  errorFormulario = signal('');
  pagina = signal(1);
  tamanoPagina = signal(5);

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
      next: () => {
        this.form.reset({nombres:'', apellidos:'', telefono:'', correo:'', direccion:''});
        this.pagina.set(1);
      },
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

  clientesPaginados(): Cliente[] {
    const clientes = this.clientesFiltrados();
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return clientes.slice(inicio, inicio + this.tamanoPagina());
  }

  actualizarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  actualizarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  paginaActual(): number {
    return Math.min(this.pagina(), Math.max(1, Math.ceil(this.clientesFiltrados().length / this.tamanoPagina())));
  }
}
