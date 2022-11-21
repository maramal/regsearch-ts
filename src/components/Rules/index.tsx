import { useContext, useState } from "react";
import { Button, ButtonGroup, Card, Col, Container, Row } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";
import CreateRule from "./CreateRule";

export default function Rules() {
    const context = useContext(GlobalContext);

    const [displayNewRule, setDisplayNewRule] = useState(false)

    function handleClick() {
        setDisplayNewRule(true);
    }

    function deleteRule(i: number) {
        const confirmation = confirm(`Do you really want to delete the rule "${context.rules[i].name}"?`)
        if (!confirmation) return

        let $rules = [...context.rules];
        $rules.splice(i, 1);
        context.setRules($rules);
    }

    function handleProcessRules() {
        context.setNewText("")
        context.setLines([])
        context.setStatus([])

        context.setCurrentStep(3);
    }

    return (
        <Container>
            <Row>
                <Col>
                    <Row>
                        <h2>Step 2: Create rules</h2>
                    </Row>
                    <Row>
                        <Col>
                            <CreateRule displayNewRule={displayNewRule} setDisplayNewRule={setDisplayNewRule} />
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col>
                            <ButtonGroup>
                                <Button onClick={handleClick}>Add rule</Button>
                                <Button onClick={handleProcessRules} disabled={context.rules.length < 1}>
                                    Process rules
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Row>
                        <h3>
                            Rules <small>(total: {context.rules.length})</small>
                        </h3>
                    </Row>
                    <Row>
                        {context.rules.map((rule, i) => (
                            <Card style={{ width: '20rem' }} key={i + 1} className="m-2">
                                <Card.Body>
                                    <Card.Title>{rule.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">Replace type: {rule.replaceType}</Card.Subtitle>
                                    <Card.Text>
                                        Source search pattern: {rule.sourceSearchPattern.toString()}
                                    </Card.Text>
                                    <Button variant="danger"
                                        onClick={() => {
                                            deleteRule(i);
                                        }}
                                    >
                                        Delete rule
                                    </Button>
                                </Card.Body>
                            </Card>
                        ))}
                    </Row>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <Button
                        variant="info"
                        onClick={() => { context.setCurrentStep(1) }}
                    >Go back</Button>
                </Col>
            </Row>
        </Container>
    );
}
