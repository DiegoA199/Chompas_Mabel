package pe.edu.continental.chompasmabel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import pe.edu.continental.chompasmabel.model.Cliente;
import pe.edu.continental.chompasmabel.model.Pedido;
import pe.edu.continental.chompasmabel.model.Venta;

public record VentaResponse(
        Long id,
        Long pedidoId,
        String numeroPedido,
        Long clienteId,
        String cliente,
        LocalDateTime fechaPedido,
        LocalDateTime fechaVenta,
        BigDecimal montoTotal,
        String tipoComprobante,
        String metodoPago,
        String estadoPedido
) {
    public static VentaResponse from(Venta venta) {
        Pedido pedido = venta.getPedido();
        Cliente cliente = pedido != null ? pedido.getCliente() : null;
        return new VentaResponse(
                venta.getId(),
                pedido != null ? pedido.getId() : null,
                pedido != null ? pedido.getNumero() : null,
                cliente != null ? cliente.getId() : null,
                cliente != null ? nombreCliente(cliente) : null,
                pedido != null ? pedido.getFechaPedido() : null,
                venta.getFechaVenta(),
                venta.getMontoTotal(),
                venta.getTipoComprobante(),
                pedido != null ? pedido.getMetodoPago() : null,
                pedido != null && pedido.getEstado() != null ? pedido.getEstado().name() : null
        );
    }

    private static String nombreCliente(Cliente cliente) {
        String apellidos = cliente.getApellidos() == null ? "" : cliente.getApellidos();
        return (cliente.getNombres() + " " + apellidos).trim();
    }
}
