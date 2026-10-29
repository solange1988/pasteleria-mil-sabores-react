import { Container, Row, Col, Button, Ratio } from 'react-bootstrap'
import Catalogo from '../components/Catalogo.jsx'
import { listarProductos } from '../data/productos.js'

const IDS_DESTACADOS = [1, 4, 5, 10]

function Inicio({ alAgregar }) {
  const destacados = listarProductos().filter((p) => IDS_DESTACADOS.includes(p.id))

  return (
    <Container>
      <Row className="align-items-center py-5 g-4">
        <Col lg={6}>
          <h1 className="mb-3">50 años endulzando a Chile</h1>
          <p className="lh-lg">
            Pastelería Mil Sabores celebra su 50° aniversario como referente de la repostería
            chilena. Famosos por participar en el récord Guinness de la torta más grande del
            mundo en 1995, hoy renovamos nuestra tienda online para ofrecerte una experiencia
            de compra moderna, cercana y llena de tradición.
          </p>
          <Button href="#/productos" variant="chocolate" size="lg">Ver productos</Button>
        </Col>
        <Col lg={6}>
          <img src="/img/hero-pasteleria.jpg" alt="Pastelería Mil Sabores" className="img-portada" />
        </Col>
      </Row>

      <h2 className="text-center mb-4">Productos destacados</h2>
      <Catalogo productos={destacados} alAgregar={alAgregar} />

      <h2 className="text-center mt-5 mb-4">Conoce nuestra historia</h2>
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <Ratio aspectRatio="16x9">
          <iframe
            src="https://www.youtube.com/embed/xvH8Ap_II3A"
            title="Historia Pastelería Mil Sabores"
            allowFullScreen
          />
        </Ratio>
      </div>
    </Container>
  )
}

export default Inicio
