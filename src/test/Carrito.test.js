import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Carrito from '../pages/Carrito.jsx'
import Encabezado from '../components/Encabezado.jsx'
import { renderizarPagina, renderizarConRouter, ponerCarrito, leerCarritoGuardado } from './rutas.js'

const CARRITO = [
  { id: 5, nombre: 'Mousse de Chocolate', precio: 5000, imagen: '/img/logo.png', cantidad: 2 },
  { id: 1, nombre: 'Torta Cuadrada de Chocolate', precio: 45000, imagen: '/img/logo.png', cantidad: 1 },
]

// El carrito ahora vive en un contexto: se deja guardado y la página lo lee de ahí
function renderCarrito(carrito) {
  ponerCarrito(carrito)
  return renderizarPagina(<Carrito />, { ruta: '/carrito' })
}

describe('<Carrito />', () => {
  it('vacío: muestra el mensaje y no la tabla', () => {
    renderCarrito([])
    expect(screen.getByText('Tu carrito está vacío por el momento.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('muestra una fila por producto y el total', () => {
    renderCarrito(CARRITO)
    // 1 fila de encabezado + 2 productos
    expect(screen.getAllByRole('row')).toHaveSize(3)
    expect(screen.getByText('Total: $55.000')).toBeInTheDocument()
  })

  it('el botón + suma una unidad, Eliminar quita la línea y Vaciar deja el carrito vacío', async () => {
    const usuario = userEvent.setup()
    renderCarrito(CARRITO)

    await usuario.click(screen.getByRole('button', { name: 'Sumar Mousse de Chocolate' }))
    expect(leerCarritoGuardado().find((l) => l.id === 5).cantidad).toBe(3)

    await usuario.click(screen.getAllByRole('button', { name: 'Eliminar' })[1])
    expect(leerCarritoGuardado().map((l) => l.id)).toEqual([5])

    await usuario.click(screen.getByRole('button', { name: 'Vaciar carrito' }))
    expect(leerCarritoGuardado()).toEqual([])
    expect(screen.getByText('Tu carrito está vacío por el momento.')).toBeInTheDocument()
  })
})

describe('<Encabezado />', () => {
  it('muestra la cantidad del carrito y los botones de sesión', () => {
    renderizarConRouter(<Encabezado cantidadCarrito={3} usuario={null} alCerrarSesion={jasmine.createSpy()} />)
    expect(screen.getByText(/Carrito/)).toHaveTextContent('Carrito 3')
    expect(screen.getByText('Iniciar sesión')).toHaveAttribute('href', '/login')
  })

  it('con sesión iniciada saluda al usuario y permite cerrar sesión', async () => {
    const usuario = userEvent.setup()
    const alCerrarSesion = jasmine.createSpy()
    renderizarConRouter(<Encabezado cantidadCarrito={0} usuario={{ nombre: 'Ana Pérez', correo: 'ana@duoc.cl', rol: 'Cliente' }} alCerrarSesion={alCerrarSesion} />)

    expect(screen.getByText('Hola, Ana Pérez')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(alCerrarSesion).toHaveBeenCalledTimes(1)
  })
})
