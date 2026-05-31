package pe.edu.continental.chompasmabel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank(message = "El codigo es obligatorio")
        @Size(max = 30, message = "El codigo no debe superar 30 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 3, max = 140, message = "El nombre debe tener entre 3 y 140 caracteres")
        String nombre,

        @Size(max = 255, message = "La descripcion no debe superar 255 caracteres")
        String descripcion,

        Long categoriaId,

        @NotBlank(message = "La categoria es obligatoria")
        @Size(min = 3, max = 100, message = "La categoria debe tener entre 3 y 100 caracteres")
        String categoria,

        @NotBlank(message = "La talla es obligatoria")
        @Size(max = 50, message = "La talla no debe superar 50 caracteres")
        String talla,

        @NotBlank(message = "El color es obligatorio")
        @Size(max = 50, message = "El color no debe superar 50 caracteres")
        String color,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.00", message = "El precio debe ser mayor o igual a 0")
        BigDecimal precio,

        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock debe ser mayor o igual a 0")
        Integer stock
) {
}
