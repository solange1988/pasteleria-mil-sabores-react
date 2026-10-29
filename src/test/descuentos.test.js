import { calcularEdad, esCumpleanos, esCorreoDuoc, descuentoDe, tieneTortaGratis, calcularTotales } from '../utils/descuentos.js'

// Fecha fija para que las pruebas no dependan del día en que se ejecutan: 20 de octubre de 2026
const HOY = new Date(2026, 9, 20)
const LINEA = { id: 1, nombre: 'Mousse', precio: 10000, cantidad: 1 }

describe('descuentos: edad y cumpleaños', () => {
  it('calcula los años cumplidos (el día exacto del cumpleaños ya cuenta)', () => {
    expect(calcularEdad('1976-10-20', HOY)).toBe(50)
    expect(calcularEdad('1976-10-21', HOY)).toBe(49)
    expect(calcularEdad('1990-01-01', HOY)).toBe(36)
  })

  it('sin fecha o con fecha inválida no hay edad', () => {
    expect(calcularEdad('', HOY)).toBeNull()
    expect(calcularEdad(undefined, HOY)).toBeNull()
    expect(calcularEdad('abc', HOY)).toBeNull()
  })

  it('detecta el cumpleaños comparando solo mes y día', () => {
    expect(esCumpleanos({ fechaNacimiento: '1999-10-20' }, HOY)).toBeTrue()
    expect(esCumpleanos({ fechaNacimiento: '1999-10-21' }, HOY)).toBeFalse()
    expect(esCumpleanos({}, HOY)).toBeFalse()
    expect(esCumpleanos(null, HOY)).toBeFalse()
  })

  it('reconoce los correos institucionales de Duoc', () => {
    expect(esCorreoDuoc('ana@duoc.cl')).toBeTrue()
    expect(esCorreoDuoc('PROFE@Profesor.Duoc.CL')).toBeTrue()
    expect(esCorreoDuoc('ana@gmail.com')).toBeFalse()
    expect(esCorreoDuoc()).toBeFalse()
  })
})

describe('descuentos: descuentoDe (reglas del ERS)', () => {
  it('mayor de 50 años: 50%', () => {
    expect(descuentoDe({ fechaNacimiento: '1970-05-05' }, HOY).porcentaje).toBe(50)
  })

  it('código FELICES50 (sin importar mayúsculas): 10%', () => {
    expect(descuentoDe({ codigo: 'felices50' }, HOY).porcentaje).toBe(10)
    expect(descuentoDe({ codigo: ' FELICES50 ' }, HOY).porcentaje).toBe(10)
  })

  it('si cumple las dos reglas se aplica solo la mayor (no se acumulan)', () => {
    const d = descuentoDe({ fechaNacimiento: '1970-05-05', codigo: 'FELICES50' }, HOY)
    expect(d.porcentaje).toBe(50)
    expect(d.motivo).toContain('50 años')
  })

  it('sin usuario, sin datos o con otro código no hay descuento', () => {
    expect(descuentoDe(null, HOY)).toEqual({ porcentaje: 0, motivo: '' })
    expect(descuentoDe({ fechaNacimiento: '2000-01-01', codigo: 'OTRO' }, HOY).porcentaje).toBe(0)
  })
})

describe('descuentos: torta gratis y totales', () => {
  it('torta gratis solo para correo Duoc EL DÍA de su cumpleaños', () => {
    const cumple = { correo: 'ana@duoc.cl', fechaNacimiento: '2000-10-20' }
    expect(tieneTortaGratis(cumple, HOY)).toBeTrue()
    expect(tieneTortaGratis({ ...cumple, correo: 'ana@gmail.com' }, HOY)).toBeFalse()
    expect(tieneTortaGratis({ ...cumple, fechaNacimiento: '2000-10-21' }, HOY)).toBeFalse()
    expect(tieneTortaGratis(null, HOY)).toBeFalse()
  })

  it('calcularTotales aplica el descuento sobre el subtotal', () => {
    const t = calcularTotales([LINEA], { fechaNacimiento: '1970-05-05' }, HOY)
    expect(t.subtotal).toBe(10000)
    expect(t.descuento).toBe(5000)
    expect(t.total).toBe(5000)
    expect(t.regalo).toBe('')
  })

  it('calcularTotales sin usuario cobra el subtotal completo', () => {
    const t = calcularTotales([{ ...LINEA, cantidad: 3 }], null, HOY)
    expect(t).toEqual(jasmine.objectContaining({ subtotal: 30000, descuento: 0, total: 30000 }))
  })

  it('calcularTotales informa el regalo de cumpleaños', () => {
    const t = calcularTotales([LINEA], { correo: 'ana@duoc.cl', fechaNacimiento: '2000-10-20' }, HOY)
    expect(t.regalo).toContain('Torta de cumpleaños gratis')
    expect(t.total).toBe(10000)
  })
})
