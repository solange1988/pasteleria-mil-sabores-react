// Contexto de SESIÓN: guarda quién inició sesión y lo comparte con toda la aplicación.
// Cualquier componente puede leerlo con el hook useSesion(), sin pasar props de página en página.
//
//   const { usuario, verificando, aviso, iniciar, cerrar, actualizarUsuario } = useSesion()
//
// Cómo funciona la sesión:
//  1. Al iniciar sesión, el backend entrega { token, tokenRenovacion, usuario } y se guarda en
//     localStorage (clave "pms_sesion", ver auth/sesion.js). Por eso la sesión NO se pierde al recargar.
//  2. Al recargar, se lee lo guardado y se confirma con el backend (GET /usuarios/perfil) que el
//     token sigue siendo válido. Mientras tanto "verificando" es true.
//  3. Si el token vence y no se puede renovar, el cliente HTTP avisa con un evento y se cierra la sesión.
//  4. Si la sesión cambia en otra pestaña, esta pestaña se actualiza (evento "storage").
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPerfil } from '../data/usuarios.js'
import {
  leerSesion, guardarSesion, borrarSesion, actualizarUsuarioSesion, EVENTO_SESION_EXPIRADA, CLAVE_SESION,
} from '../auth/sesion.js'
import { paginaInicial } from '../auth/permisos.js'

const SesionContext = createContext(null)

export function SesionProvider({ children }) {
  const navegar = useNavigate()
  const [usuario, setUsuario] = useState(() => leerSesion()?.usuario ?? null)
  const [verificando, setVerificando] = useState(() => Boolean(leerSesion()))
  const [aviso, setAviso] = useState('')

  // Confirmar con el backend que la sesión guardada sigue siendo válida (y traer el rol actual)
  useEffect(() => {
    if (!leerSesion()) return
    obtenerPerfil()
      .then((perfil) => setUsuario(actualizarUsuarioSesion(perfil)?.usuario ?? null))
      .catch((error) => {
        if (error.estado === 401) setUsuario(null) // token inválido: el cliente de la API ya borró la sesión
      })
      .finally(() => setVerificando(false))
  }, [])

  // Token vencido sin renovación posible, o sesión cambiada en otra pestaña
  useEffect(() => {
    const alExpirar = () => {
      setUsuario(null)
      setAviso('Tu sesión expiró. Inicia sesión nuevamente.')
      navegar('/login')
    }
    const alCambiarEnOtraPestana = (evento) => {
      if (evento.key === CLAVE_SESION) setUsuario(leerSesion()?.usuario ?? null)
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    window.addEventListener('storage', alCambiarEnOtraPestana)
    return () => {
      window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
      window.removeEventListener('storage', alCambiarEnOtraPestana)
    }
  }, [navegar])

  // respuesta del login: { token, tokenRenovacion, usuario }
  function iniciar(respuesta) {
    guardarSesion(respuesta)
    setUsuario(respuesta.usuario)
    setAviso('')
    navegar(paginaInicial(respuesta.usuario)) // Administrador y Vendedor van al panel; Cliente a la tienda
  }

  function cerrar() {
    borrarSesion()
    setUsuario(null)
    navegar('/')
  }

  function actualizarUsuario(nuevo) {
    setUsuario(actualizarUsuarioSesion(nuevo)?.usuario ?? null)
  }

  const valor = { usuario, verificando, aviso, iniciar, cerrar, actualizarUsuario }
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

// eslint-disable-next-line react/only-export-components -- el hook va junto a su Provider
export function useSesion() {
  const sesion = useContext(SesionContext)
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return sesion
}
