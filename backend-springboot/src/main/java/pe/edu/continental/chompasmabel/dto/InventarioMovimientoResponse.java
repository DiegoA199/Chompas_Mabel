package pe.edu.continental.chompasmabel.dto;

import java.time.LocalDateTime;
import pe.edu.continental.chompasmabel.model.Categoria;
import pe.edu.continental.chompasmabel.model.InventarioMovimiento;
import pe.edu.continental.chompasmabel.model.Producto;

public record InventarioMovimientoResponse(
        Long id,
        Long productoId,
        String codigoProducto,
        String producto,
        String categoria,
        String tipoMovimiento,
        Integer cantidad,
        LocalDateTime fechaMovimiento,
        String observacion
) {
    public static InventarioMovimientoResponse from(InventarioMovimiento movimiento) {
        Producto producto = movimiento.getProducto();
        Categoria categoria = producto != null ? producto.getCategoria() : null;
        return new InventarioMovimientoResponse(
                movimiento.getId(),
                producto != null ? producto.getId() : null,
                producto != null ? producto.getCodigo() : null,
                producto != null ? producto.getNombre() : null,
                categoria != null ? categoria.getNombre() : null,
                movimiento.getTipoMovimiento() != null ? movimiento.getTipoMovimiento().name() : null,
                movimiento.getCantidad(),
                movimiento.getFechaMovimiento(),
                movimiento.getObservacion()
        );
    }
}
