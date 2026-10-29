import {
  listarUsuarios, obtenerUsuario, existeCorreo, registrarUsuario,
  actualizarUsuario, eliminarUsuario, reiniciarUsuarios, autenticar, ROLES,
} from '../data/usuarios.js'

const ANA = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', contrasena: 'clave123' }

describe('usuarios: CRUD (localStorage)', () => {
  it('al inicio solo existe el administrador', () => {
    const lista = listarUsuarios()
    expect(lista.length).toBe(1)
    expect(lista[0].correo).toBe('admin@duoc.cl')
    expect(lista[0].rol).toBe('Administrador')
  })

  it('CREAR: registra un cliente y lo guarda', () => {
    const r = registrarUsuario(ANA)
    expect(r.ok).toBeTrue()
    expect(r.usuario.rol).toBe('Cliente')
    expect(listarUsuarios().length).toBe(2)
    expect(existeCorreo('ANA@duoc.cl')).toBeTrue() // sin distinguir mayúsculas
  })

  it('no permite registrar dos veces el mismo correo', () => {
    registrarUsuario(ANA)
    const repetido = registrarUsuario({ ...ANA, nombre: 'Otra' })
    expect(repetido.ok).toBeFalse()
    expect(repetido.mensaje).toBe('Ese correo ya está registrado.')
    expect(listarUsuarios().length).toBe(2)
  })

  it('LEER: obtenerUsuario encuentra por correo y NUNCA devuelve la contraseña', () => {
    registrarUsuario(ANA)
    const u = obtenerUsuario('ana@duoc.cl')
    expect(u.nombre).toBe('Ana Pérez')
    expect(u.contrasena).toBeUndefined()
    expect(listarUsuarios().every((x) => x.contrasena === undefined)).toBeTrue()
    expect(obtenerUsuario('nadie@duoc.cl')).toBeUndefined()
  })

  it('ACTUALIZAR: cambia solo los campos indicados y no el correo', () => {
    registrarUsuario(ANA)
    const u = actualizarUsuario('ana@duoc.cl', { nombre: 'Ana Gómez', correo: 'otro@duoc.cl', rol: 'Administrador' })
    expect(u.nombre).toBe('Ana Gómez')
    expect(u.correo).toBe('ana@duoc.cl')
    expect(u.rol).toBe('Administrador')
    expect(actualizarUsuario('nadie@duoc.cl', { nombre: 'X' })).toBeUndefined()
  })

  it('ELIMINAR: quita al usuario', () => {
    registrarUsuario(ANA)
    eliminarUsuario('ana@duoc.cl')
    expect(existeCorreo('ana@duoc.cl')).toBeFalse()
  })

  it('reiniciarUsuarios vuelve a dejar solo al administrador', () => {
    registrarUsuario(ANA)
    reiniciarUsuarios()
    expect(listarUsuarios().length).toBe(1)
  })

  it('hay dos roles disponibles', () => {
    expect(ROLES).toEqual(['Administrador', 'Cliente'])
  })
})

describe('usuarios: autenticar', () => {
  beforeEach(() => registrarUsuario(ANA))

  it('con correo y contraseña correctos devuelve el usuario (sin contraseña)', () => {
    const u = autenticar('ana@duoc.cl', 'clave123')
    expect(u.nombre).toBe('Ana Pérez')
    expect(u.contrasena).toBeUndefined()
  })

  it('con contraseña incorrecta o correo desconocido devuelve null', () => {
    expect(autenticar('ana@duoc.cl', 'mala')).toBeNull()
    expect(autenticar('nadie@duoc.cl', 'clave123')).toBeNull()
  })

  it('el correo no distingue mayúsculas, la contraseña sí', () => {
    expect(autenticar('ANA@DUOC.CL', 'clave123')).not.toBeNull()
    expect(autenticar('ana@duoc.cl', 'CLAVE123')).toBeNull()
  })
})
