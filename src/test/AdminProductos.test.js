import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminProductos from '../components/AdminProductos.jsx'
import { listarProductos, obtenerProducto } from '../data/productos.js'

describe('<AdminProductos /> (CRUD)', () => {
  it('LEER: muestra una fila por cada producto', () => {
    render(<AdminProductos />)
    expect(screen.getAllByRole('row').length).toBe(listarProductos().length + 1) // + encabezado
  })

  it('CREAR: con datos válidos agrega el producto a la tabla y a la base de datos', async () => {
    const usuario = userEvent.setup()
    const alCambiar = jasmine.createSpy()
    render(<AdminProductos alCambiar={alCambiar} />)
    const antes = listarProductos().length

    await usuario.type(screen.getByLabelText('Nombre'), 'Panna Cotta')
    await usuario.type(screen.getByLabelText('Categoría'), 'Postres Individuales')
    await usuario.type(screen.getByLabelText('Precio'), '5200')
    await usuario.type(screen.getByLabelText('Stock'), '12')
    await usuario.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(listarProductos().length).toBe(antes + 1)
    expect(screen.getByText('Panna Cotta')).toBeInTheDocument()
    expect(alCambiar).toHaveBeenCalled()
  })

  it('CREAR con el formulario vacío muestra errores y no crea nada', async () => {
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    const antes = listarProductos().length

    await usuario.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(listarProductos().length).toBe(antes)
  })

  it('una oferta igual o mayor al precio se rechaza', async () => {
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await usuario.type(screen.getByLabelText('Nombre'), 'X producto')
    await usuario.type(screen.getByLabelText('Categoría'), 'Cat')
    await usuario.type(screen.getByLabelText('Precio'), '1000')
    await usuario.type(screen.getByLabelText('Precio de oferta (opcional)'), '1500')
    await usuario.type(screen.getByLabelText('Stock'), '3')
    await usuario.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(screen.getByText('La oferta debe ser menor al precio normal')).toBeInTheDocument()
  })

  it('EDITAR: carga el producto en el formulario y guarda los cambios', async () => {
    const usuario = userEvent.setup()
    render(<AdminProductos />)

    const fila = screen.getByText('Mousse de Chocolate').closest('tr')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))
    expect(screen.getByLabelText('Nombre')).toHaveValue('Mousse de Chocolate')

    await usuario.clear(screen.getByLabelText('Stock'))
    await usuario.type(screen.getByLabelText('Stock'), '77')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(obtenerProducto(5).stock).toBe(77)
  })

  it('EDITAR y luego Cancelar vuelve al formulario de producto nuevo', async () => {
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await usuario.click(within(screen.getByText('Mousse de Chocolate').closest('tr')).getByRole('button', { name: 'Editar' }))
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('button', { name: 'Crear producto' })).toBeInTheDocument()
  })

  it('ELIMINAR: quita el producto', async () => {
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    const fila = screen.getByText('Mousse de Chocolate').closest('tr')

    await usuario.click(within(fila).getByRole('button', { name: 'Eliminar' }))

    expect(screen.queryByText('Mousse de Chocolate')).toBeNull()
    expect(obtenerProducto(5)).toBeUndefined()
  })

  it('Restaurar productos originales deja la lista como al principio', async () => {
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await usuario.click(within(screen.getByText('Mousse de Chocolate').closest('tr')).getByRole('button', { name: 'Eliminar' }))
    await usuario.click(screen.getByRole('button', { name: 'Restaurar productos originales' }))
    expect(screen.getByText('Mousse de Chocolate')).toBeInTheDocument()
  })
})
