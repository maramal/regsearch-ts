import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";
import RegisterMiddleware, { Middleware } from "./RegisterMiddleware";

export default function Middlewares() {
    const context = useContext(GlobalContext)
    const [displayMiddlewareRegistration, setDisplayMiddlewareRegistration] = useState(false)
    const [editMiddleware, setEditMiddleware] = useState(-1)

    function handleEdit(i: number) {
        setEditMiddleware(i)
        setDisplayMiddlewareRegistration(true)
    }

    function handleDelete(i: number) {
        const confirmation = confirm("Do you really want to delete the middleware? All data will be lost")
        if (!confirmation) return

        const middlewares = [...context.middlewares]
        middlewares.splice(i, 1)
        context.setMiddlewares(middlewares)
    }

    return (
        <Container>
            <>
                <RegisterMiddleware 
                    displayMiddlewareRegistration={displayMiddlewareRegistration}
                    setDisplayMiddlewareRegistration={setDisplayMiddlewareRegistration}
                    edit={editMiddleware}
                    setEdit={setEditMiddleware}
                />
            </>
            <Row>
                <Col>
                    <h1>Middlewares</h1>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Button variant="primary" onClick={() => { setDisplayMiddlewareRegistration(true) }}>Register Middleware</Button>
                </Col>
            </Row>
            <Row>
                {context.middlewares.map((middleware, i) => (
                    <Row key={i} className="mb-3">
                        <Card style={{ width: '50rem' }}>
                            <Card.Body>
                                <Card.Title>{middleware.name}</Card.Title>
                                <Card.Subtitle>{middleware.request.url} ({middleware.request.method})</Card.Subtitle>
                            </Card.Body>
                            <Card.Body className="d-flex justify-content-between">
                                <Button variant="primary" onClick={() => { handleEdit(i) }}>Edit</Button>
                                <Button variant="danger" onClick={() => { handleDelete(i) }}>Delete</Button>
                            </Card.Body>
                        </Card>
                    </Row>
                ))}
            </Row>
        </Container>
    )
}