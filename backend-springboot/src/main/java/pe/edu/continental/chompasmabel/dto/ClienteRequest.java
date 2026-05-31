package pe.edu.continental.chompasmabel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank(message = "Los nombres son obligatorios")
        @Size(min = 3, max = 120, message = "Los nombres deben tener entre 3 y 120 caracteres")
        String nombres,

        @Size(max = 120, message = "Los apellidos no deben superar 120 caracteres")
        String apellidos,

        @Size(max = 30, message = "El telefono no debe superar 30 caracteres")
        String telefono,

        @Size(max = 180, message = "La direccion no debe superar 180 caracteres")
        String direccion,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo debe tener un formato valido")
        @Size(max = 150, message = "El correo no debe superar 150 caracteres")
        String correo
) {
}
