package pe.edu.continental.chompasmabel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import pe.edu.continental.chompasmabel.model.Pedido;

public record PedidoRequest(
        @Size(max = 40, message = "El numero no debe superar 40 caracteres")
        String numero,

        @NotNull(message = "El cliente es obligatorio")
        Long clienteId,

        @NotNull(message = "El usuario es obligatorio")
        Long usuarioId,

        @Size(max = 50, message = "El metodo de pago no debe superar 50 caracteres")
        String metodoPago,

        LocalDate fechaEntrega,

        Pedido.EstadoPedido estado,

        @Valid
        @NotEmpty(message = "El pedido debe tener al menos un detalle")
        List<DetallePedidoRequest> detalles
) {
}
