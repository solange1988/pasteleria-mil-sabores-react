import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkout from '../pages/Checkout.jsx'
import { simularApi, simularSinConexion, responder, boletaPrueba, conSesion, CLIENTE } from './apiFalsa.js'
import { renderizarPagina, ponerCarrito, leerCarritoGuardado } from './rutas.js'

// El carrito y la sesión vienen de los contextos: se dejan guardados antes de abrir la página
function abrirCheckout(carrito) {
  ponerCarrito(carrito)
  return renderizarPagina(<Checkout />, { ruta: '/checkout' })
}

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
    abrirCheckout([])
    expect(screen.getByText('No hay productos para pagar.')).toBeInTheDocument()
  })

  it('muestra el total a pagar', () => {
    abrirCheckout(carritoCon())
    expect(screen.getByText(/Total a pagar: \$\s?10\.000/)).toBeInTheDocument()
  })

  it('pagar con el formulario vacío muestra errores y no llama a la API', async () => {
    const llamadas = simularApi({})
    const usuario = userEvent.setup()
    abrirCheckout(carritoCon())

    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(leerCarritoGuardado().length).toBe(1)
    expect(llamadas.length).toBe(0)
  })

  it('PAGO CORRECTO: envía la compra, muestra la boleta #1001 y vacía el carrito', async () => {
    const llamadas = simularApi({ 'POST /boletas': responder(201, boletaPrueba()) })
    const usuario = userEvent.setup()
    abrirCheckout(carritoCon(5, 2))

    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/Se ha realizado la compra. Nro #1001/)).toBeInTheDocument()
    expect(leerCarritoGuardado()).toEqual([]) // compra aprobada: el contexto vació el carrito
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
    abrirCheckout(carritoCon(5, 3))

    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/No se pudo realizar el pago. Nro #1001/)).toBeInTheDocument()
    expect(screen.getByText(/Stock insuficiente para: Mousse de Chocolate/)).toBeInTheDocument()
    expect(leerCarritoGuardado().length).toBe(1)
  })

  it('tras un pago rechazado se puede volver al formulario', async () => {
    simularApi({ 'POST /boletas': responder(201, boletaPrueba({ estado: 'Pago rechazado', faltantes: ['Mousse de Chocolate'] })) })
    const usuario = userEvent.setup()
    abrirCheckout(carritoCon(5, 1))
    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    await usuario.click(await screen.findByRole('button', { name: 'Volver a realizar el pago' }))

    expect(screen.getByText('Información del cliente')).toBeInTheDocument()
  })

  it('si el backend está apagado muestra el error y no vacía el carrito', async () => {
    simularSinConexion()
    const usuario = userEvent.setup()
    abrirCheckout(carritoCon())
    await llenarDatos(usuario)
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument()
    expect(leerCarritoGuardado().length).toBe(1)
  })

  it('con sesión iniciada completa nombre y correo automáticamente', () => {
    const cliente = { ...CLIENTE, nombre: 'Ana Pérez Soto', correo: 'ana@duoc.cl' }
    conSesion(cliente)
    simularApi({ 'GET /usuarios/perfil': cliente })
    abrirCheckout(carritoCon())
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Pérez Soto')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@duoc.cl')
  })

  it('con sesión envía el token y muestra el descuento que aplicó el backend', async () => {
    const cuenta = { ...CLIENTE, nombre: 'Ana Pérez', correo: 'ana@duoc.cl', codigo: 'FELICES50' }
    conSesion(cuenta)
    const llamadas = simularApi({
      'GET /usuarios/perfil': cuenta,
      'POST /boletas': responder(201, boletaPrueba({ porcentaje: 10, descuento: 1000, motivo: 'Código FELICES50 (10% de por vida)', total: 9000 })),
    })
    const usuario = userEvent.setup()
    abrirCheckout(carritoCon(5, 2))

    expect(screen.getByText(/Total a pagar: \$\s?9\.000/)).toBeInTheDocument() // vista previa

    await usuario.type(screen.getByLabelText('Calle'), 'Av. Siempre Viva 742')
    await usuario.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble')
    await usuario.selectOptions(screen.getByLabelText('Comuna'), 'Chillán')
    await usuario.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    expect(await screen.findByText(/Total pagado: \$\s?9\.000/)).toBeInTheDocument()
    expect(llamadas.find((l) => l.ruta === '/boletas').autorizacion).toBe('Bearer token-acceso')
  })
})
