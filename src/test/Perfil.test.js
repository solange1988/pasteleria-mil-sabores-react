import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Perfil from '../pages/Perfil.jsx'
import { registrarUsuario, obtenerUsuario } from '../data/usuarios.js'
import { crearOrden } from '../data/ordenes.js'

const TOTALES = { subtotal: 5000, descuento: 0, motivo: '', total: 5000, regalo: '' }

function crearAna(extra = {}) {
  registrarUsuario({ nombre: 'Ana Pérez', correo: 'ana@duoc.cl', contrasena: 'clave123', ...extra })
  return obtenerUsuario('ana@duoc.cl')
}

describe('<Perfil />', () => {
  it('sin sesión pide iniciar sesión', () => {
    render(<Perfil usuario={null} alGuardar={() => {}} />)
    expect(screen.getByText('Debes iniciar sesión para ver tu perfil.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#/login')
  })

  it('con sesión muestra los datos del usuario ya cargados en el formulario', () => {
    render(<Perfil usuario={crearAna({ telefono: '+56911112222' })} alGuardar={() => {}} />)
    expect(screen.getByText('ana@duoc.cl')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
    expect(screen.getByLabelText('Teléfono (opcional)')).toHaveValue('+56911112222')
  })

  it('guarda los cambios, avisa al padre y confirma', async () => {
    const usuario = userEvent.setup()
    const alGuardar = jasmine.createSpy()
    render(<Perfil usuario={crearAna()} alGuardar={alGuardar} />)

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Gómez')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(obtenerUsuario('ana@duoc.cl').nombre).toBe('Ana Gómez')
    expect(alGuardar).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Tus datos se actualizaron correctamente.')).toBeInTheDocument()
  })

  it('un nombre inválido no se guarda y muestra el error', async () => {
    const usuario = userEvent.setup()
    const alGuardar = jasmine.createSpy()
    render(<Perfil usuario={crearAna()} alGuardar={alGuardar} />)

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(alGuardar).not.toHaveBeenCalled()
    expect(obtenerUsuario('ana@duoc.cl').nombre).toBe('Ana Pérez')
  })

  it('sin descuentos asociados lo informa', () => {
    render(<Perfil usuario={crearAna()} alGuardar={() => {}} />)
    expect(screen.getByText('Por ahora no tienes descuentos asociados a tu cuenta.')).toBeInTheDocument()
  })

  it('con el código FELICES50 muestra el 10% de descuento', () => {
    render(<Perfil usuario={crearAna({ codigo: 'FELICES50' })} alGuardar={() => {}} />)
    expect(screen.getByText(/Tienes 10% de descuento/)).toBeInTheDocument()
  })

  it('el historial de compras muestra solo las órdenes de este cliente', () => {
    const ana = crearAna()
    crearOrden({ correo: 'ana@duoc.cl', cliente: 'Ana Pérez', direccion: 'x', lineas: [], totales: TOTALES })
    crearOrden({ correo: 'otro@gmail.com', cliente: 'Otro', direccion: 'x', lineas: [], totales: TOTALES })
    render(<Perfil usuario={ana} alGuardar={() => {}} />)
    expect(screen.getByText('#1001')).toBeInTheDocument()
    expect(screen.queryByText('#1002')).toBeNull()
  })

  it('sin compras el historial muestra el aviso de lista vacía', () => {
    render(<Perfil usuario={crearAna()} alGuardar={() => {}} />)
    expect(screen.getByText('No hay órdenes registradas.')).toBeInTheDocument()
  })
})
