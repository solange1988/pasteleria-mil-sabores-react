import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Admin from '../pages/Admin.jsx'

const ADMIN = { nombre: 'Jefa', correo: 'admin@duoc.cl', rol: 'Administrador' }

describe('<Admin />', () => {
  it('sin sesión pide iniciar sesión', () => {
    render(<Admin usuario={null} />)
    expect(screen.getByText(/Debes iniciar sesión como administrador/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#/login')
  })

  it('un cliente no tiene permiso para entrar', () => {
    render(<Admin usuario={{ nombre: 'Ana', correo: 'ana@duoc.cl', rol: 'Cliente' }} />)
    expect(screen.getByText('No tienes permisos para ver el panel de administración.')).toBeInTheDocument()
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument()
  })

  it('el administrador ve el panel con sus pestañas', () => {
    render(<Admin usuario={ADMIN} />)
    expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument()
    ;['Productos', 'Stock crítico', 'Órdenes', 'Usuarios', 'Reportes'].forEach((t) => {
      expect(screen.getByRole('tab', { name: t })).toBeInTheDocument()
    })
  })

  it('al cambiar de pestaña muestra el contenido de Usuarios', async () => {
    render(<Admin usuario={ADMIN} />)
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Usuarios' }))
    expect(await screen.findByText('admin@duoc.cl')).toBeInTheDocument()
  })

  it('la pestaña Stock crítico y la de Órdenes se pueden abrir', async () => {
    const u = userEvent.setup()
    render(<Admin usuario={ADMIN} />)
    await u.click(screen.getByRole('tab', { name: 'Stock crítico' }))
    expect(screen.getByRole('tab', { name: 'Stock crítico' })).toHaveAttribute('aria-selected', 'true')
    await u.click(screen.getByRole('tab', { name: 'Órdenes' }))
    expect(screen.getByRole('tab', { name: 'Órdenes' })).toHaveAttribute('aria-selected', 'true')
    await u.click(screen.getByRole('tab', { name: 'Reportes' }))
    expect(screen.getByRole('tab', { name: 'Reportes' })).toHaveAttribute('aria-selected', 'true')
  })
})
