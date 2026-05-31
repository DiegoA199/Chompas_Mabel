package pe.edu.continental.chompasmabel.dto;

import java.math.BigDecimal;
import pe.edu.continental.chompasmabel.model.DetallePedido;
import pe.edu.continental.chompasmabel.model.Producto;

public record DetallePedidoResponse(
        Long id,
        Long productoId,
        String producto,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {
    public static DetallePedidoResponse from(DetallePedido detalle) {
        Producto producto = detalle.getProducto();
        return new DetallePedidoResponse(
                detalle.getId(),
                producto != null ? producto.getId() : null,
                producto != null ? producto.getNombre() : null,
                detalle.getCantidad(),
                detalle.getPrecioUnitario(),
                detalle.getSubtotal()
        );
    }
}
