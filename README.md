# DassyData

Aplicación web de Farmacia Dassy para explorar productos y administrar inventario y analíticas con Supabase.

## Inicio local

1. Instala dependencias con `npm install`.
2. Crea `.env.local` a partir de `.env.example` y agrega la URL y la clave publicable (anon) de tu proyecto Supabase.
3. Ejecuta `npm run dev`.

No uses la `service_role` key en el navegador. La app muestra el catálogo sin conectar si faltan las variables, pero las consultas y la autenticación requieren credenciales válidas.

## Entidades Supabase

La app usa UUID como clave primaria y estos nombres de tabla/columna:

- `perfiles`: `id_usuario` (FK a `auth.users.id`), `nombre_completo`, `correo`, `rol` (`propietario` o `cliente`).
- `proveedores`: `id`, `nombre`, `contacto`, `telefono`, `direccion`.
- `categorias` y `marcas`: `id`, `nombre`.
- `productos`: `id`, `codigo_barra`, `nombre_comercial`, `nombre_generico`, `concentracion`, `presentacion`, `descripcion`, `categoria_id`, `marca_id`, `precio_venta_sugerido`, `stock_minimo`, `es_controlado`, `imagen_url`.
- `inventario`: `id`, `producto_id`, `cantidad_disponible`, `costo_unitario_promedio`, `fecha_vencimiento`, `ubicacion_estante`.
- `ventas`: `id`, `fecha_venta`, `usuario_id`, `total_venta`, `metodo_pago`, `observaciones`.
- `detalle_ventas`: `id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`.
- `compras`: `id`, `proveedor_id`, `fecha_compra`, `total_compra`, `numero_factura_proveedor`, `estado`.
- `detalle_compras`: `id`, `compra_id`, `producto_id`, `cantidad_comprada`, `costo_unitario`, `fecha_vencimiento_lote`.

Configura RLS para permitir lectura pública/autenticada del catálogo según el flujo deseado, escritura administrativa solo a propietarios y lectura del perfil propio con `id_usuario = auth.uid()`. Asigna el rol `propietario` desde una operación administrativa confiable, nunca desde el formulario de registro. No se guarda `service_role` en el navegador.

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm run build`: compilación de producción.
- `npm run lint`: lint de todo el proyecto existente.