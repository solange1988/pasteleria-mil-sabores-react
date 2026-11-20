import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Ofertas from '../pages/Ofertas.jsx'
import Categorias from '../pages/Categorias.jsx'
import DetalleProducto from '../pages/DetalleProducto.jsx'
import Productos from '../pages/Productos.jsx'
import Inicio from '../pages/Inicio.jsx'
import Nosotros from '../pages/Nosotros.jsx'
import Blogs from '../pages/Blogs.jsx'
import BlogDetalle from '../pages/BlogDetalle.jsx'
import Contacto from '../pages/Contacto.jsx'
import Carrito from '../pages/Carrito.jsx'
import PiePagina from '../components/PiePagina.jsx'
import { simularApi, productosPrueba, ofertasDe, errorApi, conSesion, CLIENTE } from './apiFalsa.js'
import { renderizarPagina, renderizarConRouter, ponerCarrito, leerCarritoGuardado } from './rutas.js'

// Los productos ahora vienen del backend: cada prueba simula la respuesta de la API.
const API_CATALOGO = () => {
  const productos = productosPrueba()
  return simularApi({
    'GET /productos': productos,
    'GET /productos/ofertas': ofertasDe(productos),
    'GET /productos/5': productos[4],
    'GET /productos/2': productos[1],
    'GET /productos/9999': errorApi(404, 'No existe el producto 9999'),
  })
}

