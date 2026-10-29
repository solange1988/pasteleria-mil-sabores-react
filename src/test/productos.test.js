import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  reiniciarProductos,
} from '../data/productos.js'

describe('CRUD de productos (data/productos.js)', () => {
  beforeEach(() => {
    localStorage.clear()
    reiniciarProductos()
  })

  it('lista los 16 productos iniciales', () => {
    expect(listarProductos()).toHaveSize(16)
  })

  it('obtenerProducto devuelve undefined si el id no existe', () => {
    expect(obtenerProducto(999)).toBeUndefined()
    expect(obtenerProducto('4').nombre).toBe('Torta Circular de Manjar')
  })

  it('crear asigna el siguiente id y lo guarda en localStorage (mock)', () => {
    // Espía (mock) sobre localStorage.setItem para comprobar que se persiste
    const espiaGuardar = spyOn(Storage.prototype, 'setItem').and.callThrough()

    const nuevo = crearProducto({ nombre: 'Kuchen de Nuez', categoria: 'Pastelería Tradicional', precio: 8000, stock: 5 })

    expect(nuevo.id).toBe(17)
    expect(espiaGuardar).toHaveBeenCalledTimes(1)
    expect(espiaGuardar).toHaveBeenCalledWith('pms_productos_v2', jasmine.stringContaining('Kuchen de Nuez'))
    expect(listarProductos()).toHaveSize(17)
  })

  it('actualizar cambia solo los campos enviados', () => {
    actualizarProducto(1, { precio: 47000 })
    const torta = obtenerProducto(1)
    expect(torta.precio).toBe(47000)
    expect(torta.nombre).toBe('Torta Cuadrada de Chocolate')
  })

  it('eliminar quita el producto', () => {
    eliminarProducto(1)
    expect(obtenerProducto(1)).toBeUndefined()
    expect(listarProductos()).toHaveSize(15)
  })
})
