import { validarFechaNacimiento, validarCodigoPromocional, validarPrecioOferta } from '../utils/validaciones.js'

describe('validaciones: fecha de nacimiento (opcional)', () => {
  it('vacía es válida (es opcional)', () => {
    expect(validarFechaNacimiento('').valido).toBeTrue()
  })
  it('una fecha pasada es válida', () => {
    expect(validarFechaNacimiento('1990-05-17').valido).toBeTrue()
  })
  it('una fecha futura NO es válida', () => {
    const r = validarFechaNacimiento('2999-01-01')
    expect(r.valido).toBeFalse()
    expect(r.mensaje).toBe('La fecha no puede ser futura')
  })
  it('un texto que no es fecha NO es válido', () => {
    expect(validarFechaNacimiento('hola').valido).toBeFalse()
  })
  it('antes de 1900 NO es válida', () => {
    expect(validarFechaNacimiento('1850-01-01').valido).toBeFalse()
  })
})

describe('validaciones: código promocional (opcional)', () => {
  it('vacío es válido', () => {
    expect(validarCodigoPromocional('').valido).toBeTrue()
  })
  it('FELICES50 es válido en cualquier combinación de mayúsculas', () => {
    expect(validarCodigoPromocional('FELICES50').valido).toBeTrue()
    expect(validarCodigoPromocional('felices50').valido).toBeTrue()
  })
  it('cualquier otro código NO es válido', () => {
    const r = validarCodigoPromocional('DESCUENTO')
    expect(r.valido).toBeFalse()
    expect(r.mensaje).toBe('El código promocional no es válido')
  })
})

describe('validaciones: precio de oferta (opcional)', () => {
  it('vacío es válido', () => {
    expect(validarPrecioOferta('', 1000).valido).toBeTrue()
  })
  it('menor al precio normal es válido', () => {
    expect(validarPrecioOferta('800', 1000).valido).toBeTrue()
  })
  it('igual o mayor al precio normal NO es válido', () => {
    expect(validarPrecioOferta('1000', 1000).valido).toBeFalse()
    expect(validarPrecioOferta('1500', 1000).valido).toBeFalse()
  })
  it('decimales o negativos NO son válidos', () => {
    expect(validarPrecioOferta('10.5', 1000).valido).toBeFalse()
    expect(validarPrecioOferta('-3', 1000).valido).toBeFalse()
  })
  it('0 significa "sin oferta" y es válido', () => {
    expect(validarPrecioOferta('0', 1000).valido).toBeTrue()
  })
})
