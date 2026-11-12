// Sesión del usuario en el navegador.
// Se guarda en localStorage para que siga activa al RECARGAR la página o abrir otra pestaña:
//   { token, tokenRenovacion, usuario: { id, nombre, correo, rol, ... } }
// Medidas de seguridad:
//  - Nunca se guarda la contraseña: solo los tokens que entrega el backend.
//  - El token de acceso dura 30 minutos; cuando vence se pide otro con el de renovación (api/cliente.js).
//  - Al recargar, App confirma la sesión con el backend (GET /usuarios/perfil): si el token ya no sirve,
//    la sesión se borra. Así el rol que se muestra siempre es el que tiene el usuario en la base de datos.
//  - Al cerrar sesión se borra todo.

const CLAVE = 'pms_sesion'

// Evento que avisa a la aplicación que la sesión expiró (lo escucha App.jsx)
export const EVENTO_SESION_EXPIRADA = 'pms:sesion-expirada'

export function leerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE))
    return sesion?.token && sesion?.usuario ? sesion : null
  } catch {
    return null
  }
}

export function guardarSesion({ token, tokenRenovacion, usuario }) {
  const sesion = { token, tokenRenovacion, usuario }
  localStorage.setItem(CLAVE, JSON.stringify(sesion))
  return sesion
}

// Cambia solo los datos del usuario (por ejemplo, después de editar el perfil)
export function actualizarUsuarioSesion(usuario) {
  const sesion = leerSesion()
  return sesion ? guardarSesion({ ...sesion, usuario }) : null
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE)
}

export const CLAVE_SESION = CLAVE
