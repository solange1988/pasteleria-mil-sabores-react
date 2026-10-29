import {
  validarCorreoPermitido,
  validarContrasena,
  validarConfirmacion,
  validarNombre,
  validarMensaje,
  validarNumeroPositivo,
} from '../utils/validaciones.js'

describe('validarCorreoPermitido', () => {
  it('acepta correos @duoc.cl, @profesor.duoc.cl y @gmail.com', () => {
    expect(validarCorreoPermitido('ana@duoc.cl').valido).toBe(true)
    expect(validarCorreoPermitido('profe@profesor.duoc.cl').valido).toBe(true)
    expect(validarCorreoPermitido('ana@gmail.com').valido).toBe(true)
  })

  it('rechaza otros dominios con un mensaje claro', () => {
    const resultado = validarCorreoPermitido('ana@hotmail.com')
    expect(resultado.valido).toBe(false)
    expect(resultado.mensaje).toContain('@duoc.cl')
  })

  it('rechaza el correo vacío', () => {
    expect(validarCorreoPermitido('   ')).toEqual({ valido: false, mensaje: 'El correo es obligatorio' })
  })
})

describe('validarContrasena', () => {
  it('acepta entre 4 y 10 caracteres (casos límite)', () => {
    expect(validarContrasena('1234').valido).toBe(true)
    expect(validarContrasena('1234567890').valido).toBe(true)
  })

  it('rechaza 3 y 11 caracteres', () => {
    expect(validarContrasena('123').valido).toBe(false)
    expect(validarContrasena('12345678901').valido).toBe(false)
  })
})

describe('validarConfirmacion', () => {
  it('falla si los valores no coinciden', () => {
    expect(validarConfirmacion('abcd', 'abce', 'contraseña').valido).toBe(false)
  })

  it('pasa si coinciden', () => {
    expect(validarConfirmacion('ana@duoc.cl', 'ana@duoc.cl', 'correo').valido).toBe(true)
  })
})

describe('validaciones de contacto', () => {
  it('el nombre solo admite letras y espacios', () => {
    expect(validarNombre('María José').valido).toBe(true)
    expect(validarNombre('Ana123').valido).toBe(false)
  })

  it('el mensaje necesita al menos 10 caracteres', () => {
    expect(validarMensaje('Hola').valido).toBe(false)
    expect(validarMensaje('Quiero cotizar una torta').valido).toBe(true)
  })
})

describe('validarNumeroPositivo', () => {
  it('rechaza negativos, decimales y texto', () => {
    expect(validarNumeroPositivo('-1').valido).toBe(false)
    expect(validarNumeroPositivo('2.5').valido).toBe(false)
    expect(validarNumeroPositivo('abc').valido).toBe(false)
    expect(validarNumeroPositivo('0').valido).toBe(true)
  })
})
