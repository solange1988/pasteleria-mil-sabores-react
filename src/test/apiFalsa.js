// Backend falso para las pruebas: reemplaza el "adaptador" de axios (la pieza que realmente
// envía la petición por la red) por una función que responde como el backend.
// Así las pruebas no necesitan Spring Boot ni MySQL, pero recorren el código real
// (componente -> data/*.js -> api/cliente.js -> axios con sus interceptores -> adaptador).
//
// Uso:
//   const llamadas = simularApi({
//     'GET /productos': PRODUCTOS,                                  // responde 200 con ese JSON
//     'POST /boletas': ({ cuerpo }) => responder(201, {...}),      // función: decide la respuesta
//     'DELETE /productos/5': responder(204),
//   })
//   ...
//   expect(llamadas[0]).toEqual(jasmine.objectContaining({ metodo: 'GET', ruta: '/productos' }))
import { AxiosError } from 'axios'
import { clienteHttp } from '../api/cliente.js'
import { guardarSesion } from '../auth/sesion.js'

const MARCA = Symbol('respuesta')
const ADAPTADOR_REAL = clienteHttp.defaults.adapter

export const responder = (estado, cuerpo = null) => ({ [MARCA]: true, estado, cuerpo })
export const errorApi = (estado, mensaje) => responder(estado, { error: mensaje })

// Cambia el adaptador de axios solo durante la prueba actual (después se restaura el real)
function usarAdaptador(adaptador) {
  const espia = jasmine.createSpy('adaptadorAxios').and.callFake(adaptador)
  clienteHttp.defaults.adapter = espia
  return espia
}
afterEach(() => { clienteHttp.defaults.adapter = ADAPTADOR_REAL })

export function simularApi(rutas = {}) {
  const llamadas = []
  usarAdaptador(async (config) => {
    const llamada = {
      metodo: config.method.toUpperCase(),
      ruta: config.url,
      cuerpo: config.data ? JSON.parse(config.data) : undefined,
      autorizacion: config.headers.get('Authorization') ?? undefined,
      tipoContenido: config.headers.get('Content-Type') ?? undefined,
    }
    llamadas.push(llamada)
    let r = rutas[`${llamada.metodo} ${llamada.ruta}`]
    if (typeof r === 'function') r = await r(llamada)
    if (r === undefined) r = errorApi(404, `Ruta no simulada: ${llamada.metodo} ${llamada.ruta}`)
    if (!r?.[MARCA]) r = responder(200, r)
    const respuesta = {
      data: r.estado === 204 ? '' : JSON.stringify(r.cuerpo),
      status: r.estado,
      statusText: '',
      headers: { 'content-type': 'application/json' },
      config,
      request: {},
    }
    // Igual que el adaptador real: los códigos 4xx/5xx terminan en error
    if (config.validateStatus(r.estado)) return respuesta
    throw new AxiosError(`Request failed with status code ${r.estado}`, AxiosError.ERR_BAD_REQUEST, config, {}, respuesta)
  })
  return llamadas
}

// Simula que el backend está apagado (error de red: no hay respuesta)
export function simularSinConexion() {
  usarAdaptador(async (config) => {
    throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {})
  })
}

// ---------- Datos de prueba ----------

export const ADMIN = { id: 1, nombre: 'Administrador Pastelería', correo: 'admin@duoc.cl', rol: 'Administrador', fechaNacimiento: '', codigo: '', telefono: '', region: '', comuna: '' }
export const VENDEDOR = { id: 2, nombre: 'Vendedor Pastelería', correo: 'vendedor@duoc.cl', rol: 'Vendedor', fechaNacimiento: '', codigo: '', telefono: '', region: '', comuna: '' }
export const CLIENTE = { id: 3, nombre: 'Ana Pérez', correo: 'ana@duoc.cl', rol: 'Cliente', fechaNacimiento: '', codigo: '', telefono: '', region: '', comuna: '' }

