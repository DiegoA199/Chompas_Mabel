package pe.edu.continental.chompasmabel.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.continental.chompasmabel.dto.ProductoRequest;
import pe.edu.continental.chompasmabel.dto.ProductoResponse;
import pe.edu.continental.chompasmabel.model.Categoria;
import pe.edu.continental.chompasmabel.model.Producto;
import pe.edu.continental.chompasmabel.repository.CategoriaRepository;
import pe.edu.continental.chompasmabel.repository.ProductoRepository;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar() {
        return productoRepository.findAll(Sort.by("nombre")).stream()
                .map(ProductoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        return ProductoResponse.from(buscarProducto(id));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Producto producto = new Producto();
        aplicarDatos(producto, request);
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarProducto(id);
        aplicarDatos(producto, request);
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarProducto(id);
        productoRepository.delete(producto);
    }

    private Producto buscarProducto(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void aplicarDatos(Producto producto, ProductoRequest request) {
        producto.setCodigo(request.codigo().trim());
        producto.setNombre(request.nombre().trim());
        producto.setDescripcion(limpiar(request.descripcion()));
        producto.setCategoria(resolverCategoria(request));
        producto.setTalla(request.talla().trim());
        producto.setColor(request.color().trim());
        producto.setPrecio(request.precio());
        producto.setStock(request.stock());
        producto.setEstado(calcularEstado(request.stock()));
    }

    private Categoria resolverCategoria(ProductoRequest request) {
        if (request.categoriaId() != null) {
            return categoriaRepository.findById(request.categoriaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no encontrada"));
        }

        String nombre = request.categoria().trim();
        return categoriaRepository.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> categoriaRepository.save(Categoria.builder()
                        .nombre(nombre)
                        .descripcion("Categoria creada desde el modulo de productos")
                        .build()));
    }

    private Producto.EstadoProducto calcularEstado(Integer stock) {
        return stock != null && stock <= 10 ? Producto.EstadoProducto.STOCK_BAJO : Producto.EstadoProducto.ACTIVO;
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
