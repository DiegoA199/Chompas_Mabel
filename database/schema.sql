CREATE DATABASE IF NOT EXISTS chompas_mabel_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chompas_mabel_db;

DROP PROCEDURE IF EXISTS sp_listar_productos;
DROP PROCEDURE IF EXISTS sp_listar_clientes;
DROP PROCEDURE IF EXISTS sp_listar_pedidos;
DROP PROCEDURE IF EXISTS sp_listar_detalles_pedido;
DROP PROCEDURE IF EXISTS sp_listar_ventas;
DROP PROCEDURE IF EXISTS sp_listar_movimientos_inventario;
DROP PROCEDURE IF EXISTS sp_resumen_reportes;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS inventario_movimientos;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(30) NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120),
  telefono VARCHAR(30),
  direccion VARCHAR(180),
  correo VARCHAR(150) NOT NULL,
  CHECK (CHAR_LENGTH(nombres) >= 3)
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  CHECK (CHAR_LENGTH(nombre) >= 3)
) ENGINE=InnoDB;

CREATE TABLE productos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(140) NOT NULL,
  descripcion VARCHAR(255),
  id_categoria BIGINT NOT NULL,
  talla VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
  CONSTRAINT fk_producto_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias(id),
  CHECK (CHAR_LENGTH(nombre) >= 3),
  CHECK (precio >= 0),
  CHECK (stock >= 0)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(40) NOT NULL UNIQUE,
  id_cliente BIGINT NOT NULL,
  id_usuario BIGINT NOT NULL,
  fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega DATE,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  metodo_pago VARCHAR(50),
  monto_pagado DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_vencimiento_credito DATE,
  estado_credito VARCHAR(30) NOT NULL DEFAULT 'SIN_CREDITO',
  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  CONSTRAINT fk_pedido_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  CHECK (total >= 0),
  CHECK (monto_pagado >= 0),
  CHECK (saldo_pendiente >= 0)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_pedido BIGINT NOT NULL,
  id_producto BIGINT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
  CONSTRAINT fk_detalle_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id),
  CHECK (cantidad > 0),
  CHECK (precio_unitario >= 0),
  CHECK (subtotal >= 0)
) ENGINE=InnoDB;

CREATE TABLE ventas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_pedido BIGINT NOT NULL UNIQUE,
  fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto_total DECIMAL(10,2) NOT NULL,
  tipo_comprobante VARCHAR(50),
  CONSTRAINT fk_venta_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id),
  CHECK (monto_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE inventario_movimientos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  id_producto BIGINT NOT NULL,
  tipo_movimiento VARCHAR(30) NOT NULL,
  cantidad INT NOT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacion VARCHAR(255),
  CONSTRAINT fk_movimiento_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id),
  CHECK (cantidad > 0)
) ENGINE=InnoDB;

INSERT INTO usuarios (id, nombre, correo, password, rol, estado) VALUES
  (1, 'Maria Gonzalez', 'admin@chompasmabel.com', 'admin123', 'ADMIN', TRUE),
  (2, 'Carlos Vendedor', 'vendedor@chompasmabel.com', 'venta123', 'VENDEDOR', TRUE);

INSERT INTO clientes (id, nombres, apellidos, telefono, direccion, correo) VALUES
  (1, 'Rosa', 'Fernandez', '987654321', 'Huancayo', 'rosa@mail.com'),
  (2, 'Juan Carlos', 'Lima', '976543210', 'El Tambo', 'juan@mail.com'),
  (3, 'Tiendas Andina', 'SAC', '964123456', 'Huancayo Centro', 'ventas@andina.com'),
  (4, 'Marisol', 'Huaman', '955222111', 'Chilca', 'marisol@mail.com');

INSERT INTO categorias (id, nombre, descripcion) VALUES
  (1, 'Clasicas', 'Chompas tradicionales para adultos'),
  (2, 'Juveniles', 'Modelos juveniles de temporada'),
  (3, 'Cardigans', 'Cardigans de lana y alpaca'),
  (4, 'Alpaca', 'Prendas premium con fibra de alpaca'),
  (5, 'Corporativas', 'Pedidos por lote para empresas');

INSERT INTO productos (id, codigo, nombre, descripcion, id_categoria, talla, color, precio, stock, estado) VALUES
  (1, 'CHP-001', 'Chompa de Alpaca Clasica', 'Fibra de alpaca, acabado artesanal', 4, 'S-M-L-XL', 'Beige', 245.00, 8, 'STOCK_BAJO'),
  (2, 'CHP-002', 'Chompa Juvenil Rayada', 'Algodon premium para temporada escolar', 2, '12-14-16', 'Azul', 98.00, 116, 'ACTIVO'),
  (3, 'CHP-003', 'Chompa Cuello Redondo', 'Modelo diario para clima frio', 1, 'S-M-L-XL', 'Azul Marino', 125.00, 80, 'ACTIVO'),
  (4, 'CHP-004', 'Cardigan de Lana', 'Lana merino con botones reforzados', 3, 'S-M-L-XL', 'Vino', 420.00, 22, 'ACTIVO'),
  (5, 'CHP-005', 'Chompa Corporativa Bordada', 'Produccion por lote con logo bordado', 5, 'S-M-L-XL', 'Gris', 180.00, 12, 'ACTIVO'),
  (6, 'CHP-006', 'Chompa Infantil Termica', 'Tejido termico para ninos', 2, '8-10-12', 'Rojo', 89.00, 4, 'STOCK_BAJO');

