import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { PedidoService } from '../core/services/pedido.service';
import { ProductoService } from '../core/services/producto.service';

type MenuItem = {label: string; path: string; icon: string; roles: string[]};
type Notificacion = {titulo: string; detalle: string; icon: string; path: string};

@Component({selector:'app-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <img src="assets/logo.svg" alt="Logo">
      <div><h4 class="mb-0">Chompas Mabel</h4><small>Sistema Web de Gestion</small></div>
    </div>
    @for(item of menuVisible(); track item.path){
      <a class="nav-link" [routerLink]="item.path" routerLinkActive="active">
        <i [class]="'bi ' + item.icon"></i><span class="label ms-3">{{item.label}}</span>
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
        <div class="notification-wrapper">
          <button type="button" class="notification-button" (click)="toggleNotificaciones()" aria-label="Ver notificaciones">
            <i class="bi bi-bell fs-5"></i>
            @if(notificaciones().length){
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{{notificaciones().length}}</span>
            }
          </button>
          @if(notificacionesAbiertas()){
            <div class="notification-panel card-soft">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Notificaciones</strong>
                <button type="button" class="btn btn-sm btn-link text-muted p-0" (click)="toggleNotificaciones()">Cerrar</button>
              </div>
              @for(item of notificaciones(); track item.titulo){
                <a class="notification-item" [routerLink]="item.path" (click)="toggleNotificaciones()">
                  <i [class]="'bi ' + item.icon"></i>
                  <span><strong>{{item.titulo}}</strong><small>{{item.detalle}}</small></span>
                </a>
              } @empty {
                <p class="text-muted mb-0">Sin alertas por ahora.</p>
              }
            </div>
          }
        </div>
        <div class="avatar">{{iniciales()}}</div>
        <div class="user-meta"><strong>{{auth.currentUser()}}</strong><br><small class="text-muted">{{auth.currentRole()}}</small></div>
        <button class="btn btn-sm btn-outline-secondary" (click)="auth.logout()">Salir</button>
      </div>
    </header>
    <main class="page"><router-outlet /></main>
  </section>
</div>`})
export class LayoutComponent implements OnInit {
  notificacionesAbiertas = signal(false);

  menu = [
    {label:'Dashboard',path:'/dashboard',icon:'bi-speedometer2',roles:['ADMIN','VENDEDOR']},
    {label:'Productos',path:'/productos',icon:'bi-bag-heart',roles:['ADMIN','VENDEDOR']},
    {label:'Inventario',path:'/inventario',icon:'bi-box-seam',roles:['ADMIN']},
    {label:'Pedidos',path:'/pedidos',icon:'bi-clipboard-check',roles:['ADMIN','VENDEDOR']},
    {label:'Clientes',path:'/clientes',icon:'bi-people',roles:['ADMIN','VENDEDOR']},
    {label:'Ventas',path:'/ventas',icon:'bi-cart4',roles:['ADMIN','VENDEDOR']},
    {label:'Creditos',path:'/creditos',icon:'bi-credit-card',roles:['ADMIN','VENDEDOR']},
    {label:'Reportes',path:'/reportes',icon:'bi-bar-chart',roles:['ADMIN']}
  ] satisfies MenuItem[];

  constructor(public auth: AuthService, private pedidos: PedidoService, private productos: ProductoService) {}

  ngOnInit(): void {
    this.pedidos.cargarDesdeApi();
    this.productos.cargarDesdeApi();
  }

  menuVisible(): MenuItem[] {
    const rol = this.auth.currentRole();
    return this.menu
      .filter(item => item.roles.includes(rol))
      .map(item => !this.auth.isAdmin() && item.path === '/productos' ? {...item, label: 'Catalogo'} : item);
  }

  notificaciones(): Notificacion[] {
    const alertas: Notificacion[] = [];
    const creditosVencidos = this.pedidos.creditosVencidos();
    const pedidosPendientes = this.pedidos.pedidos().filter(pedido => pedido.estado === 'PENDIENTE');

    if (creditosVencidos.length) {
      alertas.push({
        titulo: `${creditosVencidos.length} credito(s) vencido(s)`,
        detalle: `Saldo: ${this.formatoMoneda(creditosVencidos.reduce((suma, pedido) => suma + pedido.saldoPendiente, 0))}`,
        icon: 'bi-calendar-x',
        path: '/creditos'
      });
    }

    if (pedidosPendientes.length) {
      alertas.push({
        titulo: `${pedidosPendientes.length} pedido(s) pendiente(s)`,
        detalle: 'Revisar confirmacion y entrega',
        icon: 'bi-clipboard-check',
        path: '/pedidos'
      });
    }

    if (this.auth.isAdmin() && this.productos.stockBajo().length) {
      alertas.push({
        titulo: `${this.productos.stockBajo().length} producto(s) con stock bajo`,
        detalle: 'Reponer inventario o revisar pedidos',
        icon: 'bi-exclamation-triangle',
        path: '/inventario'
      });
    }

    return alertas;
  }

  toggleNotificaciones(): void {
    this.notificacionesAbiertas.update(abierto => !abierto);
  }

  iniciales(): string {
    return this.auth.currentUser().split(' ').slice(0, 2).map(parte => parte[0] ?? '').join('').toUpperCase();
  }

  private formatoMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }
}
