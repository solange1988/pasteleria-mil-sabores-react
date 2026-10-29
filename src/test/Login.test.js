import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login.jsx'
import { registrarUsuario } from '../data/usuarios.js'

describe('<Login />', () => {
  beforeEach(() => {
    registrarUsuario({ nombre: 'Ana Pérez', correo: 'ana@duoc.cl', contrasena: 'clave123' })
  })

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

  it('al enviar vacío muestra dos errores y NO inicia sesión', async () => {
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getAllByRole('alert')).toHaveSize(2)
    expect(alIniciarSesion).not.toHaveBeenCalled()
  })

  it('con un dominio no permitido muestra el error del correo', async () => {
    const usuario = userEvent.setup()
    render(<Login alIniciarSesion={jasmine.createSpy()} />)

    await usuario.type(screen.getByLabelText('Correo'), 'ana@hotmail.com')
    await usuario.type(screen.getByLabelText('Contraseña'), '1234')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Solo se aceptan correos')
  })

  it('con datos válidos llama a alIniciarSesion con el correo', async () => {
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await usuario.type(screen.getByLabelText('Correo'), 'ana@duoc.cl')
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave123')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(alIniciarSesion).toHaveBeenCalledWith('ana@duoc.cl')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('con correo no registrado muestra "Correo o contraseña incorrectos." y NO inicia sesión', async () => {
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await usuario.type(screen.getByLabelText('Correo'), 'nadie@duoc.cl')
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave123')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(alIniciarSesion).not.toHaveBeenCalled()
  })

  it('el administrador precargado puede iniciar sesión', async () => {
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy()
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await usuario.type(screen.getByLabelText('Correo'), 'admin@duoc.cl')
    await usuario.type(screen.getByLabelText('Contraseña'), 'admin123')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(alIniciarSesion).toHaveBeenCalledWith('admin@duoc.cl')
  })
})
