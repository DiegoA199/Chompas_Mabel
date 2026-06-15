package pe.edu.continental.chompasmabel.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.continental.chompasmabel.dto.VentaResponse;
import pe.edu.continental.chompasmabel.repository.VentaRepository;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaRepository repository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<VentaResponse> listar() {
        return repository.findAllByOrderByFechaVentaDesc().stream()
                .map(VentaResponse::from)
                .toList();
    }
}
