package pe.edu.continental.chompasmabel.dto;

import pe.edu.continental.chompasmabel.model.Cliente;

public record ClienteResponse(
        Long id,
        String nombres,
        String apellidos,
        String telefono,
        String direccion,
        String correo,
        String nombreCompleto
) {
    public static ClienteResponse from(Cliente cliente) {
        String apellidos = cliente.getApellidos() == null ? "" : cliente.getApellidos();
        String nombreCompleto = (cliente.getNombres() + " " + apellidos).trim();
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNombres(),
                cliente.getApellidos(),
                cliente.getTelefono(),
                cliente.getDireccion(),
                cliente.getCorreo(),
                nombreCompleto
        );
    }
}
