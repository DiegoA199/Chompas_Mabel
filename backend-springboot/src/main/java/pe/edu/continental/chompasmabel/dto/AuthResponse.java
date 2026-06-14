package pe.edu.continental.chompasmabel.dto;

public record AuthResponse(String token, Long usuarioId, String usuario, String rol) {
}
