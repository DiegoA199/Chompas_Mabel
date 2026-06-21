import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { ReportesComponent } from './reportes.component';

export const REPORTES_ROUTES: Routes = [
  {path: '', component: ReportesComponent, canActivate: [roleGuard], data: {roles: ['ADMIN']}}
];
