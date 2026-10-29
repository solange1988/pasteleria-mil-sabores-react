import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TarjetaProducto from '../components/TarjetaProducto.jsx'

const MOUSSE = { id: 5, nombre: 'Mousse de Chocolate', categoria: 'Postres Individuales', precio: 5000, stock: 30, imagen: '/img/mousse-chocolate.jpg' }

describe('<TarjetaProducto />', () => {
  it('renderiza nombre, categoría y precio con formato chileno (props)', () => {
    render(<TarjetaProducto producto={MOUSSE} alAgregar={jasmine.createSpy()} />)

    expect(screen.getByRole('heading', { name: 'Mousse de Chocolate' })).toBeInTheDocument()
    expect(screen.getByText('Postres Individuales')).toBeInTheDocument()
    expect(screen.getByText('$5.000')).toBeInTheDocument()
    expect(screen.getByText('Quedan 30 unidades')).toBeInTheDocument()
  })

  it('al hacer clic avisa hacia arriba con el producto (evento + espía)', async () => {
    const usuario = userEvent.setup()
    const alAgregar = jasmine.createSpy()
    render(<TarjetaProducto producto={MOUSSE} alAgregar={alAgregar} />)

    await usuario.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

    expect(alAgregar).toHaveBeenCalledTimes(1)
    expect(alAgregar).toHaveBeenCalledWith(MOUSSE)
  })

  it('sin stock: muestra "Sin stock" y deshabilita el botón (renderizado condicional)', () => {
    render(<TarjetaProducto producto={{ ...MOUSSE, stock: 0 }} alAgregar={jasmine.createSpy()} />)

    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Añadir al carrito' })).toBeDisabled()
  })
})
