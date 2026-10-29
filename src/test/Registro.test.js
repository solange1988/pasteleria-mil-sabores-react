import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Registro from '../pages/Registro.jsx'
import { listarUsuarios, obtenerUsuario } from '../data/usuarios.js'

async function llenar(usuario, extra = {}) {
  const v = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', confirmarCorreo: 'ana@duoc.cl', contrasena: 'clave123', confirmarContrasena: 'clave123', ...extra }
  await usuario.type(screen.getByLabelText('Nombre completo'), v.nombre)
  await usuario.type(screen.getByLabelText('Correo electrónico'), v.correo)
  await usuario.type(screen.getByLabelText('Confirmar correo'), v.confirmarCorreo)
  await usuario.type(screen.getByLabelText('Contraseña'), v.contrasena)
  await usuario.type(screen.getByLabelText('Confirmar contraseña'), v.confirmarContrasena)
}

describe('<Registro />', () => {
  it('enviar vacío muestra errores y no registra a nadie', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(4)
    expect(listarUsuarios().length).toBe(1) // solo el administrador
  })

  it('con datos válidos guarda al usuario y muestra el mensaje de éxito', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await llenar(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(screen.getByText(/¡Registro exitoso!/)).toBeInTheDocument()
    expect(obtenerUsuario('ana@duoc.cl').nombre).toBe('Ana Pérez')
    expect(obtenerUsuario('ana@duoc.cl').rol).toBe('Cliente')
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('') // el formulario se limpia
  })

  it('un correo que no coincide con la confirmación se rechaza', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await llenar(usuario, { confirmarCorreo: 'otra@duoc.cl' })
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getByText('Los valores de correo no coinciden')).toBeInTheDocument()
    expect(listarUsuarios().length).toBe(1)
  })

  it('un dominio de correo no permitido se rechaza', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await llenar(usuario, { correo: 'ana@hotmail.com', confirmarCorreo: 'ana@hotmail.com' })
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getByText(/Solo se aceptan correos/)).toBeInTheDocument()
  })

  it('un correo ya registrado muestra "Ese correo ya está registrado."', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await llenar(usuario, { correo: 'admin@duoc.cl', confirmarCorreo: 'admin@duoc.cl' })
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getByText('Ese correo ya está registrado.')).toBeInTheDocument()
    expect(listarUsuarios().length).toBe(1)
  })

  it('con el código FELICES50 el mensaje de éxito informa el 10% de descuento', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await llenar(usuario)
    await usuario.type(screen.getByLabelText('Código promocional (opcional)'), 'FELICES50')
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getByText(/Tienes 10% de descuento/)).toBeInTheDocument()
  })

  it('un código promocional inventado se rechaza', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await llenar(usuario)
    await usuario.type(screen.getByLabelText('Código promocional (opcional)'), 'INVENTADO')
    await usuario.click(screen.getByRole('button', { name: 'Registrar' }))
    expect(screen.getByText('El código promocional no es válido')).toBeInTheDocument()
  })

  it('al elegir una región se cargan solo las comunas de esa región', async () => {
    const usuario = userEvent.setup()
    render(<Registro />)
    await usuario.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble')
    expect(screen.getByRole('option', { name: 'Chillán' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Temuco' })).toBeNull()
  })
})
