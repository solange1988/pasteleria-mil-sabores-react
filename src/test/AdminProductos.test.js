import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminProductos from '../components/AdminProductos.jsx'
import { simularApi, responder, errorApi, productosPrueba, conSesion, ADMIN } from './apiFalsa.js'

// Backend falso con estado: los productos creados/editados/eliminados se reflejan al recargar la lista
function backendProductos() {
  let productos = productosPrueba()
  const llamadas = simularApi({
    'GET /productos': () => productos,
    'POST /productos': ({ cuerpo }) => {
      const nuevo = { id: 17, ...cuerpo }
      productos = [...productos, nuevo]
      return responder(201, nuevo)
    },
    'PUT /productos/5': ({ cuerpo }) => {
      productos = productos.map((p) => (p.id === 5 ? { ...p, ...cuerpo } : p))
      return productos[4]
    },
    'DELETE /productos/5': () => {
      productos = productos.filter((p) => p.id !== 5)
      return responder(204)
    },
    'DELETE /productos/1': errorApi(400, 'No se puede eliminar: el producto aparece en boletas. Puedes dejar su stock en 0.'),
  })
  return { llamadas, actuales: () => productos }
}

describe('<AdminProductos /> (CRUD contra la API)', () => {
  beforeEach(() => conSesion(ADMIN))

  it('LEER: muestra una fila por cada producto que entrega GET /productos', async () => {
    backendProductos()
    render(<AdminProductos />)
    await screen.findByText('Mousse de Chocolate')
    expect(screen.getAllByRole('row').length).toBe(16 + 1) // + encabezado
  })

  it('CREAR: envía POST /productos con los datos y la tabla se actualiza', async () => {
    const { llamadas } = backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await screen.findByText('Mousse de Chocolate')

    await usuario.type(screen.getByLabelText('Nombre'), 'Panna Cotta')
    await usuario.type(screen.getByLabelText('Categoría'), 'Postres Individuales')
    await usuario.type(screen.getByLabelText('Precio'), '5200')
    await usuario.type(screen.getByLabelText('Stock'), '12')
    await usuario.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Panna Cotta')).toBeInTheDocument()
    const post = llamadas.find((l) => l.metodo === 'POST')
    expect(post.cuerpo).toEqual(jasmine.objectContaining({ nombre: 'Panna Cotta', precio: 5200, stock: 12, precioOferta: 0 }))
    expect(post.autorizacion).toBe('Bearer token-acceso')
  })

  it('CREAR con el formulario vacío muestra errores y no llama a la API', async () => {
    const { llamadas } = backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await screen.findByText('Mousse de Chocolate')

    await usuario.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(llamadas.some((l) => l.metodo === 'POST')).toBeFalse()
  })

  it('una oferta igual o mayor al precio se rechaza', async () => {
    backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await screen.findByText('Mousse de Chocolate')
    await usuario.type(screen.getByLabelText('Nombre'), 'X producto')
    await usuario.type(screen.getByLabelText('Categoría'), 'Cat')
    await usuario.type(screen.getByLabelText('Precio'), '1000')
    await usuario.type(screen.getByLabelText('Precio de oferta (opcional)'), '1500')
    await usuario.type(screen.getByLabelText('Stock'), '3')
    await usuario.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(screen.getByText('La oferta debe ser menor al precio normal')).toBeInTheDocument()
  })

  it('EDITAR: carga el producto en el formulario y envía PUT /productos/5', async () => {
    const { actuales } = backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)

    const fila = (await screen.findByText('Mousse de Chocolate')).closest('tr')
    await usuario.click(within(fila).getByRole('button', { name: 'Editar' }))
    expect(screen.getByLabelText('Nombre')).toHaveValue('Mousse de Chocolate')

    await usuario.clear(screen.getByLabelText('Stock'))
    await usuario.type(screen.getByLabelText('Stock'), '77')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(actuales()[4].stock).toBe(77))
    expect(await screen.findByRole('button', { name: 'Crear producto' })).toBeInTheDocument()
  })

  it('EDITAR y luego Cancelar vuelve al formulario de producto nuevo', async () => {
    backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    await usuario.click(within((await screen.findByText('Mousse de Chocolate')).closest('tr')).getByRole('button', { name: 'Editar' }))
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('button', { name: 'Crear producto' })).toBeInTheDocument()
  })

  it('ELIMINAR: envía DELETE /productos/5 y quita la fila', async () => {
    backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    const fila = (await screen.findByText('Mousse de Chocolate')).closest('tr')

    await usuario.click(within(fila).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(screen.queryByText('Mousse de Chocolate')).toBeNull())
  })

  it('si el backend rechaza la eliminación, muestra su mensaje', async () => {
    backendProductos()
    const usuario = userEvent.setup()
    render(<AdminProductos />)
    const fila = (await screen.findByText('Torta Cuadrada de Chocolate')).closest('tr')

    await usuario.click(within(fila).getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText(/el producto aparece en boletas/)).toBeInTheDocument()
    expect(screen.getByText('Torta Cuadrada de Chocolate')).toBeInTheDocument()
  })

  it('en modo solo lectura (vendedor) no hay formulario ni botones de edición', async () => {
    backendProductos()
    render(<AdminProductos editable={false} />)
    await screen.findByText('Mousse de Chocolate')
    expect(screen.queryByRole('button', { name: 'Crear producto' })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Ver detalle' })).toHaveSize(16)
  })
})
