import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import CamposRegion from '../components/CamposRegion.jsx'
import ListaOrdenes from '../components/ListaOrdenes.jsx'
import useFormulario from '../hooks/useFormulario.js'
import { actualizarUsuario, obtenerUsuario } from '../data/usuarios.js'
import { listarOrdenesDe } from '../data/ordenes.js'
import { descuentoDe } from '../utils/descuentos.js'
import { validarNombreCompleto, validarFechaNacimiento, validarCodigoPromocional } from '../utils/validaciones.js'

const VALIDADORES = {
  nombre: validarNombreCompleto,
  fechaNacimiento: validarFechaNacimiento,
  codigo: validarCodigoPromocional,
}

// Perfil del cliente: actualizar sus datos, ver su descuento e historial de compras.
// Props: usuario (objeto con sesión iniciada o null) y alGuardar (avisa a App que cambió)
function Perfil({ usuario, alGuardar }) {
  const form = useFormulario(
    {
      nombre: usuario?.nombre ?? '',
      fechaNacimiento: usuario?.fechaNacimiento ?? '',
      codigo: usuario?.codigo ?? '',
      telefono: usuario?.telefono ?? '',
      region: usuario?.region ?? '',
      comuna: usuario?.comuna ?? '',
    },
    VALIDADORES,
  )
  const [guardado, setGuardado] = useState(false)

  if (!usuario) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Debes iniciar sesión para ver tu perfil.</Alert>
        <Button href="#/login" variant="chocolate">Iniciar sesión</Button>
      </Container>
    )
  }

  function enviar(evento) {
    evento.preventDefault()
    if (!form.validarTodo()) {
      setGuardado(false)
      return
    }
    actualizarUsuario(usuario.correo, form.valores)
    setGuardado(true)
    alGuardar()
  }

  // El descuento se calcula con los datos ya guardados
  const { porcentaje, motivo } = descuentoDe(obtenerUsuario(usuario.correo))

  return (
    <Container className="py-4">
      <h1 className="mb-4">Mi perfil</h1>
      <Row className="g-4">
        <Col lg={5}>
          <Card className="shadow-sm border-0 p-4">
            {guardado && <Alert variant="success">Tus datos se actualizaron correctamente.</Alert>}
            <p className="mb-3"><strong>Correo:</strong> {usuario.correo}</p>
            <Form noValidate onSubmit={enviar}>
              <CampoTexto etiqueta="Nombre completo" name="nombre" form={form} autoComplete="name" />
              <CampoTexto etiqueta="Fecha de nacimiento" name="fechaNacimiento" type="date" form={form} />
              <CampoTexto etiqueta="Código promocional (opcional)" name="codigo" form={form} />
              <CampoTexto etiqueta="Teléfono (opcional)" name="telefono" type="tel" form={form} autoComplete="tel" />
              <CamposRegion form={form} />
              <Button type="submit" variant="chocolate" className="w-100">Guardar cambios</Button>
            </Form>
          </Card>
        </Col>
        <Col lg={7}>
          <Alert variant={porcentaje > 0 ? 'success' : 'secondary'}>
            {porcentaje > 0 ? `Tienes ${porcentaje}% de descuento: ${motivo}.` : 'Por ahora no tienes descuentos asociados a tu cuenta.'}
          </Alert>
          <h2 className="fs-4">Historial de compras</h2>
          <ListaOrdenes ordenes={[...listarOrdenesDe(usuario.correo)].reverse()} />
        </Col>
      </Row>
    </Container>
  )
}

export default Perfil
