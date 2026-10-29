// "Base de datos" simulada de productos.
// Cada producto: { id, nombre, categoria, precio, precioOferta (opcional), stock, imagen, descripcion }
// Los cambios (crear, editar, eliminar) se guardan en localStorage,
// así no se pierden al recargar la página.

const CLAVE = 'pms_productos_v2'

const productosIniciales = [
  { id: 1, nombre: 'Torta Cuadrada de Chocolate', categoria: 'Tortas Cuadradas', precio: 45000, stock: 10, imagen: '/img/torta-chocolate.jpg', descripcion: 'Deliciosa torta de chocolate con capas de ganache y un toque de avellanas.' },
  { id: 2, nombre: 'Torta Cuadrada de Frutas', categoria: 'Tortas Cuadradas', precio: 50000, precioOferta: 42500, stock: 8, imagen: '/img/torta-frutas.jpg', descripcion: 'Mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla.' },
  { id: 3, nombre: 'Torta Circular de Vainilla', categoria: 'Tortas Circulares', precio: 40000, stock: 6, imagen: '/img/torta-vainilla.jpg', descripcion: 'Bizcocho de vainilla clásico relleno con crema pastelera y glaseado dulce.' },
  { id: 4, nombre: 'Torta Circular de Manjar', categoria: 'Tortas Circulares', precio: 42000, precioOferta: 37800, stock: 12, imagen: '/img/torta-manjar.jpg', descripcion: 'Torta tradicional chilena con manjar y nueces, un deleite clásico.' },
  { id: 5, nombre: 'Mousse de Chocolate', categoria: 'Postres Individuales', precio: 5000, stock: 30, imagen: '/img/mousse-chocolate.jpg', descripcion: 'Postre individual cremoso y suave, hecho con chocolate de alta calidad.' },
  { id: 6, nombre: 'Tiramisú Clásico', categoria: 'Postres Individuales', precio: 5500, stock: 25, imagen: '/img/tiramisu.jpg', descripcion: 'Postre italiano individual con capas de café, mascarpone y cacao.' },
  { id: 7, nombre: 'Torta Sin Azúcar de Naranja', categoria: 'Sin Azúcar', precio: 48000, stock: 4, imagen: '/img/torta-naranja.jpg', descripcion: 'Torta ligera y deliciosa, endulzada naturalmente.' },
  { id: 8, nombre: 'Cheesecake Sin Azúcar', categoria: 'Sin Azúcar', precio: 47000, stock: 0, imagen: '/img/cheesecake.jpg', descripcion: 'Suave y cremoso, una opción perfecta para disfrutar sin culpa.' },
  { id: 9, nombre: 'Empanada de Manzana', categoria: 'Pastelería Tradicional', precio: 3000, precioOferta: 2400, stock: 40, imagen: '/img/empanada-manzana.jpg', descripcion: 'Pastelería tradicional rellena de manzanas especiadas.' },
  { id: 10, nombre: 'Tarta de Santiago', categoria: 'Pastelería Tradicional', precio: 6000, stock: 15, imagen: '/img/tarta-santiago.jpg', descripcion: 'Tradicional tarta española hecha con almendras, azúcar y huevos.' },
  { id: 11, nombre: 'Brownie Sin Gluten', categoria: 'Sin Gluten', precio: 4000, stock: 20, imagen: '/img/brownie.jpg', descripcion: 'Rico y denso, perfecto para quienes evitan el gluten sin sacrificar sabor.' },
  { id: 12, nombre: 'Pan Sin Gluten', categoria: 'Sin Gluten', precio: 3500, precioOferta: 2800, stock: 18, imagen: '/img/pan-sin-gluten.jpg', descripcion: 'Suave y esponjoso, ideal para sándwiches o para acompañar cualquier comida.' },
  { id: 13, nombre: 'Torta Vegana de Chocolate', categoria: 'Veganos', precio: 50000, stock: 5, imagen: '/img/torta-vegana.jpg', descripcion: 'Torta de chocolate húmeda y deliciosa, hecha sin productos de origen animal.' },
  { id: 14, nombre: 'Galletas Veganas de Avena', categoria: 'Veganos', precio: 4500, precioOferta: 3600, stock: 35, imagen: '/img/galletas-avena.jpg', descripcion: 'Crujientes y sabrosas, excelente opción para un snack saludable y vegano.' },
  { id: 15, nombre: 'Torta Especial de Cumpleaños', categoria: 'Tortas Especiales', precio: 55000, stock: 7, imagen: '/img/torta-cumpleanos.jpg', descripcion: 'Diseñada especialmente para celebraciones, personalizable con mensajes únicos.' },
  { id: 16, nombre: 'Torta Especial de Boda', categoria: 'Tortas Especiales', precio: 60000, stock: 3, imagen: '/img/torta-boda.jpg', descripcion: 'Elegante y deliciosa, diseñada para ser el centro de atención en cualquier boda.' },
]

function leer() {
  const guardado = localStorage.getItem(CLAVE)
  return guardado ? JSON.parse(guardado) : productosIniciales
}

function guardar(lista) {
  localStorage.setItem(CLAVE, JSON.stringify(lista))
}

// ---------- CRUD ----------

// Leer
export function listarProductos() {
  return leer()
}

export function obtenerProducto(id) {
  return leer().find((p) => p.id === Number(id))
}

// Crear: el id nuevo es el mayor + 1
export function crearProducto(datos) {
  const lista = leer()
  const nuevo = { ...datos, id: Math.max(0, ...lista.map((p) => p.id)) + 1 }
  guardar([...lista, nuevo])
  return nuevo
}

// Actualizar
export function actualizarProducto(id, cambios) {
  const lista = leer().map((p) => (p.id === Number(id) ? { ...p, ...cambios, id: p.id } : p))
  guardar(lista)
  return lista.find((p) => p.id === Number(id))
}

// Eliminar
export function eliminarProducto(id) {
  guardar(leer().filter((p) => p.id !== Number(id)))
}

// Vuelve a los productos originales (útil en el admin y en las pruebas)
export function reiniciarProductos() {
  localStorage.removeItem(CLAVE)
}

export function listarCategorias() {
  return [...new Set(leer().map((p) => p.categoria))]
}

// Productos que tienen un precio de oferta válido (menor al precio normal)
export function listarOfertas() {
  return leer().filter((p) => p.precioOferta > 0 && p.precioOferta < p.precio)
}

// Stock igual o menor a este número se considera "crítico" y se avisa en el panel de admin
export const STOCK_CRITICO = 5

// Productos con stock crítico, del más urgente (menos stock) al menos urgente
export function listarProductosCriticos(umbral = STOCK_CRITICO) {
  return leer()
    .filter((p) => p.stock <= umbral)
    .sort((a, b) => a.stock - b.stock)
}
