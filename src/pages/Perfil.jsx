import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import CampoTexto from '../components/CampoTexto.jsx'
import CamposRegion from '../components/CamposRegion.jsx'
import ListaOrdenes from '../components/ListaOrdenes.jsx'
import Cargando from '../components/Cargando.jsx'
import useFormulario from '../hooks/useFormulario.js'
import useCarga from '../hooks/useCarga.js'
import { actualizarPerfil } from '../data/usuarios.js'
import { listarMisOrdenes } from '../data/ordenes.js'
import { descuentoDe } from '../utils/descuentos.js'
import { validarNombreCompleto, validarFechaNacimiento, validarCodigoPromocional } from '../utils/validaciones.js'

const VALIDADORES = {
  nombre: validarNombreCompleto,
  fechaNacimiento: validarFechaNacimiento,
  codigo: validarCodigoPromocional,
}

// Perfil del usuario: actualizar sus datos, ver su descuento e historial de compras.
// Props: usuario (con sesión iniciada; App protege esta página con RutaProtegida)
//        alGuardar(usuarioActualizado): avisa a App para actualizar la sesión
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
  const [error, setError] = useState('')
  // GET /api/v1/boletas/mias: solo las compras de este usuario (el backend lo identifica por el token)
  const compras = useCarga(listarMisOrdenes, [])

  // PUT /api/v1/usuarios/perfil
  async function enviar(evento) {
    evento.preventDefault()
    setGuardado(false)
    setError('')
    if (!form.validarTodo()) return
    try {
      alGuardar(await actualizarPerfil(form.valores))
      setGuardado(true)
    } catch (e) {
      setError(e.message)
    }
  }

  // El descuento se calcula con los datos ya guardados
  const { porcentaje, motivo } = descuentoDe(usuario)

  return (
    <Container className="py-4">
      <h1 className="mb-4">Mi perfil</h1>
      <Row className="g-4">
        <Col lg={5}>
          <Card className="shadow-sm border-0 p-4">
            {guardado && <Alert variant="success">Tus datos se actualizaron correctamente.</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
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
          <Cargando carga={compras}>{(ordenes) => <ListaOrdenes ordenes={[...ordenes].reverse()} />}</Cargando>
        </Col>
      </Row>
    </Container>
  )
}

export default Perfil
