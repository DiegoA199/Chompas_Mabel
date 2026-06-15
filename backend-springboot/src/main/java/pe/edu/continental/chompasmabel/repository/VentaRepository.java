package pe.edu.continental.chompasmabel.repository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.continental.chompasmabel.model.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    @EntityGraph(attributePaths = {"pedido", "pedido.cliente"})
    List<Venta> findAllByOrderByFechaVentaDesc();
}
