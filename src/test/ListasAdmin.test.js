import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListaOrdenes from '../components/ListaOrdenes.jsx'
import ListaUsuarios from '../components/ListaUsuarios.jsx'
import PanelReportes from '../components/PanelReportes.jsx'

const ORDEN = (numero, extra = {}) => ({
  numero, fecha: '2026-10-24T15:00:00.000Z', cliente: 'Ana Pérez', total: 9000, descuento: 0, regalo: '', estado: 'Pagada', lineas: [], ...extra,
})

describe('<ListaOrdenes />', () => {
  it('sin órdenes muestra un aviso', () => {
    render(<ListaOrdenes ordenes={[]} />)
    expect(screen.getByText('No hay órdenes registradas.')).toBeInTheDocument()
  })

  it('muestra una fila por orden con número, cliente y total', () => {
    render(<ListaOrdenes ordenes={[ORDEN(1001), ORDEN(1002)]} />)
    expect(screen.getByText('#1001')).toBeInTheDocument()
    expect(screen.getByText('#1002')).toBeInTheDocument()
    expect(screen.getAllByText('Ana Pérez').length).toBe(2)
  })

  it('en modo solo lectura muestra el estado como etiqueta (no como lista desplegable)', () => {
    render(<ListaOrdenes ordenes={[ORDEN(1001)]} />)
    expect(screen.getByText('Pagada')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('muestra el descuento aplicado y el regalo de cumpleaños', () => {
    render(<ListaOrdenes ordenes={[ORDEN(1001, { descuento: 1000, regalo: 'Torta gratis' })]} />)
    expect(screen.getByText(/de descuento/)).toBeInTheDocument()
    expect(screen.getByText(/Torta gratis/)).toBeInTheDocument()
  })

  it('con alCambiarEstado el estado es editable y avisa al elegir otro', async () => {
    const usuario = userEvent.setup()
    const alCambiarEstado = jasmine.createSpy()
    render(<ListaOrdenes ordenes={[ORDEN(1001)]} alCambiarEstado={alCambiarEstado} />)

    await usuario.selectOptions(screen.getByLabelText('Estado de la orden 1001'), 'Enviada')

    expect(alCambiarEstado).toHaveBeenCalledWith(1001, 'Enviada')
  })

  it('con conDetalle muestra las líneas, la dirección y los montos de la boleta', async () => {
    const usuario = userEvent.setup()
    const orden = ORDEN(1001, {
      correo: 'ana@duoc.cl', direccion: 'Calle 1, Chillán', subtotal: 10000, descuento: 1000, motivo: 'Código FELICES50', total: 9000,
      lineas: [{ id: 5, nombre: 'Mousse de Chocolate', precio: 5000, cantidad: 2 }],
    })
    render(<ListaOrdenes ordenes={[orden]} conDetalle />)

    await usuario.click(screen.getByRole('button', { name: 'Ver detalle de la orden 1001' }))

    expect(await screen.findByText('Boleta #1001')).toBeInTheDocument()
    expect(screen.getByText('Mousse de Chocolate')).toBeInTheDocument()
    expect(screen.getByText(/Calle 1, Chillán/)).toBeInTheDocument()
    expect(screen.getByText(/Código FELICES50:/)).toBeInTheDocument()
  })

  it('una orden rechazada se muestra distinta (etiqueta roja)', () => {
    render(<ListaOrdenes ordenes={[ORDEN(1001, { estado: 'Pago rechazado' })]} />)
    expect(screen.getByText('Pago rechazado')).toHaveClass('bg-danger')
  })
})

describe('<ListaUsuarios />', () => {
  const USUARIOS = [
    { id: 1, nombre: 'Admin', correo: 'admin@duoc.cl', rol: 'Administrador' },
    { id: 3, nombre: 'Ana', correo: 'ana@duoc.cl', rol: 'Cliente' },
  ]

  it('sin usuarios muestra un aviso', () => {
    render(<ListaUsuarios usuarios={[]} />)
    expect(screen.getByText('No hay usuarios registrados.')).toBeInTheDocument()
  })

  it('lista a cada usuario con su rol', () => {
    render(<ListaUsuarios usuarios={USUARIOS} idActual={1} />)
    expect(screen.getByText('ana@duoc.cl')).toBeInTheDocument()
    expect(screen.getByLabelText('Rol de ana@duoc.cl')).toHaveValue('Cliente')
  })

  it('se puede asignar el rol Vendedor', () => {
    render(<ListaUsuarios usuarios={USUARIOS} idActual={1} />)
    expect(screen.getAllByRole('option', { name: 'Vendedor' })).toHaveSize(2)
  })

  it('cambiar el rol avisa con el usuario y el nuevo rol', async () => {
    const usuario = userEvent.setup()
    const alCambiarRol = jasmine.createSpy()
    render(<ListaUsuarios usuarios={USUARIOS} idActual={1} alCambiarRol={alCambiarRol} />)

    await usuario.selectOptions(screen.getByLabelText('Rol de ana@duoc.cl'), 'Administrador')

    expect(alCambiarRol).toHaveBeenCalledWith(USUARIOS[1], 'Administrador')
  })

  it('eliminar avisa con el usuario', async () => {
    const usuario = userEvent.setup()
    const alEliminar = jasmine.createSpy()
    render(<ListaUsuarios usuarios={USUARIOS} idActual={1} alEliminar={alEliminar} />)

    await usuario.click(screen.getByRole('button', { name: 'Eliminar a ana@duoc.cl' }))

    expect(alEliminar).toHaveBeenCalledWith(USUARIOS[1])
  })

  it('el administrador con sesión no puede cambiarse el rol ni eliminarse a sí mismo', () => {
    render(<ListaUsuarios usuarios={USUARIOS} idActual={1} />)
    expect(screen.getByLabelText('Rol de admin@duoc.cl')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar a admin@duoc.cl' })).toBeDisabled()
  })
})

describe('<PanelReportes />', () => {
  it('sin ventas muestra ceros y un mensaje', () => {
    render(<PanelReportes ordenes={[]} />)
    expect(screen.getByText('Órdenes pagadas')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay ventas para analizar.')).toBeInTheDocument()
  })

  it('con ventas muestra el total y los productos más vendidos', () => {
    const ordenes = [ORDEN(1001, { total: 20000, lineas: [{ nombre: 'Mousse', cantidad: 4 }] })]
    render(<PanelReportes ordenes={ordenes} />)
    expect(screen.getByText('Mousse')).toBeInTheDocument()
    expect(screen.getByText('4 u.')).toBeInTheDocument()
  })
})
