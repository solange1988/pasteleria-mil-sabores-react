import { leerSesion, guardarSesion, borrarSesion, actualizarUsuarioSesion } from '../auth/sesion.js'
import { puede, paginaInicial } from '../auth/permisos.js'
import { ADMIN, VENDEDOR, CLIENTE } from './apiFalsa.js'

describe('auth/sesion.js (persistencia de la sesión)', () => {
  it('sin nada guardado no hay sesión', () => {
    expect(leerSesion()).toBeNull()
  })

  it('guarda token, token de renovación y usuario, y los recupera (como al recargar la página)', () => {
    guardarSesion({ token: 'a', tokenRenovacion: 'r', usuario: CLIENTE })
    expect(leerSesion()).toEqual({ token: 'a', tokenRenovacion: 'r', usuario: CLIENTE })
  })

  it('nunca guarda la contraseña aunque venga en los datos', () => {
    guardarSesion({ token: 'a', tokenRenovacion: 'r', usuario: CLIENTE, contrasena: 'clave123' })
    expect(localStorage.getItem('pms_sesion')).not.toContain('clave123')
  })

  it('actualizarUsuarioSesion cambia los datos del usuario y mantiene los tokens', () => {
    guardarSesion({ token: 'a', tokenRenovacion: 'r', usuario: CLIENTE })
    actualizarUsuarioSesion({ ...CLIENTE, nombre: 'Ana Gómez' })
    expect(leerSesion().usuario.nombre).toBe('Ana Gómez')
    expect(leerSesion().token).toBe('a')
  })

  it('borrarSesion (cerrar sesión) elimina todo', () => {
    guardarSesion({ token: 'a', tokenRenovacion: 'r', usuario: CLIENTE })
    borrarSesion()
    expect(leerSesion()).toBeNull()
  })

  it('datos dañados o incompletos en localStorage se ignoran', () => {
    localStorage.setItem('pms_sesion', '{no es json')
    expect(leerSesion()).toBeNull()
    localStorage.setItem('pms_sesion', JSON.stringify({ usuario: CLIENTE }))
    expect(leerSesion()).toBeNull()
  })
})

describe('auth/permisos.js (restricciones por rol)', () => {
  it('el Administrador tiene acceso total al panel', () => {
    ;['panel', 'productos', 'productos.editar', 'stock', 'ordenes', 'ordenes.editar', 'usuarios', 'reportes']
      .forEach((p) => expect(puede(ADMIN, p)).withContext(p).toBeTrue())
  })

  it('el Vendedor solo puede ver productos y órdenes', () => {
    expect(puede(VENDEDOR, 'panel')).toBeTrue()
    expect(puede(VENDEDOR, 'productos')).toBeTrue()
    expect(puede(VENDEDOR, 'ordenes')).toBeTrue()
    ;['productos.editar', 'stock', 'ordenes.editar', 'usuarios', 'reportes']
      .forEach((p) => expect(puede(VENDEDOR, p)).withContext(p).toBeFalse())
  })

  it('el Cliente y el visitante no entran al panel', () => {
    expect(puede(CLIENTE, 'panel')).toBeFalse()
    expect(puede(null, 'panel')).toBeFalse()
    expect(puede({ rol: 'Inventado' }, 'panel')).toBeFalse()
  })

  it('después del login, admin y vendedor van al panel; el cliente a la tienda', () => {
    expect(paginaInicial(ADMIN)).toBe('#/admin')
    expect(paginaInicial(VENDEDOR)).toBe('#/admin')
    expect(paginaInicial(CLIENTE)).toBe('#/')
  })
})
