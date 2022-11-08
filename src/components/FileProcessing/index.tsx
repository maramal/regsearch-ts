import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";
import { FileProcess } from "./FileProcess";

export default function FileProcessing() {
    const context = useContext(GlobalContext);

    const [processFinished, setProcessFinished] = useState(false)

    function viewResults() {
        context.setCurrentStep(4);
    }

    useEffect(() => {
        if (context.newText.length > 0) {
            setProcessFinished(true)
        }
    }, [context.newText]);

    useEffect(() => {
        const fp = new FileProcess(context)
        fp.processLines()
    }, [])

    return (
        <Container>
            <Row>
                <Col>
                    <h2>Step 3: File processing</h2>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    {processFinished && <Button onClick={viewResults} variant="primary" disabled={context.newText.length < 1}>View results</Button>}
                </Col>
            </Row>
            <Row className="mt-5">
                <Col>
                    <Button variant="info" onClick={() => { context.setCurrentStep(2) }}>Go back</Button>
                </Col>
            </Row>
        </Container>
    );
}
