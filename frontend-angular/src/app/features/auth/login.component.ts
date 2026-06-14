import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({selector:'app-login',standalone:true,imports:[ReactiveFormsModule],template:`
<div class="login-page">
  <section class="login-hero">
    <div>
      <div class="brand"><img src="assets/logo.svg" alt="Logo"><div><h2>Chompas Mabel</h2><p>Sistema Web de Gestion</p></div></div>
      <hr class="border-danger border-3 w-25">
      <h1 class="display-5 fw-bold mt-5">Bienvenido de nuevo</h1>
      <p class="fs-4 text-white-50">Gestion de ventas, pedidos, clientes e inventario.</p>
    </div>
    <small>2026 Chompas Mabel. Todos los derechos reservados.</small>
  </section>
  <section class="d-flex align-items-center p-4">
    <div class="login-card card-soft p-5 w-100">
      <div class="text-center mb-4">
        <div class="kpi-icon mx-auto"><i class="bi bi-lock"></i></div>
        <h2 class="mt-3">Iniciar sesion</h2>
        <p class="text-muted">Ingresa tus credenciales para continuar</p>
      </div>
      @if(error()){
        <div class="alert alert-danger">{{error()}}</div>
      }
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label class="form-label">Correo electronico</label>
        <input class="form-control" formControlName="email" placeholder="admin@chompasmabel.com">
        @if(form.controls.email.invalid && form.controls.email.touched){
          <small class="text-danger">Ingresa un correo valido.</small>
        }
        <label class="form-label mt-3">Contrasena</label>
        <input type="password" class="form-control" formControlName="password" placeholder="********">
        @if(form.controls.password.invalid && form.controls.password.touched){
          <small class="text-danger">La contrasena debe tener al menos 6 caracteres.</small>
        }
        <div class="form-check my-4">
          <input type="checkbox" class="form-check-input" formControlName="remember">
          <label class="form-check-label">Recordarme</label>
        </div>
        <button class="btn btn-brand w-100 py-3" [disabled]="form.invalid || cargando()">
          {{cargando() ? 'Validando...' : 'Iniciar sesion'}}
        </button>
      </form>
      <div class="alert alert-light border-danger mt-4">
        <strong>Credenciales de demostracion</strong><br>
        Administrador: admin@chompasmabel.com / admin123<br>
        Vendedor: vendedor@chompasmabel.com / venta123
        <div class="d-flex gap-2 mt-3">
          <button type="button" class="btn btn-sm btn-outline-danger" (click)="usarAdmin()">Usar Admin</button>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="usarVendedor()">Usar Vendedor</button>
        </div>
      </div>
    </div>
  </section>
</div>`})
export class LoginComponent {
  error = signal('');
  cargando = signal(false);

  form = this.fb.group({
    email: ['admin@chompasmabel.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]],
    remember: [true]
  });

  constructor(private fb: NonNullableFormBuilder, private auth: AuthService) {}

  usarAdmin(): void {
    this.form.patchValue({email: 'admin@chompasmabel.com', password: 'admin123'});
  }

  usarVendedor(): void {
    this.form.patchValue({email: 'vendedor@chompasmabel.com', password: 'venta123'});
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      error: () => {
        this.error.set('Verifica tus credenciales y que el backend este activo.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false)
    });
  }
}
