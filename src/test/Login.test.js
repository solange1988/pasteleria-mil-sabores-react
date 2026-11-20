import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login.jsx'
import { leerSesion, EVENTO_SESION_EXPIRADA } from '../auth/sesion.js'
import { simularApi, simularSinConexion, errorApi, respuestaLogin, ADMIN } from './apiFalsa.js'
import { renderizarPagina, ubicacion } from './rutas.js'

// La página de login usa el contexto de sesión (iniciar) y React Router (para redirigir)
const abrirLogin = () => renderizarPagina(<Login />, { ruta: '/login' })

// Backend falso: solo admin@duoc.cl / admin123 es correcto
const API_LOGIN = () =>
  simularApi({
    'POST /auth/login': ({ cuerpo }) =>
      cuerpo.correo === 'admin@duoc.cl' && cuerpo.contrasena === 'admin123'
        ? respuestaLogin(ADMIN)
        : errorApi(401, 'Correo o contraseña incorrectos'),
  })

async function ingresar(usuario, correo, contrasena) {
  await usuario.type(screen.getByLabelText('Correo'), correo)
  await usuario.type(screen.getByLabelText('Contraseña'), contrasena)
  await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('<Login /> (POST /api/v1/auth/login)', () => {
  it('no muestra errores al cargar', () => {
    abrirLogin()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('el estado del campo cambia cuando el usuario escribe', async () => {
    const usuario = userEvent.setup()
    abrirLogin()
    await usuario.type(screen.getByLabelText('Correo'), 'ana@duoc.cl')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@duoc.cl')
  })

  it('al enviar vacío muestra dos errores y NO llama al backend', async () => {
    const llamadas = API_LOGIN()
    const usuario = userEvent.setup()
    abrirLogin()

    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getAllByRole('alert')).toHaveSize(2)
    expect(leerSesion()).toBeNull()
    expect(llamadas.length).toBe(0)
  })

  it('con un dominio no permitido muestra el error del correo', async () => {
    const usuario = userEvent.setup()
    abrirLogin()
    await ingresar(usuario, 'ana@hotmail.com', '1234')
    expect(screen.getByRole('alert')).toHaveTextContent('Solo se aceptan correos')
  })

  it('con credenciales correctas guarda los tokens y el usuario, y lleva al administrador al panel', async () => {
    API_LOGIN()
    const usuario = userEvent.setup()
    abrirLogin()

    await ingresar(usuario, 'admin@duoc.cl', 'admin123')

    await waitFor(() => expect(ubicacion()).toBe('/admin'))
    expect(leerSesion()).toEqual(respuestaLogin(ADMIN))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('si el backend responde 401 muestra "Correo o contraseña incorrectos." y NO inicia sesión', async () => {
    API_LOGIN()
    const usuario = userEvent.setup()
    abrirLogin()

    await ingresar(usuario, 'admin@duoc.cl', 'mala1')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(leerSesion()).toBeNull()
  })

  it('si el backend está apagado lo informa', async () => {
    simularSinConexion()
    const usuario = userEvent.setup()
    abrirLogin()
    await ingresar(usuario, 'admin@duoc.cl', 'admin123')
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')
  })

  it('si el token expira, el contexto de sesión muestra el aviso en el login', () => {
    abrirLogin()
    act(() => window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA)))
    expect(screen.getByText('Tu sesión expiró. Inicia sesión nuevamente.')).toBeInTheDocument()
  })
})
