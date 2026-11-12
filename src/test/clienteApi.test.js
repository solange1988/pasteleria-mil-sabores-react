import { api, URL_API, ErrorApi } from '../api/cliente.js'
import { leerSesion, EVENTO_SESION_EXPIRADA } from '../auth/sesion.js'
import { simularApi, simularSinConexion, responder, errorApi, conSesion, CLIENTE } from './apiFalsa.js'

describe('api/cliente.js (comunicación con el backend)', () => {
  it('usa la URL versionada del backend: http://localhost:8080/api/v1', () => {
    expect(URL_API).toBe('http://localhost:8080/api/v1')
  })

  it('GET: devuelve el JSON de la respuesta', async () => {
    simularApi({ 'GET /productos': [{ id: 1 }] })
    expect(await api('/productos')).toEqual([{ id: 1 }])
    expect(window.fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/productos', jasmine.any(Object))
  })

  it('POST: envía el cuerpo como JSON con su Content-Type', async () => {
    const llamadas = simularApi({ 'POST /categorias': responder(201, { id: 9, nombre: 'Kuchen' }) })
    const creada = await api('/categorias', { metodo: 'POST', cuerpo: { nombre: 'Kuchen' } })
    expect(creada.id).toBe(9)
    expect(llamadas[0].cuerpo).toEqual({ nombre: 'Kuchen' })
    expect(window.fetch.calls.argsFor(0)[1].headers['Content-Type']).toBe('application/json')
  })

  it('sin sesión NO envía el encabezado Authorization', async () => {
    const llamadas = simularApi({ 'GET /productos': [] })
    await api('/productos')
    expect(llamadas[0].autorizacion).toBeUndefined()
  })

  it('con sesión envía "Authorization: Bearer <token>"', async () => {
    conSesion(CLIENTE)
    const llamadas = simularApi({ 'GET /boletas/mias': [] })
    await api('/boletas/mias')
    expect(llamadas[0].autorizacion).toBe('Bearer token-acceso')
  })

  it('conToken: false no envía el token aunque haya sesión (login, registro)', async () => {
    conSesion(CLIENTE)
    const llamadas = simularApi({ 'POST /auth/login': {} })
    await api('/auth/login', { metodo: 'POST', cuerpo: {}, conToken: false })
    expect(llamadas[0].autorizacion).toBeUndefined()
  })

  it('una respuesta 204 (sin contenido) devuelve null', async () => {
    simularApi({ 'DELETE /productos/1': responder(204) })
    expect(await api('/productos/1', { metodo: 'DELETE' })).toBeNull()
  })

  it('un error {"error": "..."} se convierte en ErrorApi con el código y el mensaje', async () => {
    simularApi({ 'GET /productos/99': errorApi(404, 'No existe el producto 99') })
    await expectAsync(api('/productos/99')).toBeRejectedWith(jasmine.objectContaining({ estado: 404, message: 'No existe el producto 99' }))
  })

  it('un error de validación por campo (400) entrega el primer mensaje y todos los campos', async () => {
    simularApi({ 'POST /productos': responder(400, { nombre: 'El nombre es obligatorio', precio: 'El precio es obligatorio' }) })
    try {
      await api('/productos', { metodo: 'POST', cuerpo: {} })
      fail('debió fallar')
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorApi)
      expect(e.message).toBe('El nombre es obligatorio')
      expect(e.campos.precio).toBe('El precio es obligatorio')
    }
  })

  it('si el backend está apagado avisa que no se pudo conectar (estado 0)', async () => {
    simularSinConexion()
    await expectAsync(api('/productos')).toBeRejectedWith(jasmine.objectContaining({ estado: 0 }))
  })
})

describe('api/cliente.js (renovación del token JWT)', () => {
  it('si el token venció (401), lo renueva con el token de renovación y repite la petición', async () => {
    conSesion(CLIENTE)
    let primera = true
    const llamadas = simularApi({
      'GET /boletas/mias': ({ autorizacion }) => {
        if (primera) { primera = false; return errorApi(401, 'token vencido') }
        return autorizacion === 'Bearer token-nuevo' ? [] : errorApi(401, 'token vencido')
      },
      'POST /auth/renovar': ({ cuerpo }) =>
        cuerpo.tokenRenovacion === 'token-renovacion'
          ? { token: 'token-nuevo', tokenRenovacion: 'renovacion-nueva', usuario: CLIENTE }
          : errorApi(401, 'no'),
    })

    expect(await api('/boletas/mias')).toEqual([])
    expect(llamadas.map((l) => `${l.metodo} ${l.ruta}`)).toEqual(['GET /boletas/mias', 'POST /auth/renovar', 'GET /boletas/mias'])
    expect(leerSesion().token).toBe('token-nuevo') // la sesión guarda el token nuevo
  })

  it('si tampoco se puede renovar, borra la sesión y avisa a la aplicación', async () => {
    conSesion(CLIENTE)
    const alExpirar = jasmine.createSpy()
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    simularApi({ 'GET /boletas/mias': errorApi(401, 'token vencido'), 'POST /auth/renovar': errorApi(401, 'expiró') })

    await expectAsync(api('/boletas/mias')).toBeRejectedWith(jasmine.objectContaining({ estado: 401 }))

    expect(leerSesion()).toBeNull()
    expect(alExpirar).toHaveBeenCalledTimes(1)
    window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  })
})
