import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login.jsx'
import { simularApi, simularSinConexion, errorApi, respuestaLogin, ADMIN } from './apiFalsa.js'

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
    render(<Login alIniciarSesion={jasmine.createSpy()} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('el estado del campo cambia cuando el usuario escribe', async () => {
    const usuario = userEvent.setup()
    render(<Login alIniciarSesion={jasmine.createSpy()} />)
    await usuario.type(screen.getByLabelText('Correo'), 'ana@duoc.cl')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@duoc.cl')
  })

  it('al enviar vacío muestra dos errores y NO llama al backend', async () => {
    const llamadas = API_LOGIN()
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getAllByRole('alert')).toHaveSize(2)
    expect(alIniciarSesion).not.toHaveBeenCalled()
    expect(llamadas.length).toBe(0)
  })

  it('con un dominio no permitido muestra el error del correo', async () => {
    const usuario = userEvent.setup()
    render(<Login alIniciarSesion={jasmine.createSpy()} />)
    await ingresar(usuario, 'ana@hotmail.com', '1234')
    expect(screen.getByRole('alert')).toHaveTextContent('Solo se aceptan correos')
  })

  it('con credenciales correctas entrega a App los tokens y el usuario', async () => {
    API_LOGIN()
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await ingresar(usuario, 'admin@duoc.cl', 'admin123')

    await waitFor(() => expect(alIniciarSesion).toHaveBeenCalledWith(respuestaLogin(ADMIN)))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('si el backend responde 401 muestra "Correo o contraseña incorrectos." y NO inicia sesión', async () => {
    API_LOGIN()
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await ingresar(usuario, 'admin@duoc.cl', 'mala1')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(alIniciarSesion).not.toHaveBeenCalled()
  })

  it('si el backend está apagado lo informa', async () => {
    simularSinConexion()
    const usuario = userEvent.setup()
    render(<Login alIniciarSesion={jasmine.createSpy()} />)
    await ingresar(usuario, 'admin@duoc.cl', 'admin123')
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')
  })

  it('muestra el aviso de sesión expirada que le entrega App', () => {
    render(<Login alIniciarSesion={jasmine.createSpy()} aviso="Tu sesión expiró. Inicia sesión nuevamente." />)
    expect(screen.getByText('Tu sesión expiró. Inicia sesión nuevamente.')).toBeInTheDocument()
  })
})
