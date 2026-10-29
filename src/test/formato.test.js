import formatearPrecio, { crearSlug, porcentajeOferta, formatearFecha } from '../utils/formato.js'

describe('formato', () => {
  it('formatearPrecio usa pesos chilenos con punto de miles', () => {
    expect(formatearPrecio(45000)).toMatch(/^\$\s?45\.000$/)
  })

  it('crearSlug quita tildes, pasa a minúsculas y usa guiones', () => {
    expect(crearSlug('Pastelería Tradicional')).toBe('pasteleria-tradicional')
    expect(crearSlug('  Tortas Cuadradas ')).toBe('tortas-cuadradas')
    expect(crearSlug('Productos Sin Gluten!')).toBe('productos-sin-gluten')
  })

  it('porcentajeOferta calcula el % de rebaja (0 si no hay oferta válida)', () => {
    expect(porcentajeOferta(50000, 42500)).toBe(15)
    expect(porcentajeOferta(50000, 0)).toBe(0)
    expect(porcentajeOferta(50000, undefined)).toBe(0)
    expect(porcentajeOferta(50000, 60000)).toBe(0) // una "oferta" más cara no es oferta
  })

  it('formatearFecha devuelve un texto con la fecha', () => {
    const texto = formatearFecha('2026-10-24T15:30:00.000Z')
    expect(typeof texto).toBe('string')
    expect(texto).toContain('26')
  })
})
