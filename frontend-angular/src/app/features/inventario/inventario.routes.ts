import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { InventarioComponent } from './inventario.component';

export const INVENTARIO_ROUTES: Routes = [
  {path: '', component: InventarioComponent, canActivate: [roleGuard], data: {roles: ['ADMIN']}}
];
