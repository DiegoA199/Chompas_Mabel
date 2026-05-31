import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({selector:'app-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <img src="assets/logo.svg" alt="Logo">
      <div><h4 class="mb-0">Chompas Mabel</h4><small>Sistema Web de Gestion</small></div>
    </div>
    @for(item of menu; track item.path){
      <a class="nav-link" [routerLink]="item.path" routerLinkActive="active">
        <i class="bi" [class]="item.icon"></i><span class="label ms-3">{{item.label}}</span>
      </a>
    }
    <div class="mt-auto pt-5 text-secondary small">2026 Chompas Mabel</div>
  </aside>
  <section class="content">
    <header class="topbar">
      <div class="input-group search">
        <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
        <input class="form-control" placeholder="Buscar productos, pedidos, clientes...">
      </div>
      <div class="d-flex align-items-center gap-3">
        <i class="bi bi-bell fs-5 position-relative"><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">6</span></i>
        <div class="avatar">{{iniciales()}}</div>
        <div><strong>{{auth.currentUser()}}</strong><br><small class="text-muted">{{auth.currentRole()}}</small></div>
        <button class="btn btn-sm btn-outline-secondary" (click)="auth.logout()">Salir</button>
      </div>
    </header>
    <main class="page"><router-outlet /></main>
  </section>
</div>`})
export class LayoutComponent {
  menu = [
    {label:'Dashboard',path:'/dashboard',icon:'bi-speedometer2'},
    {label:'Productos',path:'/productos',icon:'bi-bag-heart'},
    {label:'Inventario',path:'/inventario',icon:'bi-box-seam'},
    {label:'Pedidos',path:'/pedidos',icon:'bi-clipboard-check'},
    {label:'Clientes',path:'/clientes',icon:'bi-people'},
    {label:'Ventas',path:'/ventas',icon:'bi-cart4'},
    {label:'Reportes',path:'/reportes',icon:'bi-bar-chart'}
  ];

  constructor(public auth: AuthService) {}

  iniciales(): string {
    return this.auth.currentUser().split(' ').slice(0, 2).map(parte => parte[0] ?? '').join('').toUpperCase();
  }
}
