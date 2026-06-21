import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {path:'login', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)},
  {path:'', component: LayoutComponent, children:[
    {path:'', redirectTo:'dashboard', pathMatch:'full'},
    {path:'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)},
    {path:'productos', loadChildren: () => import('./features/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES)},
    {path:'inventario', loadChildren: () => import('./features/inventario/inventario.routes').then(m => m.INVENTARIO_ROUTES)},
    {path:'pedidos', loadChildren: () => import('./features/pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES)},
    {path:'clientes', loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)},
    {path:'ventas', loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES)},
    {path:'creditos', loadChildren: () => import('./features/creditos/creditos.routes').then(m => m.CREDITOS_ROUTES)},
    {path:'reportes', loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES)}
  ]},
  {path:'**', redirectTo:'dashboard'}
];
