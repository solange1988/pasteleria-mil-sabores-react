import { Container, Row, Col, Card, Alert } from 'react-bootstrap'
import Catalogo from '../components/Catalogo.jsx'
import { listarProductos, listarCategorias } from '../data/productos.js'
import { crearSlug } from '../utils/formato.js'

// Sin "slug": muestra todas las categorías (#/categorias).
// Con "slug": muestra los productos de esa categoría (#/categorias/tortas-cuadradas).
function Categorias({ slug, alAgregar }) {
  const productos = listarProductos()
  const categorias = listarCategorias()

  if (slug) {
    const categoria = categorias.find((c) => crearSlug(c) === slug)
    return (
      <Container className="py-4">
        <a href="#/categorias">&larr; Todas las categorías</a>
        {categoria ? (
          <>
            <h1 className="text-center my-3">{categoria}</h1>
            <Catalogo productos={productos.filter((p) => p.categoria === categoria)} alAgregar={alAgregar} />
          </>
        ) : (
          <Alert variant="warning" className="mt-3">Esa categoría no existe.</Alert>
        )}
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Categorías</h1>
      <Row xs={1} sm={2} lg={4} className="g-4">
        {categorias.map((categoria) => {
          const deLaCategoria = productos.filter((p) => p.categoria === categoria)
          return (
            <Col key={categoria}>
              <Card className="h-100 shadow-sm border-0 text-center">
                <a href={`#/categorias/${crearSlug(categoria)}`}>
                  <Card.Img variant="top" src={deLaCategoria[0].imagen} alt={categoria} className="img-producto" />
                </a>
                <Card.Body>
                  <Card.Title as="h2" className="fs-5">
                    <a href={`#/categorias/${crearSlug(categoria)}`} className="text-reset text-decoration-none">{categoria}</a>
                  </Card.Title>
                  <Card.Text className="text-secondary">{deLaCategoria.length} productos</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    </Container>
  )
}

export default Categorias
