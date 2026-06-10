import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductosComponent } from './features/productos/productos.component';
import { PedidosComponent } from './features/pedidos/pedidos.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { CreditosComponent } from './features/creditos/creditos.component';

export const routes: Routes = [
  {path:'login', component: LoginComponent},
  {path:'', component: LayoutComponent, children:[
    {path:'', redirectTo:'dashboard', pathMatch:'full'},
    {path:'dashboard', component: DashboardComponent},
    {path:'productos', component: ProductosComponent},
    {path:'inventario', component: ProductosComponent},
    {path:'pedidos', component: PedidosComponent},
    {path:'clientes', component: ClientesComponent},
    {path:'ventas', component: PedidosComponent},
    {path:'creditos', component: CreditosComponent},
    {path:'reportes', component: ReportesComponent}
  ]},
  {path:'**', redirectTo:'dashboard'}
];
