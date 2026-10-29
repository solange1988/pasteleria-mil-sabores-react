import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Catalogo from '../components/Catalogo.jsx'
import Productos from '../pages/Productos.jsx'

const LISTA = [
  { id: 1, nombre: 'Torta Cuadrada de Chocolate', categoria: 'Tortas Cuadradas', precio: 45000, stock: 10, imagen: '/img/logo.png' },
  { id: 5, nombre: 'Mousse de Chocolate', categoria: 'Postres Individuales', precio: 5000, stock: 30, imagen: '/img/logo.png' },
  { id: 9, nombre: 'Empanada de Manzana', categoria: 'Pastelería Tradicional', precio: 3000, stock: 40, imagen: '/img/logo.png' },
]

describe('<Catalogo />', () => {
  it('renderiza una tarjeta por cada producto de la lista', () => {
    render(<Catalogo productos={LISTA} alAgregar={jasmine.createSpy()} />)
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' })).toHaveSize(3)
  })

  it('con la lista vacía muestra un aviso y ninguna tarjeta', () => {
    render(<Catalogo productos={[]} alAgregar={jasmine.createSpy()} />)
    expect(screen.getByText('No se encontraron productos.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('<Productos /> (buscador)', () => {
  it('al escribir en el buscador filtra el catálogo (estado)', async () => {
    localStorage.clear()
    const usuario = userEvent.setup()
    render(<Productos alAgregar={jasmine.createSpy()} />)
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' })).toHaveSize(16)

    await usuario.type(screen.getByLabelText('Buscar productos'), 'brownie')

    expect(screen.getByLabelText('Buscar productos')).toHaveValue('brownie')
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' })).toHaveSize(1)
    expect(screen.getByText('Brownie Sin Gluten')).toBeInTheDocument()
  })
})
