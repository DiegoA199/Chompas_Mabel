package pe.edu.continental.chompasmabel.repository;
import pe.edu.continental.chompasmabel.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    boolean existsByNumero(String numero);
}
