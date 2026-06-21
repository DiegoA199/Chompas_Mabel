import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductoService } from '../../core/services/producto.service';
import { PedidoService } from '../../core/services/pedido.service';
import { AuthService } from '../../core/services/auth.service';

@Component({selector:'app-dashboard',standalone:true,imports:[CurrencyPipe],templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'})
export class DashboardComponent implements OnInit {
  constructor(public productos: ProductoService, public pedidos: PedidoService, public auth: AuthService) {}

  ngOnInit(): void {
    this.productos.cargarDesdeApi();
    this.pedidos.cargarDesdeApi();
  }
}
