package pe.edu.continental.chompasmabel.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.continental.chompasmabel.dto.InventarioMovimientoResponse;
import pe.edu.continental.chompasmabel.repository.InventarioMovimientoRepository;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioMovimientoRepository repository;

    @GetMapping("/movimientos")
    @Transactional(readOnly = true)
    public List<InventarioMovimientoResponse> listarMovimientos(@RequestParam(required = false) Long productoId) {
        return (productoId == null
                ? repository.findAllByOrderByFechaMovimientoDesc()
                : repository.findByProducto_IdOrderByFechaMovimientoDesc(productoId))
                .stream()
                .map(InventarioMovimientoResponse::from)
                .toList();
    }
}
