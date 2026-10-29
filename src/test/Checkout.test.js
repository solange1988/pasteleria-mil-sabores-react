import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkout from '../pages/Checkout.jsx'
import { actualizarProducto, obtenerProducto } from '../data/productos.js'
import { listarOrdenes } from '../data/ordenes.js'

// Mousse de Chocolate (id 5), 2 unidades
const carritoCon = (id = 5, cantidad = 2) => [{ id, nombre: 'Mousse de Chocolate', precio: 5000, imagen: '/img/x.jpg', cantidad }]

async function llenarDatos(usuario) {
  await usuario.type(screen.getByLabelText('Nombre'), 'Ana')
  await usuario.type(screen.getByLabelText('Apellidos'), 'Pérez')
  await usuario.type(screen.getByLabelText('Correo'), 'ana@duoc.cl')
  await usuario.type(screen.getByLabelText('Calle'), 'Av. Siempre Viva 742')
  await usuario.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble')
  await usuario.selectOptions(screen.getByLabelText('Comuna'), 'Chillán')
}

describe('<Checkout />', () => {
  it('sin productos en el carrito avisa que no hay nada para pagar', () => {
    render(<Checkout carrito={[]} usuario={null} alConfirmar={() => {}} />)
    expect(screen.getByText('No hay productos para pagar.')).toBeInTheDocument()
  })

  it('muestra el total a pagar', () => {
    render(<Checkout carrito={carritoCon()} usuario={null} alConfirmar={() => {}} />)
    expect(screen.getByText(/Total a pagar: \$\s?10\.000/)).toBeInTheDocument()
  })

  it('pagar con el formulario vacío muestra errores y no crea ninguna orden', async () => {
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    render(<Checkout carrito={carritoCon()} usuario={null} alConfirmar={alConfirmar} />)

    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(alConfirmar).not.toHaveBeenCalled()
    expect(listarOrdenes().length).toBe(0)
  })

  it('PAGO CORRECTO: crea la orden #1001, descuenta el stock y vacía el carrito', async () => {
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    actualizarProducto(5, { stock: 10 })
    render(<Checkout carrito={carritoCon(5, 2)} usuario={null} alConfirmar={alConfirmar} />)

    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(screen.getByText(/Se ha realizado la compra. Nro #1001/)).toBeInTheDocument()
    expect(alConfirmar).toHaveBeenCalledTimes(1)
    expect(obtenerProducto(5).stock).toBe(8)
    expect(listarOrdenes()[0].estado).toBe('Pagada')
  })

  it('PAGO CON ERROR: sin stock suficiente se rechaza, no descuenta stock y guarda la orden como rechazada', async () => {
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    actualizarProducto(5, { stock: 1 })
    render(<Checkout carrito={carritoCon(5, 3)} usuario={null} alConfirmar={alConfirmar} />)

    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(screen.getByText(/No se pudo realizar el pago. Nro #1001/)).toBeInTheDocument()
    expect(screen.getByText(/Stock insuficiente para: Mousse de Chocolate/)).toBeInTheDocument()
    expect(alConfirmar).not.toHaveBeenCalled()
    expect(obtenerProducto(5).stock).toBe(1)
    expect(listarOrdenes()[0].estado).toBe('Pago rechazado')
  })

  it('tras un pago rechazado se puede volver al formulario', async () => {
    const usuario = userEvent.setup()
    actualizarProducto(5, { stock: 0 })
    render(<Checkout carrito={carritoCon(5, 1)} usuario={null} alConfirmar={() => {}} />)
    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    await usuario.click(screen.getByRole('button', { name: 'Volver a realizar el pago' }))

    expect(screen.getByText('Información del cliente')).toBeInTheDocument()
  })

  it('con sesión iniciada completa nombre y correo automáticamente', () => {
    render(<Checkout carrito={carritoCon()} usuario={{ nombre: 'Ana Pérez Soto', correo: 'ana@duoc.cl' }} alConfirmar={() => {}} />)
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Pérez Soto')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@duoc.cl')
  })

  it('aplica el descuento del usuario en el total y lo guarda en la orden', async () => {
    const usuario = userEvent.setup()
    actualizarProducto(5, { stock: 10 })
    const cuenta = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', codigo: 'FELICES50' }
    render(<Checkout carrito={carritoCon(5, 2)} usuario={cuenta} alConfirmar={() => {}} />)

    expect(screen.getByText(/Código FELICES50/)).toBeInTheDocument()
    expect(screen.getByText(/Total a pagar: \$\s?9\.000/)).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Calle'), 'Av. Siempre Viva 742')
    await usuario.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble')
    await usuario.selectOptions(screen.getByLabelText('Comuna'), 'Chillán')
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    const orden = listarOrdenes()[0]
    expect(orden.descuento).toBe(1000)
    expect(orden.total).toBe(9000)
  })
})
