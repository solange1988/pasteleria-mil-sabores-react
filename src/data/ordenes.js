// Órdenes de compra (boletas): ahora las crea y guarda el backend.
// El backend calcula los precios, el descuento y valida el stock: el navegador solo envía
// qué productos y cuántas unidades se compran.
import { api } from '../api/cliente.js'

export const ESTADOS = ['Pagada', 'En preparación', 'Enviada', 'Entregada', 'Pago rechazado']
export const RECHAZADA = 'Pago rechazado'

// Público: un visitante también puede comprar. Si hay sesión, el token se envía solo
// y el backend aplica el descuento del usuario.
// datos: { correo, cliente, direccion, carrito }
export const crearOrden = ({ correo, cliente, direccion, carrito }) =>
  api('/boletas', {
    metodo: 'POST',
    cuerpo: { correo, cliente, direccion, lineas: carrito.map(({ id, cantidad }) => ({ productoId: id, cantidad })) },
  })

// Con sesión: mis compras
export const listarMisOrdenes = () => api('/boletas/mias')

// Administrador y Vendedor
export const listarOrdenes = () => api('/boletas')
export const obtenerOrden = (numero) => api(`/boletas/${numero}`)

// Solo Administrador
export const cambiarEstadoOrden = (numero, estado) =>
  api(`/boletas/${numero}/estado`, { metodo: 'PATCH', cuerpo: { estado } })
export const eliminarOrden = (numero) => api(`/boletas/${numero}`, { metodo: 'DELETE' })
