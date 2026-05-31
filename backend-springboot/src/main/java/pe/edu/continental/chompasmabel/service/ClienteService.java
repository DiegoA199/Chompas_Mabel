package pe.edu.continental.chompasmabel.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.continental.chompasmabel.dto.ClienteRequest;
import pe.edu.continental.chompasmabel.dto.ClienteResponse;
import pe.edu.continental.chompasmabel.model.Cliente;
import pe.edu.continental.chompasmabel.repository.ClienteRepository;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar() {
        return clienteRepository.findAll(Sort.by("nombres")).stream()
                .map(ClienteResponse::from)
                .toList();
    }

    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        Cliente cliente = Cliente.builder()
                .nombres(request.nombres().trim())
                .apellidos(limpiar(request.apellidos()))
                .telefono(limpiar(request.telefono()))
                .direccion(limpiar(request.direccion()))
                .correo(request.correo().trim().toLowerCase())
                .build();
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
