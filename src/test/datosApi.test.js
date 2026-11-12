import * as productos from '../data/productos.js'
import * as usuarios from '../data/usuarios.js'
import * as ordenes from '../data/ordenes.js'
import { precioVigente, agregarAlCarrito } from '../utils/carrito.js'
import { simularApi, responder, productosPrueba, ofertasDe, respuestaLogin, CLIENTE, ADMIN, conSesion } from './apiFalsa.js'

// Cada función de data/*.js debe llamar al endpoint correcto, con el método HTTP correcto
const ruta = (llamadas, i = 0) => `${llamadas[i].metodo} ${llamadas[i].ruta}`

describe('data/productos.js -> /api/v1/productos', () => {
  it('LEER: listar, obtener, ofertas, críticos y categorías', async () => {
    const lista = productosPrueba()
    const llamadas = simularApi({
      'GET /productos': lista,
      'GET /productos/4': lista[3],
      'GET /productos/ofertas': ofertasDe(lista),
      'GET /productos/criticos': [],
      'GET /categorias': [{ id: 1, nombre: 'Tortas Cuadradas' }, { id: 2, nombre: 'Veganos' }],
    })
    expect(await productos.listarProductos()).toHaveSize(16)
    expect((await productos.obtenerProducto(4)).nombre).toBe('Torta Circular de Manjar')
    expect(await productos.listarOfertas()).toHaveSize(5)
    expect(await productos.listarProductosCriticos()).toEqual([])
    expect(await productos.listarCategorias()).toEqual(['Tortas Cuadradas', 'Veganos'])
    expect(llamadas.map((_, i) => ruta(llamadas, i))).toEqual([
      'GET /productos', 'GET /productos/4', 'GET /productos/ofertas', 'GET /productos/criticos', 'GET /categorias',
    ])
  })

  it('CREAR, ACTUALIZAR y ELIMINAR usan POST, PUT y DELETE', async () => {
    const datos = { nombre: 'Kuchen de Nuez', categoria: 'Pastelería Tradicional', precio: 8000, stock: 5 }
    const llamadas = simularApi({
      'POST /productos': responder(201, { id: 17, ...datos }),
      'PUT /productos/17': { id: 17, ...datos, precio: 9000 },
      'DELETE /productos/17': responder(204),
    })
    expect((await productos.crearProducto(datos)).id).toBe(17)
    expect((await productos.actualizarProducto(17, { ...datos, precio: 9000 })).precio).toBe(9000)
    expect(await productos.eliminarProducto(17)).toBeNull()
    expect([ruta(llamadas, 0), ruta(llamadas, 1), ruta(llamadas, 2)]).toEqual(['POST /productos', 'PUT /productos/17', 'DELETE /productos/17'])
    expect(llamadas[0].cuerpo).toEqual(datos)
  })

  it('categoriasDe devuelve las categorías sin repetir', () => {
    expect(productos.categoriasDe(productosPrueba())).toHaveSize(8)
  })
})

