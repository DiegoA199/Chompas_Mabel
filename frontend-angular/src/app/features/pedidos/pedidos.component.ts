import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoPedido, Pedido, PedidoPayload } from '../../core/models/pedido.model';
import { AuthService } from '../../core/services/auth.service';
import { BusquedaService } from '../../core/services/busqueda.service';
import { ClienteService } from '../../core/services/cliente.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ProductoService } from '../../core/services/producto.service';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({selector:'app-pedidos',standalone:true,imports:[ReactiveFormsModule,CurrencyPipe,DatePipe,TablePaginationComponent],templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'})
export class PedidosComponent implements OnInit {
  estados: EstadoPedido[] = ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENTREGADO', 'VENDIDO', 'CANCELADO'];
  guardando = signal(false);
  errorFormulario = signal('');
  pagina = signal(1);
  tamanoPagina = signal(5);

  form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    productoId: [0, [Validators.required, Validators.min(1)]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    metodoPago: ['Yape', [Validators.required]],
    montoPagado: [0, [Validators.min(0)]],
    fechaVencimientoCredito: [''],
    estado: this.fb.control<EstadoPedido>('CONFIRMADO', {validators: [Validators.required]})
  });

  constructor(
    public service: PedidoService,
    public clientes: ClienteService,
    public productos: ProductoService,
    public auth: AuthService,
    private busqueda: BusquedaService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {
    this.service.cargarDesdeApi();
    this.clientes.cargarDesdeApi();
    this.productos.cargarDesdeApi();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: PedidoPayload = {
      clienteId: raw.clienteId,
      usuarioId: this.auth.currentUserId(),
      metodoPago: raw.metodoPago,
      estado: raw.estado,
      montoPagado: raw.metodoPago === 'Credito' ? raw.montoPagado : null,
      fechaVencimientoCredito: raw.metodoPago === 'Credito' && raw.fechaVencimientoCredito ? raw.fechaVencimientoCredito : null,
      detalles: [{productoId: raw.productoId, cantidad: raw.cantidad}]
    };

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.service.crear(payload).subscribe({
      next: () => {
        this.productos.cargarDesdeApi();
        this.form.reset({clienteId:0, productoId:0, cantidad:1, metodoPago:'Yape', montoPagado:0, fechaVencimientoCredito:'', estado:'CONFIRMADO'});
        this.pagina.set(1);
      },
      error: () => this.errorFormulario.set('No se pudo registrar el pedido. Revisa cliente, producto y stock disponible.'),
      complete: () => this.guardando.set(false)
    });
  }

  esCredito(): boolean {
    return this.form.controls.metodoPago.value === 'Credito';
  }

  totalEstimado(): number {
    const raw = this.form.getRawValue();
    const producto = this.productos.productos().find(item => item.id === raw.productoId);
    return producto ? producto.precio * raw.cantidad : 0;
  }

  saldoEstimado(): number {
    return Math.max(this.totalEstimado() - this.form.controls.montoPagado.value, 0);
  }

  pedidosFiltrados(): Pedido[] {
    return this.service.pedidos().filter(pedido => this.busqueda.coincide(
      pedido.numero,
      pedido.cliente,
      pedido.usuario,
      pedido.estado,
      pedido.metodoPago,
      pedido.estadoCredito,
      pedido.total,
      pedido.saldoPendiente,
      pedido.detalles.map(detalle => detalle.producto).join(' ')
    ));
  }

  pedidosPaginados(): Pedido[] {
    const pedidos = this.pedidosFiltrados();
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina();
    return pedidos.slice(inicio, inicio + this.tamanoPagina());
  }

  actualizarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  actualizarTamanoPagina(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  paginaActual(): number {
    return Math.min(this.pagina(), Math.max(1, Math.ceil(this.pedidosFiltrados().length / this.tamanoPagina())));
  }
}
