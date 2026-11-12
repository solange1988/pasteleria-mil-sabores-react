import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Perfil from '../pages/Perfil.jsx'
import { simularApi, errorApi, boletaPrueba, conSesion, CLIENTE } from './apiFalsa.js'

const ana = (extra = {}) => ({ ...CLIENTE, ...extra })

function API_PERFIL(compras = []) {
  return simularApi({
    'GET /boletas/mias': compras,
    'PUT /usuarios/perfil': ({ cuerpo }) =>
      cuerpo.codigo && cuerpo.codigo !== 'FELICES50' ? errorApi(400, 'El código promocional no es válido') : { ...CLIENTE, ...cuerpo },
  })
}

describe('<Perfil /> (GET /boletas/mias y PUT /usuarios/perfil)', () => {
  beforeEach(() => conSesion(CLIENTE))

  it('muestra los datos del usuario ya cargados en el formulario', () => {
    API_PERFIL()
    render(<Perfil usuario={ana({ telefono: '+56911112222' })} alGuardar={() => {}} />)
    expect(screen.getByText('ana@duoc.cl')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
    expect(screen.getByLabelText('Teléfono (opcional)')).toHaveValue('+56911112222')
  })

  it('guarda los cambios en el backend, entrega el usuario actualizado y confirma', async () => {
    const llamadas = API_PERFIL()
    const usuario = userEvent.setup()
    const alGuardar = jasmine.createSpy()
    render(<Perfil usuario={ana()} alGuardar={alGuardar} />)

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Gómez')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Tus datos se actualizaron correctamente.')).toBeInTheDocument()
    expect(alGuardar).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Ana Gómez' }))
    expect(llamadas.find((l) => l.metodo === 'PUT').cuerpo.nombre).toBe('Ana Gómez')
  })

  it('un nombre inválido no se envía y muestra el error', async () => {
    const llamadas = API_PERFIL()
    const usuario = userEvent.setup()
    const alGuardar = jasmine.createSpy()
    render(<Perfil usuario={ana()} alGuardar={alGuardar} />)

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(alGuardar).not.toHaveBeenCalled()
    expect(llamadas.some((l) => l.metodo === 'PUT')).toBeFalse()
  })

  it('sin descuentos asociados lo informa', () => {
    API_PERFIL()
    render(<Perfil usuario={ana()} alGuardar={() => {}} />)
    expect(screen.getByText('Por ahora no tienes descuentos asociados a tu cuenta.')).toBeInTheDocument()
  })

  it('con el código FELICES50 muestra el 10% de descuento', () => {
    API_PERFIL()
    render(<Perfil usuario={ana({ codigo: 'FELICES50' })} alGuardar={() => {}} />)
    expect(screen.getByText(/Tienes 10% de descuento/)).toBeInTheDocument()
  })

  it('el historial muestra las compras que devuelve GET /boletas/mias', async () => {
    const llamadas = API_PERFIL([boletaPrueba({ numero: 1001 }), boletaPrueba({ numero: 1003 })])
    render(<Perfil usuario={ana()} alGuardar={() => {}} />)
    expect(await screen.findByText('#1001')).toBeInTheDocument()
    expect(screen.getByText('#1003')).toBeInTheDocument()
    expect(llamadas[0]).toEqual(jasmine.objectContaining({ ruta: '/boletas/mias', autorizacion: 'Bearer token-acceso' }))
  })

  it('sin compras el historial muestra el aviso de lista vacía', async () => {
    API_PERFIL()
    render(<Perfil usuario={ana()} alGuardar={() => {}} />)
    expect(await screen.findByText('No hay órdenes registradas.')).toBeInTheDocument()
  })

  it('si el backend rechaza los datos muestra su mensaje', async () => {
    API_PERFIL()
    const usuario = userEvent.setup()
    render(<Perfil usuario={ana()} alGuardar={() => {}} />)
    await screen.findByText('No hay órdenes registradas.')
    // El backend falso solo acepta "FELICES50" en mayúsculas: así simulamos que rechaza algo que el navegador aceptó
    await usuario.type(screen.getByLabelText('Código promocional (opcional)'), 'felices50')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('El código promocional no es válido')).toBeInTheDocument()
  })
})
