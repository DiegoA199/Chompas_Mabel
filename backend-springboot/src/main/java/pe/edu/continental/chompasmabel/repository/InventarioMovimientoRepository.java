package pe.edu.continental.chompasmabel.repository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.continental.chompasmabel.model.InventarioMovimiento;

public interface InventarioMovimientoRepository extends JpaRepository<InventarioMovimiento, Long> {

    @EntityGraph(attributePaths = {"producto", "producto.categoria"})
    List<InventarioMovimiento> findAllByOrderByFechaMovimientoDesc();

    @EntityGraph(attributePaths = {"producto", "producto.categoria"})
    List<InventarioMovimiento> findByProducto_IdOrderByFechaMovimientoDesc(Long productoId);
}
