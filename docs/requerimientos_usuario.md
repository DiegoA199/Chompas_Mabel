# Requerimientos de Usuario - Chompas Mabel

## Perfiles del sistema

### Administrador

Responsable de controlar la operacion completa del negocio.

Requerimientos:

- Iniciar sesion con rol `ADMIN`.
- Ver un dashboard administrativo con ventas, pedidos, productos, stock bajo y saldos a credito.
- Registrar, editar y eliminar productos.
- Consultar inventario y alertas de stock bajo.
- Registrar clientes, pedidos, ventas y pedidos a credito.
- Consultar cuentas por cobrar y marcar creditos como pagados.
- Revisar reportes de ventas, inventario, stock bajo y creditos vencidos.
- Recibir notificaciones de stock bajo, pedidos pendientes y creditos vencidos.

Flujo principal:

1. Ingresa al sistema como administrador.
2. Revisa el dashboard y la campana de notificaciones.
3. Actualiza productos o inventario si hay stock bajo.
4. Supervisa pedidos, ventas y creditos.
5. Revisa reportes para tomar decisiones.

### Vendedor

Responsable de atender clientes y registrar ventas diarias.

Requerimientos:

- Iniciar sesion con rol `VENDEDOR`.
- Ver un dashboard operativo enfocado en pedidos, ventas y creditos.
- Consultar productos, precios y stock disponible sin editar inventario.
- Registrar clientes.
- Registrar pedidos, ventas y pedidos a credito.
- Consultar creditos pendientes o vencidos.
- Marcar un credito como pagado cuando el cliente cancela su deuda.
- Recibir notificaciones de pedidos pendientes y creditos vencidos.

Flujo principal:

1. Ingresa al sistema como vendedor.
2. Consulta productos y stock disponible.
3. Registra o busca al cliente.
4. Crea el pedido como venta directa o venta a credito.
5. Si el cliente paga una deuda, marca el credito como pagado.

## Reglas de negocio principales

- Un usuario tiene un rol: `ADMIN` o `VENDEDOR`.
- Solo el administrador puede acceder a inventario y reportes generales.
- Solo el administrador puede crear, editar o eliminar productos.
- El vendedor puede consultar productos para vender, pero no modificar inventario.
- Si el metodo de pago es `Credito`, el sistema registra monto pagado, saldo pendiente, fecha de vencimiento y estado del credito.
- Un credito se muestra como vencido si tiene saldo pendiente y su fecha de vencimiento ya paso.
- La campana de notificaciones muestra alertas reales del sistema.

## Notificaciones

- Creditos vencidos: avisa cuando existen cuentas por cobrar fuera de fecha.
- Pedidos pendientes: avisa cuando hay pedidos que requieren confirmacion.
- Stock bajo: visible para el administrador cuando algun producto tiene stock bajo.

## Script de base de datos

El script completo se encuentra en `database/schema.sql`. Crea la base `chompas_mabel_db`, tablas, relaciones, restricciones y datos iniciales para usuarios, productos, clientes, pedidos, ventas, inventario y creditos.

Para replicar el proyecto en otra computadora no es obligatorio usar Docker. Se puede instalar MySQL local, abrir `database/schema.sql` en MySQL Workbench o importarlo con:

```bash
mysql -u root -p < database/schema.sql
```

Docker Compose queda como alternativa automatizada para levantar MySQL y cargar el mismo script.
