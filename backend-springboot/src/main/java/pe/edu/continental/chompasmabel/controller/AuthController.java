package pe.edu.continental.chompasmabel.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.continental.chompasmabel.dto.AuthRequest;
import pe.edu.continental.chompasmabel.dto.AuthResponse;
import pe.edu.continental.chompasmabel.model.Usuario;
import pe.edu.continental.chompasmabel.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(request.email().trim().toLowerCase())
                .filter(u -> Boolean.TRUE.equals(u.getEstado()))
                .filter(u -> u.getPassword().equals(request.password()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas"));

        return new AuthResponse("demo-token-springboot", usuario.getNombre(), usuario.getRol());
    }
}
