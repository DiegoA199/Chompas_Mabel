import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({selector:'app-login',standalone:true,imports:[ReactiveFormsModule],templateUrl: './login.component.html',
  styleUrl: './login.component.css'})
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
