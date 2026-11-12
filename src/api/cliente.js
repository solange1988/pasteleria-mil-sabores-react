// Cliente HTTP para hablar con el backend (Spring Boot) usando fetch.
// Todas las llamadas a la API pasan por aquí, así la lógica común está en un solo lugar:
//  1. Arma la URL: http://localhost:8080/api/v1 + la ruta.
//  2. Envía y recibe JSON.
//  3. Si hay sesión, agrega el encabezado "Authorization: Bearer <token>".
//  4. Si el backend responde 401 porque el token venció, pide uno nuevo con el token de renovación
//     y repite la petición UNA vez. Si tampoco se puede, borra la sesión y avisa a la aplicación.
//  5. Convierte los errores del backend ({"error": "..."} o {"campo": "mensaje"}) en un ErrorApi.
import { leerSesion, guardarSesion, borrarSesion, EVENTO_SESION_EXPIRADA } from '../auth/sesion.js'

const SERVIDOR = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const URL_API = `${SERVIDOR}/api/v1`

export class ErrorApi extends Error {
  constructor(estado, mensaje, campos = {}) {
    super(mensaje)
    this.estado = estado // código HTTP (0 si no hubo conexión)
    this.campos = campos // errores por campo cuando falla una validación (400)
  }
}

// Si varias peticiones vencen al mismo tiempo, todas esperan la MISMA renovación
let renovacionEnCurso = null

function renovarToken() {
  const tokenRenovacion = leerSesion()?.tokenRenovacion
  if (!tokenRenovacion) return Promise.resolve(false)
  renovacionEnCurso ??= fetch(`${URL_API}/auth/renovar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenRenovacion }),
  })
    .then(async (respuesta) => {
      if (!respuesta.ok) return false
      guardarSesion(await respuesta.json())
      return true
    })
    .catch(() => false)
    .finally(() => { renovacionEnCurso = null })
  return renovacionEnCurso
}

// opciones: { metodo = 'GET', cuerpo, conToken = true }
// conToken: false para login, registro y renovación (no llevan token)
export async function api(ruta, { metodo = 'GET', cuerpo, conToken = true, esReintento = false } = {}) {
  const sesion = conToken ? leerSesion() : null
  const encabezados = { Accept: 'application/json' }
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json'
  if (sesion) encabezados.Authorization = `Bearer ${sesion.token}`

  let respuesta
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.')
  }

  // Token vencido: se renueva y se repite la petición una sola vez
  if (respuesta.status === 401 && sesion && !esReintento) {
    if (await renovarToken()) return api(ruta, { metodo, cuerpo, conToken, esReintento: true })
    borrarSesion()
    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
  }

  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const campos = datos && !datos.error ? datos : {}
    const mensaje = datos?.error ?? Object.values(campos)[0] ?? `Error ${respuesta.status}`
    throw new ErrorApi(respuesta.status, mensaje, campos)
  }
  return datos
}
