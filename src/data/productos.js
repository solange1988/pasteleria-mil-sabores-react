// Productos y categorías: ahora vienen del backend (MySQL) a través de la API REST.
// Antes este archivo guardaba los datos en localStorage; las funciones conservan sus nombres,
// pero ahora son asíncronas (devuelven una promesa).
import { api } from '../api/cliente.js'

// Stock igual o menor a este número se considera crítico (el mismo umbral que usa el backend)
export const STOCK_CRITICO = 5

// ---------- Lectura (pública) ----------
export const listarProductos = () => api('/productos')
export const obtenerProducto = (id) => api(`/productos/${id}`)
export const listarOfertas = () => api('/productos/ofertas')
export const listarCategorias = async () => (await api('/categorias')).map((c) => c.nombre)

// ---------- Solo Administrador y Vendedor ----------
export const listarProductosCriticos = () => api('/productos/criticos')

// ---------- Solo Administrador ----------
export const crearProducto = (datos) => api('/productos', { metodo: 'POST', cuerpo: datos })
export const actualizarProducto = (id, datos) => api(`/productos/${id}`, { metodo: 'PUT', cuerpo: datos })
export const eliminarProducto = (id) => api(`/productos/${id}`, { metodo: 'DELETE' })

// Categorías que tienen productos, en el orden en que aparecen
export function categoriasDe(productos) {
  return [...new Set(productos.map((p) => p.categoria))]
}
