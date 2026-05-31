package pe.edu.continental.chompasmabel.dto;

import java.math.BigDecimal;
import pe.edu.continental.chompasmabel.model.Categoria;
import pe.edu.continental.chompasmabel.model.Producto;

public record ProductoResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoria,
        String talla,
        String color,
        BigDecimal precio,
        Integer stock,
        String estado
) {
    public static ProductoResponse from(Producto producto) {
        Categoria categoria = producto.getCategoria();
        return new ProductoResponse(
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                producto.getDescripcion(),
                categoria != null ? categoria.getId() : null,
                categoria != null ? categoria.getNombre() : null,
                producto.getTalla(),
                producto.getColor(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getEstado() != null ? producto.getEstado().name() : null
        );
    }
}