describe('data/usuarios.js -> /api/v1/auth y /api/v1/usuarios', () => {
  it('iniciarSesion envía correo y contraseña a POST /auth/login sin token', async () => {
    conSesion(CLIENTE) // aunque hubiera una sesión anterior
    const llamadas = simularApi({ 'POST /auth/login': respuestaLogin(ADMIN) })
    const r = await usuarios.iniciarSesion(' admin@duoc.cl ', 'admin123')
    expect(r.token).toBe('token-acceso')
    expect(r.usuario.rol).toBe('Administrador')
    expect(llamadas[0].cuerpo).toEqual({ correo: 'admin@duoc.cl', contrasena: 'admin123' })
    expect(llamadas[0].autorizacion).toBeUndefined()
  })

  it('registrarUsuario usa POST /auth/registro', async () => {
    const llamadas = simularApi({ 'POST /auth/registro': responder(201, respuestaLogin(CLIENTE)) })
    await usuarios.registrarUsuario({ nombre: 'Ana Pérez', correo: 'ana@duoc.cl', contrasena: 'clave123' })
    expect(ruta(llamadas)).toBe('POST /auth/registro')
  })

  it('perfil propio: GET y PUT /usuarios/perfil', async () => {
    conSesion(CLIENTE)
    const llamadas = simularApi({ 'GET /usuarios/perfil': CLIENTE, 'PUT /usuarios/perfil': { ...CLIENTE, nombre: 'Ana Gómez' } })
    await usuarios.obtenerPerfil()
    expect((await usuarios.actualizarPerfil({ nombre: 'Ana Gómez' })).nombre).toBe('Ana Gómez')
    expect([ruta(llamadas, 0), ruta(llamadas, 1)]).toEqual(['GET /usuarios/perfil', 'PUT /usuarios/perfil'])
  })

  it('administración: actualizar envía todos los datos con la contraseña vacía (no cambiarla)', async () => {
    conSesion(ADMIN)
    const llamadas = simularApi({ 'PUT /usuarios/3': { ...CLIENTE, rol: 'Vendedor' }, 'DELETE /usuarios/3': responder(204) })
    await usuarios.actualizarUsuario(CLIENTE, { rol: 'Vendedor' })
    await usuarios.eliminarUsuario(3)
    expect(llamadas[0].cuerpo).toEqual(jasmine.objectContaining({ correo: 'ana@duoc.cl', rol: 'Vendedor', contrasena: '' }))
    expect(ruta(llamadas, 1)).toBe('DELETE /usuarios/3')
  })

  it('hay tres roles: Administrador, Vendedor y Cliente', () => {
    expect(usuarios.ROLES).toEqual(['Administrador', 'Vendedor', 'Cliente'])
  })
})

describe('data/ordenes.js -> /api/v1/boletas', () => {
  it('crearOrden envía solo id y cantidad de cada producto (el precio lo pone el backend)', async () => {
    const llamadas = simularApi({ 'POST /boletas': responder(201, { numero: 1001, estado: 'Pagada' }) })
    const carrito = [{ id: 5, nombre: 'Mousse', precio: 1, imagen: 'x.jpg', cantidad: 2 }]
    await ordenes.crearOrden({ correo: 'ana@duoc.cl', cliente: 'Ana Pérez', direccion: 'Calle 1', carrito })
    expect(llamadas[0].cuerpo).toEqual({
      correo: 'ana@duoc.cl', cliente: 'Ana Pérez', direccion: 'Calle 1', lineas: [{ productoId: 5, cantidad: 2 }],
    })
  })

  it('listar, mis compras, detalle, cambiar estado (PATCH) y eliminar', async () => {
    const llamadas = simularApi({
      'GET /boletas': [], 'GET /boletas/mias': [], 'GET /boletas/1001': { numero: 1001 },
      'PATCH /boletas/1001/estado': { numero: 1001, estado: 'Enviada' }, 'DELETE /boletas/1001': responder(204),
    })
    await ordenes.listarOrdenes()
    await ordenes.listarMisOrdenes()
    await ordenes.obtenerOrden(1001)
    expect((await ordenes.cambiarEstadoOrden(1001, 'Enviada')).estado).toBe('Enviada')
    await ordenes.eliminarOrden(1001)
    expect(llamadas.map((_, i) => ruta(llamadas, i))).toEqual([
      'GET /boletas', 'GET /boletas/mias', 'GET /boletas/1001', 'PATCH /boletas/1001/estado', 'DELETE /boletas/1001',
    ])
    expect(llamadas[3].cuerpo).toEqual({ estado: 'Enviada' })
  })

  it('existen los estados del flujo de una compra', () => {
    expect(ordenes.ESTADOS).toContain('Pagada')
    expect(ordenes.ESTADOS).toContain(ordenes.RECHAZADA)
  })
})

describe('precio de oferta en el carrito', () => {
  it('precioVigente cobra la oferta si existe y el precio normal si no', () => {
    expect(precioVigente({ precio: 1000, precioOferta: 800 })).toBe(800)
    expect(precioVigente({ precio: 1000, precioOferta: 0 })).toBe(1000)
    expect(precioVigente({ precio: 1000, precioOferta: null })).toBe(1000)
    expect(precioVigente({ precio: 1000, precioOferta: 1500 })).toBe(1000)
  })

  it('al agregar al carrito un producto en oferta se guarda el precio de la oferta', () => {
    const enOferta = ofertasDe(productosPrueba())[0]
    expect(agregarAlCarrito([], enOferta)[0].precio).toBe(enOferta.precioOferta)
  })
})
