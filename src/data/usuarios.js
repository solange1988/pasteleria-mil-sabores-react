// Usuarios y autenticación: ahora los maneja el backend.
// La contraseña viaja solo al iniciar sesión o registrarse; el backend la guarda cifrada (BCrypt)
// y responde con tokens JWT. El navegador nunca guarda contraseñas.
import { api } from '../api/cliente.js'

export const ROLES = ['Administrador', 'Vendedor', 'Cliente']

// ---------- Públicos (sin token) ----------
// Devuelven { token, tokenRenovacion, usuario }
export const iniciarSesion = (correo, contrasena) =>
  api('/auth/login', { metodo: 'POST', cuerpo: { correo: correo.trim(), contrasena }, conToken: false })

export const registrarUsuario = (datos) =>
  api('/auth/registro', { metodo: 'POST', cuerpo: { ...datos, correo: datos.correo.trim() }, conToken: false })

// ---------- Con sesión: el propio usuario ----------
export const obtenerPerfil = () => api('/usuarios/perfil')
export const actualizarPerfil = (datos) => api('/usuarios/perfil', { metodo: 'PUT', cuerpo: datos })

// ---------- Solo Administrador ----------
export const listarUsuarios = () => api('/usuarios')
export const crearUsuario = (datos) => api('/usuarios', { metodo: 'POST', cuerpo: datos })
// Al editar se envían todos los datos; la contraseña vacía significa "no cambiarla"
export const actualizarUsuario = (usuario, cambios) =>
  api(`/usuarios/${usuario.id}`, { metodo: 'PUT', cuerpo: { ...usuario, ...cambios, contrasena: cambios.contrasena ?? '' } })
export const eliminarUsuario = (id) => api(`/usuarios/${id}`, { metodo: 'DELETE' })
