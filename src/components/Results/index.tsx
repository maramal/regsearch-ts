import React, { useContext, useState } from "react";
import { Button, Col, Container, Form, Row, Toast, ToastContainer } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";

export default function Results() {
  const context = useContext(GlobalContext);

  const [toasts, setToasts] = useState<JSX.Element[]>([])

  function startOver() {
    context.setLines([])
    context.setRules([])
    context.setText("")
    context.setNewText("")
    context.setCurrentStep(1)
    context.setStatus([])
  }

  function handleCopyToClipboard() {
    navigator.clipboard.writeText(context.newText)

    const toast = (
      <Toast autohide delay={3000}>
        <Toast.Body>Resulting text copied to clipboard.</Toast.Body>
      </Toast>
    )

    setToasts([...toasts, toast])
  }

  return (
    <>
      <ToastContainer className="p-3" position="bottom-end">
        {toasts}
      </ToastContainer>
      <Container>
        <Row>
          <Col>
            <Row>
              <Col>
                <Form.Control as="textarea" value={context.newText} rows={20} readOnly></Form.Control>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="d-flex justify-content-between">
                <Button variant="danger" onClick={startOver}>Start over</Button>
                <Button variant="primary" onClick={handleCopyToClipboard}>Copy to clipboard</Button>
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
    </>
  );
}
