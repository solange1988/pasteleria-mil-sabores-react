import { resumenVentas, productosMasVendidos } from '../utils/reportes.js'

const orden = (total, estado, lineas) => ({ total, estado, lineas })
const ORDENES = [
  orden(10000, 'Pagada', [{ nombre: 'Mousse', cantidad: 2 }, { nombre: 'Brownie', cantidad: 1 }]),
  orden(20000, 'Entregada', [{ nombre: 'Mousse', cantidad: 3 }]),
  orden(99999, 'Pago rechazado', [{ nombre: 'Tiramisú', cantidad: 50 }]),
]

describe('reportes', () => {
  it('resumenVentas no cuenta las órdenes rechazadas en las ventas', () => {
    expect(resumenVentas(ORDENES)).toEqual({ cantidadOrdenes: 2, rechazadas: 1, totalVentas: 30000, ticketPromedio: 15000 })
  })

  it('resumenVentas sin órdenes devuelve ceros (sin dividir por 0)', () => {
    expect(resumenVentas([])).toEqual({ cantidadOrdenes: 0, rechazadas: 0, totalVentas: 0, ticketPromedio: 0 })
  })

  it('productosMasVendidos suma unidades, ordena de mayor a menor e ignora rechazadas', () => {
    expect(productosMasVendidos(ORDENES)).toEqual([
      { nombre: 'Mousse', unidades: 5 },
      { nombre: 'Brownie', unidades: 1 },
    ])
  })

  it('productosMasVendidos respeta la cantidad pedida', () => {
    expect(productosMasVendidos(ORDENES, 1).length).toBe(1)
  })
})