INSERT INTO pedidos (id, numero, id_cliente, id_usuario, fecha_pedido, fecha_entrega, total, estado, metodo_pago, monto_pagado, saldo_pendiente, fecha_vencimiento_credito, estado_credito) VALUES
  (1, 'PED-2026-0001', 1, 2, '2026-05-28 10:15:00', '2026-05-30', 588.00, 'ENTREGADO', 'Yape', 588.00, 0.00, NULL, 'SIN_CREDITO'),
  (2, 'PED-2026-0002', 3, 2, '2026-05-29 09:45:00', '2026-06-02', 1275.00, 'ENTREGADO', 'Transferencia', 1275.00, 0.00, NULL, 'SIN_CREDITO'),
  (3, 'PED-2026-0003', 2, 1, '2026-05-29 18:30:00', '2026-06-01', 420.00, 'PENDIENTE', 'Efectivo', 0.00, 0.00, NULL, 'SIN_CREDITO'),
  (4, 'PED-2026-0004', 4, 2, '2026-06-04 11:20:00', '2026-06-07', 267.00, 'ENTREGADO', 'Credito', 50.00, 217.00, '2026-06-09', 'VENCIDO'),
  (5, 'PED-2026-0005', 1, 2, '2026-06-06 16:05:00', '2026-06-09', 250.00, 'ENTREGADO', 'Credito', 0.00, 250.00, '2026-06-18', 'PENDIENTE');

