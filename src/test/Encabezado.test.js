import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Encabezado from '../components/Encabezado.jsx'
import TarjetaProducto from '../components/TarjetaProducto.jsx'

describe('<Encabezado />', () => {
  it('sin sesión muestra Iniciar sesión y Registrarse', () => {
    render(<Encabezado cantidadCarrito={0} usuario={null} alCerrarSesion={() => {}} />)
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#/login')
    expect(screen.getByRole('button', { name: 'Registrarse' })).toHaveAttribute('href', '#/registro')
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).toBeNull()
  })

  it('muestra la cantidad de productos del carrito', () => {
    render(<Encabezado cantidadCarrito={7} usuario={null} alCerrarSesion={() => {}} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('tiene los enlaces de las vistas nuevas (Categorías y Ofertas)', () => {
    render(<Encabezado cantidadCarrito={0} usuario={null} alCerrarSesion={() => {}} />)
    expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute('href', '#/categorias')
    expect(screen.getByRole('link', { name: 'Ofertas' })).toHaveAttribute('href', '#/ofertas')
  })

  it('un cliente ve su nombre y NO ve el enlace Admin', () => {
    render(<Encabezado cantidadCarrito={0} usuario={{ nombre: 'Ana', correo: 'a@duoc.cl', rol: 'Cliente' }} alCerrarSesion={() => {}} />)
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
  })

  it('un administrador SÍ ve el enlace Admin', () => {
    render(<Encabezado cantidadCarrito={0} usuario={{ nombre: 'Jefa', correo: 'j@duoc.cl', rol: 'Administrador' }} alCerrarSesion={() => {}} />)
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '#/admin')
  })

  it('Cerrar sesión avisa al padre', async () => {
    const usuario = userEvent.setup()
    const alCerrarSesion = jasmine.createSpy()
    render(<Encabezado cantidadCarrito={0} usuario={{ nombre: 'Ana', correo: 'a@duoc.cl', rol: 'Cliente' }} alCerrarSesion={alCerrarSesion} />)

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(alCerrarSesion).toHaveBeenCalledTimes(1)
  })
})

describe('<TarjetaProducto /> con oferta', () => {
  const EN_OFERTA = { id: 2, nombre: 'Torta de Frutas', categoria: 'Tortas', precio: 50000, precioOferta: 42500, stock: 4, imagen: '/img/x.jpg' }

  it('muestra el precio normal tachado, el precio de oferta y la etiqueta -15%', () => {
    render(<TarjetaProducto producto={EN_OFERTA} alAgregar={() => {}} />)
    expect(screen.getByText('-15%')).toBeInTheDocument()
    expect(screen.getByText(/50\.000/).tagName).toBe('DEL')
    expect(screen.getByText(/42\.500/)).toBeInTheDocument()
  })

  it('un producto sin oferta no muestra etiqueta de descuento', () => {
    render(<TarjetaProducto producto={{ ...EN_OFERTA, precioOferta: 0 }} alAgregar={() => {}} />)
    expect(screen.queryByText(/%/)).toBeNull()
  })
})
