import {
  agregarAlCarrito,
  quitarDelCarrito,
  cambiarCantidad,
  calcularTotal,
  contarUnidades,
} from '../utils/carrito.js'

const MOUSSE = { id: 5, nombre: 'Mousse de Chocolate', precio: 5000, stock: 30, imagen: '/img/mousse-chocolate.jpg' }
const TORTA = { id: 1, nombre: 'Torta Cuadrada de Chocolate', precio: 45000, stock: 10, imagen: '/img/torta-chocolate.jpg' }

describe('carrito', () => {
  let carrito

  // Cada prueba parte de un carrito vacío
  beforeEach(() => {
    carrito = []
  })

  it('devuelve 0 si el carrito está vacío', () => {
    expect(calcularTotal(carrito)).toBe(0)
    expect(contarUnidades(carrito)).toBe(0)
  })

  it('agrega un producto nuevo con cantidad 1', () => {
    // Preparar / Actuar
    const resultado = agregarAlCarrito(carrito, MOUSSE)
    // Comprobar
    expect(resultado).toHaveSize(1)
    expect(resultado[0]).toEqual({ id: 5, nombre: 'Mousse de Chocolate', precio: 5000, imagen: '/img/mousse-chocolate.jpg', cantidad: 1 })
  })

  it('si el producto ya está, suma 1 a la cantidad en vez de duplicarlo', () => {
    carrito = agregarAlCarrito(carrito, MOUSSE)
    carrito = agregarAlCarrito(carrito, MOUSSE)
    expect(carrito).toHaveSize(1)
    expect(carrito[0].cantidad).toBe(2)
  })

  it('no modifica el carrito original (inmutabilidad para React)', () => {
    const original = agregarAlCarrito(carrito, MOUSSE)
    agregarAlCarrito(original, MOUSSE)
    expect(original[0].cantidad).toBe(1)
  })

  it('calcula total y unidades con varios productos', () => {
    carrito = agregarAlCarrito(carrito, MOUSSE)
    carrito = agregarAlCarrito(carrito, MOUSSE)
    carrito = agregarAlCarrito(carrito, TORTA)
    expect(calcularTotal(carrito)).toBe(55000)
    expect(contarUnidades(carrito)).toBe(3)
  })

  it('cambiar la cantidad a 0 elimina la línea', () => {
    carrito = agregarAlCarrito(carrito, MOUSSE)
    expect(cambiarCantidad(carrito, 5, 0)).toHaveSize(0)
  })

  it('quitarDelCarrito deja solo los demás productos', () => {
    carrito = agregarAlCarrito(agregarAlCarrito(carrito, MOUSSE), TORTA)
    const resultado = quitarDelCarrito(carrito, 5)
    expect(resultado.map((l) => l.nombre)).toEqual(['Torta Cuadrada de Chocolate'])
  })
})
