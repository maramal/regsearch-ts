import { useContext } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";

export default function Results() {
  const context = useContext(GlobalContext);

  function startOver() {
    context.setLines([])
    context.setRules([])
    context.setText("")
    context.setNewText("")
    context.setCurrentStep(1)
    context.setStatus([])
  }

  return (
    <Container>
      <Row>
        <Col>
          <Row>
            <Col>
              <Form.Control as="textarea" value={context.newText} rows={20} readOnly></Form.Control>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Button onClick={startOver}>Start over</Button>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col>
              <Button variant="info" onClick={() => { context.setCurrentStep(2) }}>Go back</Button>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row>
            <h1>Status</h1>
          </Row>
          <Row style={{ height: "600px", overflowY: "scroll", display: "block" }}>
            {context.status.map((status, i) => 
              <p key={i}><strong>{status.dt.toUTCString()}:</strong> {status.value}</p>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
