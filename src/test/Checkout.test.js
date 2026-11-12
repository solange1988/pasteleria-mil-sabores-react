import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkout from '../pages/Checkout.jsx'
import { simularApi, simularSinConexion, responder, boletaPrueba, conSesion, CLIENTE } from './apiFalsa.js'

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

describe('<Checkout /> (POST /api/v1/boletas)', () => {
  it('sin productos en el carrito avisa que no hay nada para pagar', () => {
    render(<Checkout carrito={[]} usuario={null} alConfirmar={() => {}} />)
    expect(screen.getByText('No hay productos para pagar.')).toBeInTheDocument()
  })

  it('muestra el total a pagar', () => {
    render(<Checkout carrito={carritoCon()} usuario={null} alConfirmar={() => {}} />)
    expect(screen.getByText(/Total a pagar: \$\s?10\.000/)).toBeInTheDocument()
  })

  it('pagar con el formulario vacío muestra errores y no llama a la API', async () => {
    const llamadas = simularApi({})
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    render(<Checkout carrito={carritoCon()} usuario={null} alConfirmar={alConfirmar} />)

    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(alConfirmar).not.toHaveBeenCalled()
    expect(llamadas.length).toBe(0)
  })

  it('PAGO CORRECTO: envía la compra, muestra la boleta #1001 y vacía el carrito', async () => {
    const llamadas = simularApi({ 'POST /boletas': responder(201, boletaPrueba()) })
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    render(<Checkout carrito={carritoCon(5, 2)} usuario={null} alConfirmar={alConfirmar} />)

    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/Se ha realizado la compra. Nro #1001/)).toBeInTheDocument()
    expect(alConfirmar).toHaveBeenCalledTimes(1)
    expect(llamadas[0].cuerpo).toEqual({
      correo: 'ana@duoc.cl',
      cliente: 'Ana Pérez',
      direccion: 'Av. Siempre Viva 742, Chillán, Región de Ñuble',
      lineas: [{ productoId: 5, cantidad: 2 }],
    })
  })

  it('PAGO RECHAZADO: si el backend indica falta de stock, lo informa y NO vacía el carrito', async () => {
    simularApi({
      'POST /boletas': responder(201, boletaPrueba({ estado: 'Pago rechazado', faltantes: ['Mousse de Chocolate'] })),
    })
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    render(<Checkout carrito={carritoCon(5, 3)} usuario={null} alConfirmar={alConfirmar} />)

    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/No se pudo realizar el pago. Nro #1001/)).toBeInTheDocument()
    expect(screen.getByText(/Stock insuficiente para: Mousse de Chocolate/)).toBeInTheDocument()
    expect(alConfirmar).not.toHaveBeenCalled()
  })

  it('tras un pago rechazado se puede volver al formulario', async () => {
    simularApi({ 'POST /boletas': responder(201, boletaPrueba({ estado: 'Pago rechazado', faltantes: ['Mousse de Chocolate'] })) })
    const usuario = userEvent.setup()
    render(<Checkout carrito={carritoCon(5, 1)} usuario={null} alConfirmar={() => {}} />)
    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    await usuario.click(await screen.findByRole('button', { name: 'Volver a realizar el pago' }))

    expect(screen.getByText('Información del cliente')).toBeInTheDocument()
  })

  it('si el backend está apagado muestra el error y no vacía el carrito', async () => {
    simularSinConexion()
    const usuario = userEvent.setup()
    const alConfirmar = jasmine.createSpy()
    render(<Checkout carrito={carritoCon()} usuario={null} alConfirmar={alConfirmar} />)
    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument()
    expect(alConfirmar).not.toHaveBeenCalled()
  })

  it('con sesión iniciada completa nombre y correo automáticamente', () => {
    render(<Checkout carrito={carritoCon()} usuario={{ nombre: 'Ana Pérez Soto', correo: 'ana@duoc.cl' }} alConfirmar={() => {}} />)
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Pérez Soto')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@duoc.cl')
  })

  it('con sesión envía el token y muestra el descuento que aplicó el backend', async () => {
    conSesion({ ...CLIENTE, codigo: 'FELICES50' })
    const llamadas = simularApi({
      'POST /boletas': responder(201, boletaPrueba({ porcentaje: 10, descuento: 1000, motivo: 'Código FELICES50 (10% de por vida)', total: 9000 })),
    })
    const usuario = userEvent.setup()
    const cuenta = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', codigo: 'FELICES50' }
    render(<Checkout carrito={carritoCon(5, 2)} usuario={cuenta} alConfirmar={() => {}} />)

    expect(screen.getByText(/Total a pagar: \$\s?9\.000/)).toBeInTheDocument() // vista previa

    await usuario.type(screen.getByLabelText('Calle'), 'Av. Siempre Viva 742')
    await usuario.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble')
    await usuario.selectOptions(screen.getByLabelText('Comuna'), 'Chillán')
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/Total pagado: \$\s?9\.000/)).toBeInTheDocument()
    expect(llamadas[0].autorizacion).toBe('Bearer token-acceso')
  })
})
