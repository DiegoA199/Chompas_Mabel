import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../config/environment';

interface AuthResponse {
  token: string;
  usuarioId: number;
  usuario: string;
  rol: string;
}

@Injectable({providedIn:'root'})
export class AuthService {
  private userSignal = signal<string | null>(localStorage.getItem('cm_user'));
  private roleSignal = signal<string | null>(localStorage.getItem('cm_role'));
  private userIdSignal = signal<number>(Number(localStorage.getItem('cm_user_id') ?? '0'));

  isLoggedIn = computed(() => !!this.userSignal());
  currentUser = computed(() => this.userSignal() ?? 'Invitado');
  currentRole = computed(() => this.roleSignal() ?? 'Sin rol');
  currentUserId = computed(() => this.userIdSignal() || 1);
  isAdmin = computed(() => this.roleSignal() === 'ADMIN');
  isVendedor = computed(() => this.roleSignal() === 'VENDEDOR');

  constructor(private router: Router, private http: HttpClient) {}

  login(email:string, password:string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('cm_token', response.token);
        localStorage.setItem('cm_user_id', String(response.usuarioId));
        localStorage.setItem('cm_user', response.usuario);
        localStorage.setItem('cm_role', response.rol);
        this.userIdSignal.set(response.usuarioId);
        this.userSignal.set(response.usuario);
        this.roleSignal.set(response.rol);
        this.router.navigateByUrl('/dashboard');
      })
    );
  }

  logout(): void {
    localStorage.removeItem('cm_token');
    localStorage.removeItem('cm_user_id');
    localStorage.removeItem('cm_user');
    localStorage.removeItem('cm_role');
    this.userIdSignal.set(0);
    this.userSignal.set(null);
    this.roleSignal.set(null);
    this.router.navigateByUrl('/login');
  }
}
