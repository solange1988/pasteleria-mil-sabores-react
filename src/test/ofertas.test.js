import { listarProductos, listarOfertas, listarProductosCriticos, actualizarProducto, obtenerProducto, STOCK_CRITICO } from '../data/productos.js'
import { precioVigente, agregarAlCarrito } from '../utils/carrito.js'

describe('productos: ofertas', () => {
  it('hay 5 productos en oferta y todos cuestan menos que su precio normal', () => {
    const ofertas = listarOfertas()
    expect(ofertas.length).toBe(5)
    expect(ofertas.every((p) => p.precioOferta < p.precio)).toBeTrue()
  })

  it('un producto con precioOferta 0 deja de estar en oferta', () => {
    const id = listarOfertas()[0].id
    actualizarProducto(id, { precioOferta: 0 })
    expect(listarOfertas().length).toBe(4)
  })

  it('precioVigente cobra la oferta si existe y el precio normal si no', () => {
    expect(precioVigente({ precio: 1000, precioOferta: 800 })).toBe(800)
    expect(precioVigente({ precio: 1000, precioOferta: 0 })).toBe(1000)
    expect(precioVigente({ precio: 1000 })).toBe(1000)
    expect(precioVigente({ precio: 1000, precioOferta: 1500 })).toBe(1000)
  })

  it('al agregar al carrito un producto en oferta se guarda el precio de la oferta', () => {
    const enOferta = listarOfertas()[0]
    const carrito = agregarAlCarrito([], enOferta)
    expect(carrito[0].precio).toBe(enOferta.precioOferta)
  })
})

describe('productos: stock crítico', () => {
  // Parte de un estado conocido: todos con mucho stock
  beforeEach(() => listarProductos().forEach((p) => actualizarProducto(p.id, { stock: 50 })))

  it('lista los productos con stock igual o menor al umbral, del más urgente al menos', () => {
    actualizarProducto(1, { stock: 3 })
    actualizarProducto(2, { stock: 0 })
    actualizarProducto(3, { stock: STOCK_CRITICO })
    const ids = listarProductosCriticos().map((p) => p.id)
    expect(ids).toEqual([2, 1, 3])
  })

  it('acepta un umbral distinto', () => {
    actualizarProducto(4, { stock: 0 })
    actualizarProducto(5, { stock: 4 })
    expect(listarProductosCriticos(0).map((p) => p.id)).toEqual([4])
    expect(listarProductosCriticos(10).length).toBe(2)
    expect(obtenerProducto(5).stock).toBe(4)
  })
})
