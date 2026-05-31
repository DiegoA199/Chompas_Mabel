package pe.edu.continental.chompasmabel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import pe.edu.continental.chompasmabel.model.Cliente;
import pe.edu.continental.chompasmabel.model.Pedido;
import pe.edu.continental.chompasmabel.model.Usuario;
import pe.edu.continental.chompasmabel.model.Venta;

public record PedidoResponse(
        Long id,
        String numero,
        Long clienteId,
        String cliente,
        Long usuarioId,
        String usuario,
        LocalDateTime fechaPedido,
        LocalDate fechaEntrega,
        BigDecimal total,
        String estado,
        String metodoPago,
        Long ventaId,
        List<DetallePedidoResponse> detalles
) {
    public static PedidoResponse from(Pedido pedido) {
        Cliente cliente = pedido.getCliente();
        Usuario usuario = pedido.getUsuario();
        Venta venta = pedido.getVenta();
        List<DetallePedidoResponse> detalles = pedido.getDetalles() == null
                ? List.of()
                : pedido.getDetalles().stream().map(DetallePedidoResponse::from).toList();

        return new PedidoResponse(
                pedido.getId(),
                pedido.getNumero(),
                cliente != null ? cliente.getId() : null,
                cliente != null ? nombreCliente(cliente) : null,
                usuario != null ? usuario.getId() : null,
                usuario != null ? usuario.getNombre() : null,
                pedido.getFechaPedido(),
                pedido.getFechaEntrega(),
                pedido.getTotal(),
                pedido.getEstado() != null ? pedido.getEstado().name() : null,
                pedido.getMetodoPago(),
                venta != null ? venta.getId() : null,
                detalles
        );
    }

    private static String nombreCliente(Cliente cliente) {
        String apellidos = cliente.getApellidos() == null ? "" : cliente.getApellidos();
        return (cliente.getNombres() + " " + apellidos).trim();
    }
}
