import { render, screen, waitFor } from '@testing-library/react'
import App from '../App.jsx'
import { registrarUsuario } from '../data/usuarios.js'

function irA(hash) {
  window.location.hash = hash
}

describe('<App /> (navegación)', () => {
  afterEach(() => { window.location.hash = '' })

  it('en la ruta vacía muestra el inicio', () => {
    irA('')
    render(<App />)
    expect(screen.getAllByText(/Pastelería Mil Sabores/).length).toBeGreaterThan(0)
  })

  it('una ruta desconocida muestra "Página no encontrada"', () => {
    irA('#/no-existe')
    render(<App />)
    expect(screen.getByText(/Página no encontrada/)).toBeInTheDocument()
  })

  it('cambia de vista cuando cambia el hash', async () => {
    irA('#/nosotros')
    render(<App />)
    irA('#/ofertas')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Ofertas/ })).toBeInTheDocument())
  })

  it('el panel admin sin sesión pide iniciar sesión', () => {
    irA('#/admin')
    render(<App />)
    expect(screen.getByText(/Debes iniciar sesión como administrador/)).toBeInTheDocument()
  })

  it('con sesión de administrador entra al panel y guarda la sesión en localStorage', () => {
    localStorage.setItem('pms_usuario', JSON.stringify('admin@duoc.cl'))
    irA('#/admin')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('pms_usuario'))).toBe('admin@duoc.cl')
  })

  it('recupera el carrito guardado y muestra el perfil de un cliente', () => {
    registrarUsuario({ nombre: 'Ana Pérez', correo: 'ana@duoc.cl', contrasena: 'clave123' })
    localStorage.setItem('pms_usuario', JSON.stringify('ana@duoc.cl'))
    irA('#/perfil')
    render(<App />)
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
  })
})
