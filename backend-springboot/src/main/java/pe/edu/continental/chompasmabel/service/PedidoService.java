package pe.edu.continental.chompasmabel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.continental.chompasmabel.dto.DetallePedidoRequest;
import pe.edu.continental.chompasmabel.dto.PedidoRequest;
import pe.edu.continental.chompasmabel.dto.PedidoResponse;
import pe.edu.continental.chompasmabel.model.Cliente;
import pe.edu.continental.chompasmabel.model.DetallePedido;
import pe.edu.continental.chompasmabel.model.InventarioMovimiento;
import pe.edu.continental.chompasmabel.model.Pedido;
import pe.edu.continental.chompasmabel.model.Producto;
import pe.edu.continental.chompasmabel.model.Usuario;
import pe.edu.continental.chompasmabel.model.Venta;
import pe.edu.continental.chompasmabel.repository.ClienteRepository;
import pe.edu.continental.chompasmabel.repository.InventarioMovimientoRepository;
import pe.edu.continental.chompasmabel.repository.PedidoRepository;
import pe.edu.continental.chompasmabel.repository.ProductoRepository;
import pe.edu.continental.chompasmabel.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final InventarioMovimientoRepository inventarioMovimientoRepository;

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar() {
        return pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaPedido")).stream()
                .map(PedidoResponse::from)
                .toList();
    }

    @Transactional
    public PedidoResponse crear(PedidoRequest request) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente no encontrado"));
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario no encontrado"));

        Pedido pedido = Pedido.builder()
                .numero(resolverNumero(request.numero()))
                .cliente(cliente)
                .usuario(usuario)
                .fechaPedido(LocalDateTime.now())
                .fechaEntrega(request.fechaEntrega() != null ? request.fechaEntrega() : LocalDate.now().plusDays(2))
                .estado(request.estado() != null ? request.estado() : Pedido.EstadoPedido.CONFIRMADO)
                .metodoPago(limpiar(request.metodoPago()))
                .total(BigDecimal.ZERO)
                .montoPagado(BigDecimal.ZERO)
                .saldoPendiente(BigDecimal.ZERO)
                .estadoCredito(Pedido.EstadoCredito.SIN_CREDITO)
                .detalles(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (DetallePedidoRequest detalleRequest : request.detalles()) {
            DetallePedido detalle = crearDetalle(pedido, detalleRequest);
            pedido.getDetalles().add(detalle);
            total = total.add(detalle.getSubtotal());
        }

        pedido.setTotal(total);
        aplicarCredito(pedido, request.montoPagado(), request.fechaVencimientoCredito());
        if (generaVenta(pedido.getEstado())) {
            pedido.setVenta(Venta.builder()
                    .pedido(pedido)
                    .fechaVenta(LocalDateTime.now())
                    .montoTotal(total)
                    .tipoComprobante("BOLETA")
                    .build());
        }

        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse marcarCreditoPagado(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        if (pedido.getEstadoCredito() == Pedido.EstadoCredito.SIN_CREDITO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El pedido no fue registrado a credito");
        }

        pedido.setMontoPagado(pedido.getTotal());
        pedido.setSaldoPendiente(BigDecimal.ZERO);
        pedido.setEstadoCredito(Pedido.EstadoCredito.PAGADO);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    private DetallePedido crearDetalle(Pedido pedido, DetallePedidoRequest detalleRequest) {
        Producto producto = productoRepository.findById(detalleRequest.productoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto no encontrado"));
        Integer cantidad = detalleRequest.cantidad();
        if (producto.getStock() == null || producto.getStock() < cantidad) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Stock insuficiente para " + producto.getNombre());
        }

        BigDecimal precioUnitario = producto.getPrecio();
        BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        producto.setStock(producto.getStock() - cantidad);
        producto.setEstado(producto.getStock() <= 10
                ? Producto.EstadoProducto.STOCK_BAJO
                : Producto.EstadoProducto.ACTIVO);

        inventarioMovimientoRepository.save(InventarioMovimiento.builder()
                .producto(producto)
                .tipoMovimiento(InventarioMovimiento.TipoMovimiento.SALIDA)
                .cantidad(cantidad)
                .fechaMovimiento(LocalDateTime.now())
                .observacion("Salida por pedido " + pedido.getNumero())
                .build());

        return DetallePedido.builder()
                .pedido(pedido)
                .producto(producto)
                .cantidad(cantidad)
                .precioUnitario(precioUnitario)
                .subtotal(subtotal)
                .build();
    }

    private boolean generaVenta(Pedido.EstadoPedido estado) {
        return estado == Pedido.EstadoPedido.CONFIRMADO
                || estado == Pedido.EstadoPedido.EN_PROCESO
                || estado == Pedido.EstadoPedido.ENTREGADO
                || estado == Pedido.EstadoPedido.VENDIDO;
    }

    private void aplicarCredito(Pedido pedido, BigDecimal montoPagadoSolicitado, LocalDate fechaVencimientoSolicitada) {
        if (!esCredito(pedido.getMetodoPago())) {
            pedido.setMontoPagado(pedido.getTotal());
            pedido.setSaldoPendiente(BigDecimal.ZERO);
            pedido.setFechaVencimientoCredito(null);
            pedido.setEstadoCredito(Pedido.EstadoCredito.SIN_CREDITO);
            return;
        }

        BigDecimal montoPagado = montoPagadoSolicitado == null ? BigDecimal.ZERO : montoPagadoSolicitado;
        if (montoPagado.compareTo(pedido.getTotal()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto pagado no puede superar el total");
        }

        BigDecimal saldo = pedido.getTotal().subtract(montoPagado);
        LocalDate vencimiento = fechaVencimientoSolicitada != null
                ? fechaVencimientoSolicitada
                : LocalDate.now().plusDays(15);

        pedido.setMontoPagado(montoPagado);
        pedido.setSaldoPendiente(saldo);
        pedido.setFechaVencimientoCredito(vencimiento);
        if (saldo.compareTo(BigDecimal.ZERO) == 0) {
            pedido.setEstadoCredito(Pedido.EstadoCredito.PAGADO);
        } else if (vencimiento.isBefore(LocalDate.now())) {
            pedido.setEstadoCredito(Pedido.EstadoCredito.VENCIDO);
        } else {
            pedido.setEstadoCredito(Pedido.EstadoCredito.PENDIENTE);
        }
    }

    private boolean esCredito(String metodoPago) {
        return metodoPago != null && metodoPago.trim().equalsIgnoreCase("Credito");
    }

    private String resolverNumero(String numeroSolicitado) {
        if (numeroSolicitado != null && !numeroSolicitado.isBlank()) {
            String numero = numeroSolicitado.trim();
            if (pedidoRepository.existsByNumero(numero)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El numero de pedido ya existe");
            }
            return numero;
        }

        String prefijo = "PED-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-";
        long correlativo = pedidoRepository.count() + 1;
        String numero;
        do {
            numero = prefijo + String.format("%04d", correlativo++);
        } while (pedidoRepository.existsByNumero(numero));
        return numero;
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
