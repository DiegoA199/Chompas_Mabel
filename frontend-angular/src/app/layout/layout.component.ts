import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { BusquedaService } from '../core/services/busqueda.service';
import { PedidoService } from '../core/services/pedido.service';
import { ProductoService } from '../core/services/producto.service';

type MenuItem = {label: string; path: string; icon: string; roles: string[]};
type Notificacion = {titulo: string; detalle: string; icon: string; path: string};

@Component({selector:'app-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'})
export class LayoutComponent implements OnInit {
  notificacionesAbiertas = signal(false);
  rutaActiva = signal('dashboard');

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

  constructor(
    public auth: AuthService,
    public busqueda: BusquedaService,
    private pedidos: PedidoService,
    private productos: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pedidos.cargarDesdeApi();
    this.productos.cargarDesdeApi();
    this.actualizarRuta(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.actualizarRuta(event.urlAfterRedirects));
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

  actualizarBusqueda(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.busqueda.actualizar(input.value);
  }

  placeholderBusqueda(): string {
    const ruta = this.rutaActiva();
    if (ruta === 'productos') return 'Buscar productos, tallas, colores...';
    if (ruta === 'pedidos') return 'Buscar pedidos, clientes, estados...';
    if (ruta === 'clientes') return 'Buscar clientes, telefono, correo...';
    if (ruta === 'creditos') return 'Buscar creditos, clientes, estados...';
    if (ruta === 'ventas') return 'Buscar ventas, clientes, productos...';
    if (ruta === 'inventario') return 'Buscar movimientos, productos, tipo...';
    return 'Buscar en la vista actual...';
  }

  iniciales(): string {
    return this.auth.currentUser().split(' ').slice(0, 2).map(parte => parte[0] ?? '').join('').toUpperCase();
  }

  private formatoMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  private actualizarRuta(url: string): void {
    const ruta = url.split('?')[0].replace(/^\/+/, '').split('/')[0] || 'dashboard';
    this.rutaActiva.set(ruta);
  }
}
