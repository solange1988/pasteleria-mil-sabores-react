import { Row, Col, Form } from 'react-bootstrap'
import regiones from '../data/regiones.js'

// Selectores de región y comuna. Las comunas dependen de la región elegida.
// "form" es lo que devuelve useFormulario y debe tener los campos region y comuna.
function CamposRegion({ form }) {
  const { valores, errores } = form

  function cambiarRegion(evento) {
    form.cambiar(evento)
    // al cambiar la región se limpia la comuna elegida
    form.setValores((v) => ({ ...v, comuna: '' }))
  }

  return (
    <Row>
      <Col sm={6}>
        <Form.Group className="mb-3" controlId="region">
          <Form.Label className="fw-bold">Región</Form.Label>
          <Form.Select name="region" value={valores.region} onChange={cambiarRegion} isInvalid={Boolean(errores.region)}>
            <option value="">-- Seleccione la región --</option>
            {Object.keys(regiones).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Form.Select>
          {errores.region && <Form.Control.Feedback type="invalid" role="alert">{errores.region}</Form.Control.Feedback>}
        </Form.Group>
      </Col>
      <Col sm={6}>
        <Form.Group className="mb-3" controlId="comuna">
          <Form.Label className="fw-bold">Comuna</Form.Label>
          <Form.Select name="comuna" value={valores.comuna} onChange={form.cambiar} isInvalid={Boolean(errores.comuna)}>
            <option value="">-- Seleccione la comuna --</option>
            {(regiones[valores.region] ?? []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
          {errores.comuna && <Form.Control.Feedback type="invalid" role="alert">{errores.comuna}</Form.Control.Feedback>}
        </Form.Group>
      </Col>
    </Row>
  )
}

export default CamposRegion
