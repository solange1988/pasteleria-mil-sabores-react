import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderizarApp, ubicacion } from './rutas.js'
import { leerSesion } from '../auth/sesion.js'
import { simularApi, errorApi, conSesion, respuestaLogin, productosPrueba, ofertasDe, ADMIN, VENDEDOR, CLIENTE } from './apiFalsa.js'

// Respuestas mínimas para que las páginas carguen
const catalogo = () => {
  const p = productosPrueba()
  return { 'GET /productos': p, 'GET /productos/ofertas': ofertasDe(p), 'GET /boletas/mias': [], 'GET /boletas': [] }
}

describe('<App /> (navegación)', () => {
  it('en la ruta vacía muestra el inicio', () => {
    simularApi(catalogo())
    renderizarApp('/')
    expect(screen.getAllByText(/Pastelería Mil Sabores/).length).toBeGreaterThan(0)
  })

  it('una ruta desconocida muestra "Página no encontrada"', () => {
    renderizarApp('/no-existe')
    expect(screen.getByText(/Página no encontrada/)).toBeInTheDocument()
  })

  it('cambia de vista al hacer clic en el menú (React Router, sin recargar la página)', async () => {
    simularApi(catalogo())
    renderizarApp('/nosotros')
    await userEvent.setup().click(screen.getByRole('link', { name: 'Ofertas' }))
    expect(await screen.findByRole('heading', { name: /Ofertas/ })).toBeInTheDocument()
    expect(ubicacion()).toBe('/ofertas')
  })

  it('las rutas con parámetros leen el id de la URL (/producto/:id)', async () => {
    const productos = productosPrueba()
    simularApi({ ...catalogo(), 'GET /productos/5': productos.find((p) => p.id === 5) })
    renderizarApp('/producto/5')
    expect(await screen.findByRole('heading', { name: productos.find((p) => p.id === 5).nombre })).toBeInTheDocument()
  })
})

describe('<App /> (sesión y restricciones de acceso)', () => {
  it('el panel sin sesión pide iniciar sesión', () => {
    renderizarApp('/admin')
    expect(screen.getByText(/Debes iniciar sesión como administrador o vendedor/)).toBeInTheDocument()
  })

  it('el perfil sin sesión pide iniciar sesión', () => {
    renderizarApp('/perfil')
    expect(screen.getByText('Debes iniciar sesión para ver tu perfil.')).toBeInTheDocument()
  })

  it('un cliente que escribe /admin en la URL ve "No tienes permisos"', async () => {
    conSesion(CLIENTE)
    simularApi({ ...catalogo(), 'GET /usuarios/perfil': CLIENTE })
    renderizarApp('/admin')
    expect(await screen.findByText('No tienes permisos para ver esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Panel de administración' })).toBeNull()
  })

  it('AL RECARGAR: recupera la sesión guardada, la confirma con el backend y entra al panel', async () => {
    conSesion(ADMIN)
    const llamadas = simularApi({ ...catalogo(), 'GET /usuarios/perfil': ADMIN })
    renderizarApp('/admin')
    expect(screen.getByText('Verificando sesión...')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument()
    expect(llamadas[0]).toEqual(jasmine.objectContaining({ ruta: '/usuarios/perfil', autorizacion: 'Bearer token-acceso' }))
  })

  it('AL RECARGAR: si el backend cambió el rol, se usa el rol actual (no el guardado)', async () => {
    conSesion({ ...CLIENTE, rol: 'Administrador' }) // alguien editó localStorage a mano
    simularApi({ ...catalogo(), 'GET /usuarios/perfil': CLIENTE })
    renderizarApp('/admin')
    expect(await screen.findByText('No tienes permisos para ver esta página.')).toBeInTheDocument()
    expect(leerSesion().usuario.rol).toBe('Cliente')
  })

  it('AL RECARGAR: si el token ya no es válido, borra la sesión y pide iniciar sesión', async () => {
    conSesion(ADMIN)
    simularApi({ ...catalogo(), 'GET /usuarios/perfil': errorApi(401, 'token vencido'), 'POST /auth/renovar': errorApi(401, 'expiró') })
    renderizarApp('/admin')
    expect(await screen.findByText(/Tu sesión expiró/)).toBeInTheDocument()
    expect(leerSesion()).toBeNull()
  })

  it('el vendedor entra a su panel y el menú dice "Panel vendedor"', async () => {
    conSesion(VENDEDOR)
    simularApi({ ...catalogo(), 'GET /usuarios/perfil': VENDEDOR })
    renderizarApp('/admin')
    expect(await screen.findByRole('heading', { name: 'Panel de vendedor' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Panel vendedor' })).toBeInTheDocument()
  })

  it('iniciar sesión guarda la sesión y lleva al administrador al panel', async () => {
    simularApi({ ...catalogo(), 'POST /auth/login': respuestaLogin(ADMIN) })
    const usuario = userEvent.setup()
    renderizarApp('/login')
    await usuario.type(screen.getByLabelText('Correo'), 'admin@duoc.cl')
    await usuario.type(screen.getByLabelText('Contraseña'), 'admin123')
    // hay dos botones "Iniciar sesión": el del encabezado y el del formulario (type="submit")
    await usuario.click(screen.getAllByRole('button', { name: 'Iniciar sesión' }).find((b) => b.type === 'submit'))
    await waitFor(() => expect(ubicacion()).toBe('/admin'))
    expect(leerSesion().usuario.correo).toBe('admin@duoc.cl')
  })

  it('cerrar sesión borra la sesión guardada', async () => {
    conSesion(CLIENTE)
    simularApi({ ...catalogo(), 'GET /usuarios/perfil': CLIENTE })
    renderizarApp('/')
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    expect(leerSesion()).toBeNull()
    expect(ubicacion()).toBe('/')
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })

  it('muestra el perfil del cliente con sus datos', async () => {
    conSesion({ ...CLIENTE, nombre: 'Ana Pérez' })
    simularApi({ ...catalogo(), 'GET /usuarios/perfil': CLIENTE })
    renderizarApp('/perfil')
    expect(await screen.findByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
  })
})
