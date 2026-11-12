import { useState, useEffect } from 'react'
import { Alert, Container } from 'react-bootstrap'
import Encabezado from './components/Encabezado.jsx'
import PiePagina from './components/PiePagina.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import DetalleProducto from './pages/DetalleProducto.jsx'
import Categorias from './pages/Categorias.jsx'
import Ofertas from './pages/Ofertas.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Perfil from './pages/Perfil.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Blogs from './pages/Blogs.jsx'
import BlogDetalle from './pages/BlogDetalle.jsx'
import Contacto from './pages/Contacto.jsx'
import Admin from './pages/Admin.jsx'
import { agregarAlCarrito, quitarDelCarrito, cambiarCantidad, contarUnidades } from './utils/carrito.js'
import { obtenerPerfil } from './data/usuarios.js'
import {
  leerSesion, guardarSesion, borrarSesion, actualizarUsuarioSesion, EVENTO_SESION_EXPIRADA, CLAVE_SESION,
} from './auth/sesion.js'
import { paginaInicial } from './auth/permisos.js'

// Lee un valor guardado en localStorage (o el valor inicial si no hay nada guardado)
function leerGuardado(clave, valorInicial) {
  const guardado = localStorage.getItem(clave)
  return guardado ? JSON.parse(guardado) : valorInicial
}

// Navegación simple: la ruta es lo que viene después del # de la URL (ej: #/productos)
// "#/categorias/tortas-cuadradas" -> { pagina: 'categorias', id: 'tortas-cuadradas' }
function useRuta() {
  const leer = () => {
    const [pagina = '', id = ''] = window.location.hash.replace('#/', '').split('/')
    return { pagina, id }
  }
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const alCambiarHash = () => setRuta(leer())
    window.addEventListener('hashchange', alCambiarHash)
    return () => window.removeEventListener('hashchange', alCambiarHash)
  }, [])
  return ruta
}

// Gestión de la sesión: { usuario, verificando, aviso, iniciar, cerrar, actualizarUsuario }
function useSesion() {
  // Al recargar la página la sesión se recupera de localStorage
  const [usuario, setUsuario] = useState(() => leerSesion()?.usuario ?? null)
  const [verificando, setVerificando] = useState(() => Boolean(leerSesion()))
  const [aviso, setAviso] = useState('')

  // 1. Confirmar con el backend que la sesión guardada sigue siendo válida (y traer el rol actual)
  useEffect(() => {
    if (!leerSesion()) return
    obtenerPerfil()
      .then((perfil) => setUsuario(actualizarUsuarioSesion(perfil)?.usuario ?? null))
      .catch((error) => {
        if (error.estado === 401) setUsuario(null) // token inválido: el cliente de la API ya borró la sesión
      })
      .finally(() => setVerificando(false))
  }, [])

  // 2. Si el token vence y no se puede renovar, se cierra la sesión y se avisa
  // 3. Si se cierra o inicia sesión en otra pestaña, esta pestaña se actualiza
  useEffect(() => {
    const alExpirar = () => {
      setUsuario(null)
      setAviso('Tu sesión expiró. Inicia sesión nuevamente.')
      window.location.hash = '#/login'
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
  }, [])

  // respuesta del login: { token, tokenRenovacion, usuario }
  function iniciar(respuesta) {
    guardarSesion(respuesta)
    setUsuario(respuesta.usuario)
    setAviso('')
    window.location.hash = paginaInicial(respuesta.usuario)
  }

  function cerrar() {
    borrarSesion()
    setUsuario(null)
    window.location.hash = '#/'
  }

  function actualizarUsuario(nuevo) {
    setUsuario(actualizarUsuarioSesion(nuevo)?.usuario ?? null)
  }

  return { usuario, verificando, aviso, iniciar, cerrar, actualizarUsuario }
}

function App() {
  const { pagina, id } = useRuta()
  // El estado del carrito vive en App porque lo usan varias páginas
  const [carrito, setCarrito] = useState(() => leerGuardado('pms_carrito', []))
  const sesion = useSesion()
  const { usuario, verificando } = sesion

  useEffect(() => {
    localStorage.setItem('pms_carrito', JSON.stringify(carrito))
  }, [carrito])

  const agregar = (producto) => setCarrito((actual) => agregarAlCarrito(actual, producto))
  const quitar = (idProducto) => setCarrito((actual) => quitarDelCarrito(actual, idProducto))
  const cambiarCant = (idProducto, cantidad) => setCarrito((actual) => cambiarCantidad(actual, idProducto, cantidad))
  const vaciar = () => setCarrito([])

  let vista
  switch (pagina) {
    case '': vista = <Inicio alAgregar={agregar} />; break
    case 'productos': vista = <Productos alAgregar={agregar} />; break
    case 'producto': vista = <DetalleProducto id={id} alAgregar={agregar} />; break
    case 'categorias': vista = <Categorias slug={id} alAgregar={agregar} />; break
    case 'ofertas': vista = <Ofertas alAgregar={agregar} />; break
    case 'carrito':
      vista = <Carrito carrito={carrito} usuario={usuario} alCambiarCantidad={cambiarCant} alQuitar={quitar} alVaciar={vaciar} />
      break
    case 'checkout': vista = <Checkout carrito={carrito} usuario={usuario} alConfirmar={vaciar} />; break
    case 'registro': vista = <Registro />; break
    case 'login': vista = <Login alIniciarSesion={sesion.iniciar} aviso={sesion.aviso} />; break
    case 'perfil':
      vista = (
        <RutaProtegida usuario={usuario} verificando={verificando} mensajeSinSesion="Debes iniciar sesión para ver tu perfil.">
          <Perfil usuario={usuario} alGuardar={sesion.actualizarUsuario} />
        </RutaProtegida>
      )
      break
    case 'nosotros': vista = <Nosotros />; break
    case 'blogs': vista = <Blogs />; break
    case 'blog': vista = <BlogDetalle id={id} />; break
    case 'contacto': vista = <Contacto />; break
    case 'admin':
      vista = (
        <RutaProtegida
          usuario={usuario}
          verificando={verificando}
          permiso="panel"
          mensajeSinSesion="Debes iniciar sesión como administrador o vendedor para entrar a este panel."
        >
          <Admin usuario={usuario} />
        </RutaProtegida>
      )
      break
    default: vista = <p className="text-center py-5">Página no encontrada. <a href="#/">Volver al inicio</a></p>
  }

  return (
    <>
      <Encabezado cantidadCarrito={contarUnidades(carrito)} usuario={usuario} alCerrarSesion={sesion.cerrar} />
      {sesion.aviso && pagina !== 'login' && (
        <Container className="pt-3"><Alert variant="warning" className="mb-0">{sesion.aviso}</Alert></Container>
      )}
      <main>{vista}</main>
      <PiePagina />
    </>
  )
}

export default App
