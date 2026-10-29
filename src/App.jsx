import { useState, useEffect } from 'react'
import Encabezado from './components/Encabezado.jsx'
import PiePagina from './components/PiePagina.jsx'
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
import { obtenerUsuario } from './data/usuarios.js'

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

function App() {
  const { pagina, id } = useRuta()
  // El estado del carrito vive en App porque lo usan varias páginas
  const [carrito, setCarrito] = useState(() => leerGuardado('pms_carrito', []))
  // Se guarda solo el correo de quien inició sesión; sus datos se leen de data/usuarios.js
  const [correoSesion, setCorreoSesion] = useState(() => leerGuardado('pms_usuario', null))
  const [, setVersion] = useState(0) // se usa para volver a leer el usuario tras editar su perfil
  const usuario = (correoSesion && obtenerUsuario(correoSesion)) || null

  // Persistencia: cada vez que cambia el carrito o la sesión, se guarda en localStorage
  useEffect(() => {
    localStorage.setItem('pms_carrito', JSON.stringify(carrito))
  }, [carrito])
  useEffect(() => {
    localStorage.setItem('pms_usuario', JSON.stringify(correoSesion))
  }, [correoSesion])

  const agregar = (producto) => setCarrito((actual) => agregarAlCarrito(actual, producto))
  const quitar = (idProducto) => setCarrito((actual) => quitarDelCarrito(actual, idProducto))
  const cambiarCant = (idProducto, cantidad) => setCarrito((actual) => cambiarCantidad(actual, idProducto, cantidad))
  const vaciar = () => setCarrito([])

  function iniciarSesion(correo) {
    setCorreoSesion(correo)
    window.location.hash = '#/'
  }
  function cerrarSesion() {
    setCorreoSesion(null)
    window.location.hash = '#/'
  }

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
    case 'login': vista = <Login alIniciarSesion={iniciarSesion} />; break
    case 'perfil': vista = <Perfil usuario={usuario} alGuardar={() => setVersion((v) => v + 1)} />; break
    case 'nosotros': vista = <Nosotros />; break
    case 'blogs': vista = <Blogs />; break
    case 'blog': vista = <BlogDetalle id={id} />; break
    case 'contacto': vista = <Contacto />; break
    case 'admin': vista = <Admin usuario={usuario} />; break
    default: vista = <p className="text-center py-5">Página no encontrada. <a href="#/">Volver al inicio</a></p>
  }

  return (
    <>
      <Encabezado cantidadCarrito={contarUnidades(carrito)} usuario={usuario} alCerrarSesion={cerrarSesion} />
      <main>{vista}</main>
      <PiePagina />
    </>
  )
}

export default App