// Deja una sesión guardada como si el usuario ya hubiera iniciado sesión
export function conSesion(usuario) {
  return guardarSesion({ token: 'token-acceso', tokenRenovacion: 'token-renovacion', usuario })
}

// Respuesta del login
export const respuestaLogin = (usuario) => ({ token: 'token-acceso', tokenRenovacion: 'token-renovacion', usuario })

const CATEGORIAS = ['Tortas Cuadradas', 'Tortas Circulares', 'Postres Individuales', 'Sin Azúcar',
  'Pastelería Tradicional', 'Sin Gluten', 'Veganos', 'Tortas Especiales']

// Los mismos 16 productos que carga el backend (DatosIniciales.java)
const BASE = [
  [1, 'Torta Cuadrada de Chocolate', 0, 45000, null, 10, '/img/torta-chocolate.jpg'],
  [2, 'Torta Cuadrada de Frutas', 0, 50000, 42500, 8, '/img/torta-frutas.jpg'],
  [3, 'Torta Circular de Vainilla', 1, 40000, null, 6, '/img/torta-vainilla.jpg'],
  [4, 'Torta Circular de Manjar', 1, 42000, 37800, 12, '/img/torta-manjar.jpg'],
  [5, 'Mousse de Chocolate', 2, 5000, null, 30, '/img/mousse-chocolate.jpg'],
  [6, 'Tiramisú Clásico', 2, 5500, null, 25, '/img/tiramisu.jpg'],
  [7, 'Torta Sin Azúcar de Naranja', 3, 48000, null, 4, '/img/torta-naranja.jpg'],
  [8, 'Cheesecake Sin Azúcar', 3, 47000, null, 0, '/img/cheesecake.jpg'],
  [9, 'Empanada de Manzana', 4, 3000, 2400, 40, '/img/empanada-manzana.jpg'],
  [10, 'Tarta de Santiago', 4, 6000, null, 15, '/img/tarta-santiago.jpg'],
  [11, 'Brownie Sin Gluten', 5, 4000, null, 20, '/img/brownie.jpg'],
  [12, 'Pan Sin Gluten', 5, 3500, 2800, 18, '/img/pan-sin-gluten.jpg'],
  [13, 'Torta Vegana de Chocolate', 6, 50000, null, 5, '/img/torta-vegana.jpg'],
  [14, 'Galletas Veganas de Avena', 6, 4500, 3600, 35, '/img/galletas-avena.jpg'],
  [15, 'Torta Especial de Cumpleaños', 7, 55000, null, 7, '/img/torta-cumpleanos.jpg'],
  [16, 'Torta Especial de Boda', 7, 60000, null, 3, '/img/torta-boda.jpg'],
]

// Devuelve una copia nueva cada vez (así una prueba no afecta a otra)
export function productosPrueba() {
  return BASE.map(([id, nombre, cat, precio, precioOferta, stock, imagen]) => ({
    id, nombre, categoria: CATEGORIAS[cat], categoriaId: cat + 1, precio, precioOferta, stock, imagen,
    descripcion: `Descripción de ${nombre}`,
  }))
}

export const ofertasDe = (productos) => productos.filter((p) => p.precioOferta > 0 && p.precioOferta < p.precio)

// Una boleta como la que devuelve el backend
export function boletaPrueba(cambios = {}) {
  return {
    numero: 1001,
    fecha: '2026-11-12T10:30:00',
    correo: 'ana@duoc.cl',
    cliente: 'Ana Pérez',
    direccion: 'Av. Siempre Viva 742, Chillán, Región de Ñuble',
    lineas: [{ id: 5, nombre: 'Mousse de Chocolate', precio: 5000, cantidad: 2, subtotal: 10000 }],
    subtotal: 10000,
    porcentaje: 0,
    descuento: 0,
    motivo: '',
    total: 10000,
    regalo: '',
    estado: 'Pagada',
    faltantes: [],
    ...cambios,
  }
}
