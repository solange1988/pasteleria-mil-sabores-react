// Pruebas con Jasmine, ejecutadas por Karma en Google Chrome (npm run test:karma).
// No se importa nada: describe, it, expect, beforeEach, spyOn y jasmine son globales de Jasmine.
import { agregarAlCarrito, calcularTotal, contarUnidades } from '../utils/carrito.js'
import { descuentoDe, calcularTotales } from '../utils/descuentos.js'
import { validarCorreoPermitido, validarContrasena } from '../utils/validaciones.js'
import { crearProducto } from '../data/productos.js'
import { clienteHttp } from '../api/cliente.js'

const MOUSSE = { id: 5, nombre: 'Mousse de Chocolate', precio: 5000, stock: 30, imagen: '/img/mousse-chocolate.jpg' }
const TORTA = { id: 1, nombre: 'Torta Cuadrada de Chocolate', precio: 45000, stock: 10, imagen: '/img/torta-chocolate.jpg' }
// Fecha fija para que las pruebas den lo mismo cualquier día
const HOY = new Date(2026, 9, 20)

describe('Carrito (lógica)', () => {
  let carrito

  beforeEach(() => {
    carrito = []
  })

  it('calcula el total y las unidades', () => {
    // Preparar
    carrito = agregarAlCarrito(carrito, MOUSSE)
    carrito = agregarAlCarrito(carrito, MOUSSE)
    carrito = agregarAlCarrito(carrito, TORTA)
    // Actuar y comprobar
    expect(calcularTotal(carrito)).toBe(55000)
    expect(contarUnidades(carrito)).toBe(3)
  })

  it('no duplica un producto repetido: suma 1 a su cantidad', () => {
    carrito = agregarAlCarrito(agregarAlCarrito(carrito, MOUSSE), MOUSSE)
    expect(carrito.length).toBe(1)
    expect(carrito[0].cantidad).toBe(2)
  })
})

describe('Descuentos (reglas del ERS)', () => {
  it('50% desde los 50 años cumplidos; 49 años no tiene descuento', () => {
    expect(descuentoDe({ fechaNacimiento: '1976-10-20' }, HOY).porcentaje).toBe(50)
    expect(descuentoDe({ fechaNacimiento: '1976-10-21' }, HOY).porcentaje).toBe(0)
  })

  it('con el código FELICES50 se paga 10% menos', () => {
    const usuario = { fechaNacimiento: '2000-01-01', codigo: 'FELICES50' }
    const totales = calcularTotales([{ ...MOUSSE, cantidad: 2 }], usuario, HOY)
    expect(totales).toEqual(jasmine.objectContaining({ subtotal: 10000, descuento: 1000, total: 9000 }))
  })
})

describe('Validaciones', () => {
  it('el correo solo acepta @duoc.cl, @profesor.duoc.cl y @gmail.com', () => {
    expect(validarCorreoPermitido('ana@duoc.cl').valido).toBeTrue()
    expect(validarCorreoPermitido('ana@hotmail.com').valido).toBeFalse()
  })

  it('la contraseña debe tener entre 4 y 10 caracteres', () => {
    expect(validarContrasena('1234').valido).toBeTrue()
    expect(validarContrasena('123').valido).toBeFalse()
    expect(validarContrasena('12345678901').valido).toBeFalse()
  })
})

describe('Crear producto contra la API (mock de axios con spyOn)', () => {
  it('envía POST /api/v1/productos con los datos y devuelve el producto con su id', async () => {
    // spyOn reemplaza el método request de la instancia de axios por un doble que responde
    // como el backend (201 Created). Jasmine quita el espía solo al terminar la prueba.
    spyOn(clienteHttp, 'request').and.resolveTo({ status: 201, data: { id: 17, nombre: 'Kuchen de Nuez' } })

    const nuevo = await crearProducto({ nombre: 'Kuchen de Nuez', categoria: 'Pastelería Tradicional', precio: 8000, stock: 5 })

    expect(nuevo.id).toBe(17)
    const [config] = clienteHttp.request.calls.argsFor(0)
    expect(clienteHttp.defaults.baseURL + config.url).toBe('http://localhost:8080/api/v1/productos')
    expect(config.method).toBe('POST')
    expect(config.data.nombre).toBe('Kuchen de Nuez')
  })
})
