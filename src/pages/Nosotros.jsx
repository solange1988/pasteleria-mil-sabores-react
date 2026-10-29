import { Container, Row, Col } from 'react-bootstrap'

function Nosotros() {
  return (
    <Container className="py-4">
      <h1 className="text-center">Sobre Nosotros</h1>
      <p className="lh-lg">
        Pastelería Mil Sabores celebra su 50° aniversario como un referente en la repostería
        chilena. Somos famosos por nuestra participación en el récord Guinness de 1995, cuando
        colaboramos en la creación de la torta más grande del mundo. Hoy renovamos nuestra
        tienda online para ofrecer una experiencia de compra moderna y accesible a todos
        nuestros clientes.
      </p>

      <Row className="align-items-center g-4 py-4">
        <Col md={6}>
          <h2>Nuestra Misión</h2>
          <p className="lh-lg">
            Ofrecer una experiencia dulce y memorable a nuestros clientes, proporcionando tortas
            y productos de repostería de alta calidad para todas las ocasiones, mientras
            celebramos nuestras raíces históricas y fomentamos la creatividad en la repostería.
          </p>
        </Col>
        <Col md={6}>
          <img src="/img/mision-pasteleria.jpg" alt="Misión Pastelería Mil Sabores" className="img-portada" />
        </Col>
      </Row>

      {/* En pantallas md+ la imagen va a la izquierda; en celular queda bajo el texto */}
      <Row className="align-items-center g-4 py-4">
        <Col md={{ span: 6, order: 2 }}>
          <h2>Nuestra Visión</h2>
          <p className="lh-lg">
            Convertirnos en la tienda online líder de productos de repostería en Chile, conocida
            por nuestra innovación, calidad y el impacto positivo en la comunidad, especialmente
            en la formación de nuevos talentos en gastronomía.
          </p>
        </Col>
        <Col md={{ span: 6, order: 1 }}>
          <img src="/img/vision-pasteleria.jpg" alt="Visión Pastelería Mil Sabores" className="img-portada" />
        </Col>
      </Row>

      <h2 className="text-center">Nuestro Equipo</h2>
      <p className="text-center">
        Este sitio fue desarrollado por el equipo [nombres de los integrantes], estudiantes de
        Desarrollo Full Stack II en Duoc UC (DSY1104).
      </p>
    </Container>
  )
}

export default Nosotros