INSERT INTO detalle_pedido (id, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
  (1, 1, 1, 2, 245.00, 490.00),
  (2, 1, 2, 1, 98.00, 98.00),
  (3, 2, 5, 5, 180.00, 900.00),
  (4, 2, 3, 3, 125.00, 375.00),
  (5, 3, 4, 1, 420.00, 420.00),
  (6, 4, 6, 3, 89.00, 267.00),
  (7, 5, 3, 2, 125.00, 250.00);

INSERT INTO ventas (id, id_pedido, fecha_venta, monto_total, tipo_comprobante) VALUES
  (1, 1, '2026-05-28 10:20:00', 588.00, 'BOLETA'),
  (2, 2, '2026-05-29 09:55:00', 1275.00, 'FACTURA'),
  (3, 4, '2026-06-04 11:25:00', 267.00, 'BOLETA_CREDITO'),
  (4, 5, '2026-06-06 16:10:00', 250.00, 'BOLETA_CREDITO');

INSERT INTO inventario_movimientos (id, id_producto, tipo_movimiento, cantidad, fecha_movimiento, observacion) VALUES
  (1, 1, 'ENTRADA', 30, '2026-05-20 08:00:00', 'Stock inicial'),
  (2, 2, 'ENTRADA', 120, '2026-05-20 08:05:00', 'Stock inicial'),
  (3, 3, 'ENTRADA', 90, '2026-05-20 08:10:00', 'Stock inicial'),
  (4, 4, 'ENTRADA', 24, '2026-05-20 08:15:00', 'Stock inicial'),
  (5, 5, 'ENTRADA', 20, '2026-05-20 08:20:00', 'Stock inicial'),
  (6, 6, 'ENTRADA', 10, '2026-05-20 08:25:00', 'Stock inicial'),
  (7, 1, 'SALIDA', 2, '2026-05-28 10:15:00', 'Salida por pedido PED-2026-0001'),
  (8, 2, 'SALIDA', 1, '2026-05-28 10:15:00', 'Salida por pedido PED-2026-0001'),
  (9, 5, 'SALIDA', 5, '2026-05-29 09:45:00', 'Salida por pedido PED-2026-0002'),
  (10, 3, 'SALIDA', 3, '2026-05-29 09:45:00', 'Salida por pedido PED-2026-0002'),
  (11, 4, 'SALIDA', 1, '2026-05-29 18:30:00', 'Reserva por pedido PED-2026-0003'),
  (12, 6, 'SALIDA', 3, '2026-06-04 11:20:00', 'Salida por pedido a credito PED-2026-0004'),
  (13, 3, 'SALIDA', 2, '2026-06-06 16:05:00', 'Salida por pedido a credito PED-2026-0005');

DELIMITER //

CREATE PROCEDURE sp_listar_productos()
BEGIN
  SELECT
    p.id,
    p.codigo,
    p.nombre,
    p.descripcion,
    p.id_categoria AS categoria_id,
    c.nombre AS categoria,
    p.talla,
    p.color,
    p.precio,
    p.stock,
    p.estado
  FROM productos p
  INNER JOIN categorias c ON c.id = p.id_categoria
  ORDER BY p.nombre;
END //

CREATE PROCEDURE sp_listar_clientes()
BEGIN
  SELECT
    id,
    nombres,
    apellidos,
    telefono,
    direccion,
    correo,
    TRIM(CONCAT(nombres, ' ', COALESCE(apellidos, ''))) AS nombre_completo
  FROM clientes
  ORDER BY nombres;
END //

CREATE PROCEDURE sp_listar_pedidos()
BEGIN
  SELECT
    p.id,
    p.numero,
    p.id_cliente AS cliente_id,
    TRIM(CONCAT(c.nombres, ' ', COALESCE(c.apellidos, ''))) AS cliente,
    p.id_usuario AS usuario_id,
    u.nombre AS usuario,
    p.fecha_pedido,
    p.fecha_entrega,
    p.total,
    p.estado,
    p.metodo_pago,
    p.monto_pagado,
    p.saldo_pendiente,
    p.fecha_vencimiento_credito,
    CASE
      WHEN p.saldo_pendiente > 0
        AND p.fecha_vencimiento_credito IS NOT NULL
        AND p.fecha_vencimiento_credito < CURDATE()
      THEN 'VENCIDO'
      ELSE p.estado_credito
    END AS estado_credito,
    CASE
      WHEN p.saldo_pendiente > 0
        AND p.fecha_vencimiento_credito IS NOT NULL
        AND p.fecha_vencimiento_credito < CURDATE()
      THEN TRUE
      ELSE FALSE
    END AS credito_vencido,
    CASE
      WHEN p.saldo_pendiente > 0
        AND p.fecha_vencimiento_credito IS NOT NULL
        AND p.fecha_vencimiento_credito < CURDATE()
      THEN DATEDIFF(CURDATE(), p.fecha_vencimiento_credito)
      ELSE 0
    END AS dias_vencido,
    v.id AS venta_id
  FROM pedidos p
  INNER JOIN clientes c ON c.id = p.id_cliente
  INNER JOIN usuarios u ON u.id = p.id_usuario
  LEFT JOIN ventas v ON v.id_pedido = p.id
  ORDER BY p.fecha_pedido DESC;
END //

CREATE PROCEDURE sp_listar_detalles_pedido(IN p_pedido_id BIGINT)
BEGIN
  SELECT
    d.id,
    d.id_producto AS producto_id,
    pr.nombre AS producto,
    d.cantidad,
    d.precio_unitario,
    d.subtotal
  FROM detalle_pedido d
  INNER JOIN productos pr ON pr.id = d.id_producto
  WHERE d.id_pedido = p_pedido_id
  ORDER BY d.id;
END //

CREATE PROCEDURE sp_listar_ventas()
BEGIN
  SELECT
    v.id,
    p.id AS pedido_id,
    p.numero AS numero_pedido,
    c.id AS cliente_id,
    TRIM(CONCAT(c.nombres, ' ', COALESCE(c.apellidos, ''))) AS cliente,
    p.fecha_pedido,
    v.fecha_venta,
    v.monto_total,
    v.tipo_comprobante,
    p.metodo_pago,
    p.estado AS estado_pedido
  FROM ventas v
  INNER JOIN pedidos p ON p.id = v.id_pedido
  INNER JOIN clientes c ON c.id = p.id_cliente
  ORDER BY v.fecha_venta DESC;
END //

CREATE PROCEDURE sp_listar_movimientos_inventario(IN p_producto_id BIGINT)
BEGIN
  SELECT
    m.id,
    p.id AS producto_id,
    p.codigo AS codigo_producto,
    p.nombre AS producto,
    c.nombre AS categoria,
    m.tipo_movimiento,
    m.cantidad,
    m.fecha_movimiento,
    m.observacion
  FROM inventario_movimientos m
  INNER JOIN productos p ON p.id = m.id_producto
  INNER JOIN categorias c ON c.id = p.id_categoria
  WHERE p_producto_id IS NULL OR m.id_producto = p_producto_id
  ORDER BY m.fecha_movimiento DESC;
END //

CREATE PROCEDURE sp_resumen_reportes()
BEGIN
  SELECT
    (SELECT COALESCE(SUM(monto_total), 0) FROM ventas) AS total_ventas,
    (SELECT COALESCE(SUM(saldo_pendiente), 0) FROM pedidos WHERE estado_credito <> 'SIN_CREDITO') AS saldo_credito,
    (SELECT COUNT(*) FROM pedidos WHERE saldo_pendiente > 0 AND fecha_vencimiento_credito < CURDATE()) AS creditos_vencidos,
    (SELECT COALESCE(SUM(stock * precio), 0) FROM productos) AS valor_inventario,
    (SELECT COUNT(*) FROM productos WHERE stock <= 10) AS productos_stock_bajo;
END //

DELIMITER ;
