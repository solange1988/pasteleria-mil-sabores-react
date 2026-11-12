import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Admin from '../pages/Admin.jsx'
import { simularApi, responder, productosPrueba, boletaPrueba, conSesion, ADMIN, VENDEDOR, CLIENTE } from './apiFalsa.js'

const API_PANEL = () =>
  simularApi({
    'GET /productos': productosPrueba(),
    'GET /productos/criticos': productosPrueba().filter((p) => p.stock <= 5),
    'GET /boletas': [boletaPrueba()],
    'GET /usuarios': [ADMIN, VENDEDOR, CLIENTE],
    'POST /usuarios': ({ cuerpo }) => responder(201, { id: 4, ...cuerpo }),
    'PATCH /boletas/1001/estado': ({ cuerpo }) => boletaPrueba({ estado: cuerpo.estado }),
  })

describe('<Admin /> como Administrador (acceso total)', () => {
  beforeEach(() => conSesion(ADMIN))

  it('ve el panel con las 5 pestañas', async () => {
    API_PANEL()
    render(<Admin usuario={ADMIN} />)
    expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument()
    ;['Productos', 'Stock crítico', 'Órdenes', 'Usuarios', 'Reportes'].forEach((t) => {
      expect(screen.getByRole('tab', { name: t })).toBeInTheDocument()
    })
    expect(await screen.findByRole('button', { name: 'Crear producto' })).toBeInTheDocument()
  })

  it('la pestaña Usuarios carga la lista desde el backend', async () => {
    API_PANEL()
    render(<Admin usuario={ADMIN} />)
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Usuarios' }))
    expect(await screen.findByText('vendedor@duoc.cl')).toBeInTheDocument()
  })

  it('puede crear un usuario Vendedor', async () => {
    const llamadas = API_PANEL()
    const u = userEvent.setup()
    render(<Admin usuario={ADMIN} />)
    await u.click(screen.getByRole('tab', { name: 'Usuarios' }))
    await screen.findByText('vendedor@duoc.cl')
    // se busca dentro de la pestaña Usuarios (la de Productos puede seguir en pantalla durante la animación)
    const pestana = within(screen.getByRole('tabpanel', { name: 'Usuarios' }))
    await u.type(pestana.getByLabelText('Nombre'), 'Pedro Soto')
    await u.type(pestana.getByLabelText('Correo'), 'pedro@duoc.cl')
    await u.type(pestana.getByLabelText('Contraseña'), 'pedro123')
    await u.click(pestana.getByRole('button', { name: 'Crear' }))
    expect(await screen.findByText('Usuario pedro@duoc.cl creado como Vendedor.')).toBeInTheDocument()
    expect(llamadas.find((l) => l.metodo === 'POST').cuerpo).toEqual(jasmine.objectContaining({ rol: 'Vendedor' }))
  })

  it('Stock crítico, Órdenes y Reportes cargan sus datos', async () => {
    API_PANEL()
    const u = userEvent.setup()
    render(<Admin usuario={ADMIN} />)
    await u.click(screen.getByRole('tab', { name: 'Stock crítico' }))
    expect(await screen.findByText('Cheesecake Sin Azúcar')).toBeInTheDocument()
    await u.click(screen.getByRole('tab', { name: 'Órdenes' }))
    expect(await screen.findByLabelText('Estado de la orden 1001')).toBeInTheDocument()
    await u.click(screen.getByRole('tab', { name: 'Reportes' }))
    expect(await screen.findByText('Órdenes pagadas')).toBeInTheDocument()
  })

  it('cambiar el estado de una orden llama a PATCH /boletas/{numero}/estado', async () => {
    const llamadas = API_PANEL()
    const u = userEvent.setup()
    render(<Admin usuario={ADMIN} />)
    await u.click(screen.getByRole('tab', { name: 'Órdenes' }))
    await u.selectOptions(await screen.findByLabelText('Estado de la orden 1001'), 'Enviada')
    await waitFor(() => expect(llamadas.some((l) => l.metodo === 'PATCH' && l.ruta === '/boletas/1001/estado')).toBeTrue())
    expect(llamadas.find((l) => l.metodo === 'PATCH').cuerpo).toEqual({ estado: 'Enviada' })
  })
})

describe('<Admin /> como Vendedor (solo productos y órdenes)', () => {
  beforeEach(() => conSesion(VENDEDOR))

  it('solo ve las pestañas Productos y Órdenes', () => {
    API_PANEL()
    render(<Admin usuario={VENDEDOR} />)
    expect(screen.getByRole('heading', { name: 'Panel de vendedor' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Productos', 'Órdenes'])
  })

  it('los productos son de solo lectura: sin formulario, sin Editar ni Eliminar, con enlace al detalle', async () => {
    API_PANEL()
    render(<Admin usuario={VENDEDOR} />)
    const fila = (await screen.findByText('Mousse de Chocolate')).closest('tr')
    expect(within(fila).getByRole('button', { name: 'Ver detalle' })).toHaveAttribute('href', '#/producto/5')
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Crear producto' })).toBeNull()
  })

  it('ve la lista de órdenes y su detalle, pero no puede cambiar el estado', async () => {
    API_PANEL()
    const u = userEvent.setup()
    render(<Admin usuario={VENDEDOR} />)
    await u.click(screen.getByRole('tab', { name: 'Órdenes' }))
    expect(await screen.findByText('#1001')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
    await u.click(screen.getByRole('button', { name: 'Ver detalle de la orden 1001' }))
    expect(await screen.findByText('Boleta #1001')).toBeInTheDocument()
    expect(screen.getAllByText('Mousse de Chocolate').length).toBeGreaterThan(0)
  })
})