describe('<Ofertas />', () => {
  it('pide las ofertas al backend y muestra cada una con su porcentaje', async () => {
    const llamadas = API_CATALOGO()
    renderizarPagina(<Ofertas />)
    expect(screen.getByRole('heading', { level: 1, name: 'Ofertas' })).toBeInTheDocument()
    expect(await screen.findByText('5 productos con precio especial')).toBeInTheDocument()
    expect(screen.getAllByText(/^-\d+%$/).length).toBe(5)
    expect(llamadas[0]).toEqual(jasmine.objectContaining({ metodo: 'GET', ruta: '/productos/ofertas' }))
  })

  it('mientras carga muestra el indicador de carga', () => {
    API_CATALOGO()
    renderizarPagina(<Ofertas />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('agregar una oferta la guarda en el carrito (contexto del carrito)', async () => {
    API_CATALOGO()
    const usuario = userEvent.setup()
    renderizarPagina(<Ofertas />)

    await usuario.click((await screen.findAllByRole('button', { name: 'Añadir al carrito' }))[0])

    const carrito = leerCarritoGuardado()
    expect(carrito.length).toBe(1)
    expect(carrito[0]).toEqual(jasmine.objectContaining({ id: 2, precio: 42500 })) // se cobra el precio de oferta
  })

  it('si no queda ninguna oferta avisa que por ahora no hay', async () => {
    simularApi({ 'GET /productos/ofertas': [] })
    renderizarPagina(<Ofertas />)
    expect(await screen.findByText('Por ahora no hay productos en oferta.')).toBeInTheDocument()
    expect(screen.getByText('Vuelve pronto: publicaremos nuevas ofertas.')).toBeInTheDocument()
  })

  it('si el backend no responde muestra el error y permite reintentar', async () => {
    simularApi({ 'GET /productos/ofertas': errorApi(500, 'Error interno') })
    renderizarPagina(<Ofertas />)
    expect(await screen.findByText(/Error interno/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

describe('<Categorias />', () => {
  it('sin slug lista las 8 categorías con su cantidad de productos y enlace', async () => {
    API_CATALOGO()
    renderizarPagina(<Categorias />, { ruta: '/categorias' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getAllByText(/productos$/).length).toBe(8)
    expect(screen.getAllByRole('link', { name: 'Tortas Cuadradas' })[0]).toHaveAttribute('href', '/categorias/tortas-cuadradas')
  })

  it('con slug muestra solo los productos de esa categoría', async () => {
    API_CATALOGO()
    renderizarPagina(<Categorias />, { ruta: '/categorias/tortas-cuadradas', patron: '/categorias/:slug' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Tortas Cuadradas' })).toBeInTheDocument()
    const esperados = productosPrueba().filter((p) => p.categoria === 'Tortas Cuadradas').length
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(esperados)
    expect(screen.getByRole('link', { name: /Todas las categorías/ })).toHaveAttribute('href', '/categorias')
  })

  it('con un slug que no existe avisa que la categoría no existe', async () => {
    API_CATALOGO()
    renderizarPagina(<Categorias />, { ruta: '/categorias/inventada', patron: '/categorias/:slug' })
    expect(await screen.findByText('Esa categoría no existe.')).toBeInTheDocument()
  })
})

describe('<DetalleProducto />', () => {
  it('lee el id de la URL (/producto/:id), pide el producto y permite agregarlo al carrito', async () => {
    const llamadas = API_CATALOGO()
    const usuario = userEvent.setup()
    renderizarPagina(<DetalleProducto />, { ruta: '/producto/5', patron: '/producto/:id' })

    expect(await screen.findByRole('heading', { level: 1, name: 'Mousse de Chocolate' })).toBeInTheDocument()
    expect(llamadas[0].ruta).toBe('/productos/5')
    await usuario.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

    expect(leerCarritoGuardado()).toEqual([jasmine.objectContaining({ id: 5, cantidad: 1 })])
  })

  it('un producto en oferta muestra el precio normal tachado y el porcentaje', async () => {
    API_CATALOGO()
    renderizarPagina(<DetalleProducto />, { ruta: '/producto/2', patron: '/producto/:id' })
    expect(await screen.findByText(/^-\d+%$/)).toBeInTheDocument()
    expect(document.querySelector('del')).not.toBeNull()
  })

  it('un producto sin stock tiene el botón desactivado y dice "Sin stock"', async () => {
    simularApi({ 'GET /productos/5': { ...productosPrueba()[4], stock: 0 } })
    renderizarPagina(<DetalleProducto />, { ruta: '/producto/5', patron: '/producto/:id' })
    expect(await screen.findByRole('button', { name: 'Añadir al carrito' })).toBeDisabled()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
  })

  it('si el backend responde 404 muestra "El producto no existe."', async () => {
    API_CATALOGO()
    renderizarPagina(<DetalleProducto />, { ruta: '/producto/9999', patron: '/producto/:id' })
    expect(await screen.findByText('El producto no existe.')).toBeInTheDocument()
  })
})

describe('<Productos /> (búsqueda y filtro)', () => {
  it('muestra todo el catálogo que entrega el backend', async () => {
    API_CATALOGO()
    renderizarPagina(<Productos />)
    expect((await screen.findAllByRole('button', { name: 'Añadir al carrito' })).length).toBe(16)
  })

  it('buscar por nombre deja solo los que coinciden', async () => {
    API_CATALOGO()
    const usuario = userEvent.setup()
    renderizarPagina(<Productos />)
    await screen.findAllByRole('button', { name: 'Añadir al carrito' })
    await usuario.type(screen.getByRole('searchbox'), 'mousse')
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(1)
  })

  it('filtrar por categoría deja solo los de esa categoría', async () => {
    API_CATALOGO()
    const usuario = userEvent.setup()
    renderizarPagina(<Productos />)
    await screen.findAllByRole('button', { name: 'Añadir al carrito' })
    await usuario.selectOptions(screen.getByLabelText('Filtrar por categoría'), 'Veganos')
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(2)
  })
})

describe('páginas informativas', () => {
  it('<Inicio /> muestra la portada y los 4 productos destacados', async () => {
    API_CATALOGO()
    renderizarPagina(<Inicio />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect((await screen.findAllByRole('button', { name: 'Añadir al carrito' })).length).toBe(4)
  })

  it('<Nosotros /> muestra la misión y la visión', () => {
    render(<Nosotros />)
    expect(screen.getByRole('heading', { name: /Misión/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Visión/ })).toBeInTheDocument()
  })

  it('<Blogs /> lista las noticias y cada una enlaza a su detalle', () => {
    renderizarConRouter(<Blogs />)
    const botones = screen.getAllByRole('button', { name: 'Ver caso completo' })
    expect(botones.length).toBe(2)
    expect(botones[0]).toHaveAttribute('href', '/blog/1')
    expect(botones[1]).toHaveAttribute('href', '/blog/2')
  })

  it('<BlogDetalle /> muestra una noticia por su id y avisa si no existe', () => {
    const { unmount } = renderizarPagina(<BlogDetalle />, { ruta: '/blog/1', patron: '/blog/:id' })
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    unmount()
    renderizarPagina(<BlogDetalle />, { ruta: '/blog/999', patron: '/blog/:id' })
    expect(screen.getByText('La noticia no existe.')).toBeInTheDocument()
  })

  it('<PiePagina /> incluye los enlaces de apoyo', () => {
    renderizarConRouter(<PiePagina />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

describe('<Contacto /> (validación)', () => {
  it('enviar vacío muestra errores y no confirma el envío', async () => {
    const usuario = userEvent.setup()
    render(<Contacto />)
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByText(/Gracias/)).toBeNull()
  })

  it('con todos los datos válidos confirma el envío', async () => {
    const usuario = userEvent.setup()
    render(<Contacto />)
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@gmail.com')
    await usuario.type(screen.getByLabelText('Mensaje'), 'Quiero cotizar una torta para 20 personas')
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText(/Gracias/)).toBeInTheDocument()
  })
})

describe('<Carrito /> con descuento', () => {
  const LINEAS = [{ id: 5, nombre: 'Mousse de Chocolate', precio: 10000, imagen: '/img/x.jpg', cantidad: 1 }]

  it('un usuario con código FELICES50 ve el subtotal, el descuento y el total rebajado', async () => {
    const cliente = { ...CLIENTE, codigo: 'FELICES50', fechaNacimiento: '' }
    conSesion(cliente)
    simularApi({ 'GET /usuarios/perfil': cliente })
    ponerCarrito(LINEAS)
    renderizarPagina(<Carrito />)
    expect(await screen.findByText(/Subtotal:/)).toBeInTheDocument()
    expect(screen.getByText(/Código FELICES50/)).toBeInTheDocument()
    expect(screen.getByText(/Total: \$\s?9\.000/)).toBeInTheDocument()
  })

  it('sin usuario no hay línea de descuento', () => {
    ponerCarrito(LINEAS)
    renderizarPagina(<Carrito />)
    expect(screen.queryByText(/Subtotal:/)).toBeNull()
  })

  it('el carrito vacío ofrece ir a ver productos', () => {
    renderizarPagina(<Carrito />)
    const aviso = screen.getByText('Tu carrito está vacío por el momento.').parentElement
    expect(within(aviso).getByText('Ver productos')).toHaveAttribute('href', '/productos')
  })
})
