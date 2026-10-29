import {
  crearOrden, listarOrdenes, listarOrdenesDe, obtenerOrden,
  cambiarEstadoOrden, eliminarOrden, reiniciarOrdenes, ESTADOS,
} from '../data/ordenes.js'

const TOTALES = { subtotal: 10000, descuento: 1000, motivo: 'Código FELICES50', total: 9000, regalo: '' }
const datos = (correo = 'ana@duoc.cl') => ({
  correo,
  cliente: 'Ana Pérez',
  direccion: 'Calle 1, Santiago, RM',
  lineas: [{ id: 5, nombre: 'Mousse', precio: 5000, cantidad: 2, imagen: 'x.jpg' }],
  totales: TOTALES,
})

describe('órdenes: CRUD (localStorage)', () => {
  it('al inicio no hay órdenes', () => {
    expect(listarOrdenes()).toEqual([])
  })

  it('CREAR: la primera orden es la #1001 y las siguientes suben de a uno', () => {
    expect(crearOrden(datos()).numero).toBe(1001)
    expect(crearOrden(datos()).numero).toBe(1002)
    expect(listarOrdenes().length).toBe(2)
  })

  it('guarda montos, líneas (sin la imagen) y estado "Pagada" por defecto', () => {
    const o = crearOrden(datos())
    expect(o.estado).toBe('Pagada')
    expect(o.total).toBe(9000)
    expect(o.descuento).toBe(1000)
    expect(o.lineas[0]).toEqual({ id: 5, nombre: 'Mousse', precio: 5000, cantidad: 2 })
  })

  it('LEER: obtenerOrden y listarOrdenesDe filtran correctamente', () => {
    crearOrden(datos('ana@duoc.cl'))
    crearOrden(datos('luis@gmail.com'))
    expect(obtenerOrden(1001).correo).toBe('ana@duoc.cl')
    expect(obtenerOrden('1002').correo).toBe('luis@gmail.com') // acepta número como texto
    expect(obtenerOrden(9999)).toBeUndefined()
    expect(listarOrdenesDe('ANA@duoc.cl').length).toBe(1)
  })

  it('ACTUALIZAR: cambia el estado de una orden', () => {
    crearOrden(datos())
    expect(cambiarEstadoOrden(1001, 'Enviada').estado).toBe('Enviada')
    expect(obtenerOrden(1001).estado).toBe('Enviada')
  })

  it('ELIMINAR: quita la orden y reiniciar deja todo vacío', () => {
    crearOrden(datos())
    crearOrden(datos())
    eliminarOrden(1001)
    expect(listarOrdenes().map((o) => o.numero)).toEqual([1002])
    reiniciarOrdenes()
    expect(listarOrdenes()).toEqual([])
  })

  it('existen los estados del flujo de una compra', () => {
    expect(ESTADOS).toContain('Pagada')
    expect(ESTADOS).toContain('Pago rechazado')
  })
})
