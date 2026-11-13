// Cliente HTTP para hablar con el backend (Spring Boot) usando AXIOS.
// Todas las llamadas a la API pasan por aquí, así la lógica común está en un solo lugar:
//  1. Una instancia de axios (clienteHttp) con la URL base: http://localhost:8080/api/v1
//  2. axios envía el cuerpo como JSON y convierte la respuesta JSON en objeto automáticamente.
//  3. Interceptor de PETICIÓN: si hay sesión, agrega "Authorization: Bearer <token>".
//  4. Interceptor de RESPUESTA: si el backend responde 401 porque el token venció, pide uno nuevo
//     con el token de renovación y repite la petición UNA vez. Si tampoco se puede, borra la
//     sesión y avisa a la aplicación.
//  5. Convierte los errores del backend ({"error": "..."} o {"campo": "mensaje"}) en un ErrorApi.
import axios from 'axios'
import { leerSesion, guardarSesion, borrarSesion, EVENTO_SESION_EXPIRADA } from '../auth/sesion.js'

const SERVIDOR = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const URL_API = `${SERVIDOR}/api/v1`

// Instancia de axios con la configuración común a todas las peticiones
export const clienteHttp = axios.create({
  baseURL: URL_API,
  headers: { Accept: 'application/json' },
})

export class ErrorApi extends Error {
  constructor(estado, mensaje, campos = {}) {
    super(mensaje)
    this.estado = estado // código HTTP (0 si no hubo conexión)
    this.campos = campos // errores por campo cuando falla una validación (400)
  }
}

// ---------- Interceptor de petición: agrega el token JWT ----------
// conToken: false (login, registro y renovación) => no se envía el token
clienteHttp.interceptors.request.use((config) => {
  const sesion = config.conToken === false ? null : leerSesion()
  if (sesion) config.headers.Authorization = `Bearer ${sesion.token}`
  return config
})

// Si varias peticiones vencen al mismo tiempo, todas esperan la MISMA renovación
let renovacionEnCurso = null

function renovarToken() {
  const tokenRenovacion = leerSesion()?.tokenRenovacion
  if (!tokenRenovacion) return Promise.resolve(false)
  renovacionEnCurso ??= clienteHttp
    .post('/auth/renovar', { tokenRenovacion }, { conToken: false })
    .then((respuesta) => {
      guardarSesion(respuesta.data)
      return true
    })
    .catch(() => false)
    .finally(() => { renovacionEnCurso = null })
  return renovacionEnCurso
}

// ---------- Interceptor de respuesta: renueva el token si venció ----------
clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const { config, response } = error
    const llevabaToken = Boolean(config?.headers?.Authorization)
    if (response?.status === 401 && llevabaToken && !config.esReintento) {
      if (await renovarToken()) {
        // Se repite la petición original; el interceptor de petición pone el token nuevo
        return clienteHttp.request({ ...config, esReintento: true })
      }
      borrarSesion()
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }
    return Promise.reject(error)
  },
)

// Convierte un error de axios en un ErrorApi con un mensaje entendible
function aErrorApi(error) {
  if (!error.response) {
    return new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.')
  }
  const { status, data } = error.response
  const datos = data && typeof data === 'object' ? data : null
  const campos = datos && !datos.error ? datos : {}
  const mensaje = datos?.error ?? Object.values(campos)[0] ?? `Error ${status}`
  return new ErrorApi(status, mensaje, campos)
}

// Función que usan todos los archivos de src/data/*.js
// opciones: { metodo = 'GET', cuerpo, conToken = true }
export async function api(ruta, { metodo = 'GET', cuerpo, conToken = true } = {}) {
  try {
    const respuesta = await clienteHttp.request({ url: ruta, method: metodo, data: cuerpo, conToken })
    // 204 (sin contenido) o cuerpo vacío => null
    if (respuesta.status === 204 || respuesta.data === '') return null
    return respuesta.data ?? null
  } catch (error) {
    throw aErrorApi(error)
  }
}
