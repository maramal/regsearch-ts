import React, { useContext, useEffect, useRef, useState } from "react"
import { Button, Form, InputGroup, Modal } from "react-bootstrap"
import { GlobalContext } from "../context/GlobalContext"

type HandleChangeHeaderPropType = "type" | "value"
export type HeaderTypeType = "Authentication" | "Content-Type" | "Accept"
export type RequestMethod = "POST" | "GET"

interface RegisterMiddlewareProps {
    displayMiddlewareRegistration: boolean
    setDisplayMiddlewareRegistration: React.Dispatch<React.SetStateAction<boolean>>
    edit: number
    setEdit: React.Dispatch<React.SetStateAction<number>>
}

interface FormData extends EventTarget {
    name: HTMLInputElement
    url: HTMLInputElement
    method: HTMLSelectElement
    queryString: HTMLInputElement
    body: HTMLInputElement
    responseMap: HTMLInputElement
}

export interface MiddlewareHeader {
    type?: HeaderTypeType
    value?: string
}

export interface MiddlewareRequest {
    url: string
    method: RequestMethod
    queryString?: string
    headers: MiddlewareHeader[]
    body?: string
}

export interface MiddlewareResponse {
    headers: MiddlewareHeader[]
    responseMap: string
}

export interface Middleware {
    name: string
    request: MiddlewareRequest
    response: MiddlewareResponse
}

export interface HeaderType {
    name: string
    value: string
}

const headerTypes: HeaderType[] = [
    {
        name: "Content Type",
        value: "Content-Type"
    },
    {
        name: "Authorization",
        value: "Authorization"
    }
]

export default function RegisterMiddleware(props: RegisterMiddlewareProps) {
    const context = useContext(GlobalContext)
    const [requestHeaders, setRequestHeaders] = useState([] as MiddlewareHeader[])
    const [responseHeaders, setResponseHeaders] = useState([] as MiddlewareHeader[])
    const nameRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = e.target as FormData
        const middleware: Middleware = {
            name: formData.name.value,
            request: {
                url: formData.url.value,
                method: formData.method.value as RequestMethod,
                queryString: formData.queryString.value,
                body: formData.body.value,
                headers: requestHeaders
            },
            response: {
                responseMap: formData.responseMap.value,
                headers: responseHeaders
            }
        }

        if (props.edit >= 0) {
            const middlewares = [...context.middlewares]
            middlewares[props.edit] = middleware

            context.setMiddlewares(middlewares)
        } else {
            context.setMiddlewares([...context.middlewares, middleware])
        }        

        handleReset()
    }

    function handleReset() {
        // reset header arrays
        const reqHeaders = [] as MiddlewareHeader[]
        const resHeaders = [] as MiddlewareHeader[]
        setRequestHeaders(reqHeaders)
        setResponseHeaders(resHeaders)

        props.setEdit(-1)
        props.setDisplayMiddlewareRegistration(false)
    }

    function handleChangeRequestHeader(i: number, prop: HandleChangeHeaderPropType, value: string) {
        const reqHeaders = [...requestHeaders]
        if (prop === "type") {
            reqHeaders[i][prop] = value as HeaderTypeType
        } else {
            reqHeaders[i][prop] = value
        }
        
        setRequestHeaders(reqHeaders)
    }

    function handleChangeResponseHeader(i: number, prop: HandleChangeHeaderPropType, value: string) {
        const resHeaders = [...responseHeaders]
        if (prop === "type") {
            resHeaders[i][prop] = value as HeaderTypeType
        } else {
            resHeaders[i][prop] = value
        }
        
        setResponseHeaders(resHeaders)
    }

    function deleteRequestHeader(i: number) {
        const confirmation = confirm("Do you really want to delete the header?")
        if (!confirmation) return

        const reqHeaders = [...requestHeaders]
        reqHeaders.splice(i, 1)
        setRequestHeaders([...reqHeaders])
    }

    function deleteResponseHeader(i: number) {
        const confirmation = confirm("Do you really want to delete the header?")
        if (!confirmation) return

        const resHeaders = [...responseHeaders]
        resHeaders.splice(i, 1)
        setResponseHeaders([...resHeaders])
    }

    function handleAddRequestHeader() {
        const requestHeader: MiddlewareHeader = {}
        setRequestHeaders([...requestHeaders, requestHeader])
    }

    function handleAddResponseHeader() {
        const responseHeader: MiddlewareHeader = {}
        setResponseHeaders([...responseHeaders, responseHeader])
    }

    useEffect(() => {
        nameRef.current?.focus();
    }, [props.displayMiddlewareRegistration])

    useEffect(() => {
        if (props.edit < 0 || formRef.current === null) return

        const middleware = context.middlewares[props.edit]
        const formData = formRef.current as unknown as FormData
        formData.name.value = middleware.name
        formData.url.value = middleware.request.url
        formData.method.value = middleware.request.method
        if (middleware.request.queryString !== undefined) formData.queryString.value = middleware.request.queryString
        if (middleware.request.body !== undefined) formData.body.value = middleware.request.body
        formData.responseMap.value = middleware.response.responseMap

        setRequestHeaders(middleware.request.headers)
        setResponseHeaders(middleware.response.headers)
    }, [props.edit])

    return (
        <Modal show={props.displayMiddlewareRegistration} onHide={() => props.setDisplayMiddlewareRegistration(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Register new middleware</Modal.Title>
            </Modal.Header>

            <Form
                onSubmit={handleSubmit}
                onReset={handleReset}
                style={{ display: props.displayMiddlewareRegistration ? "block" : "none" }}
                autoComplete="off"
                ref={formRef}
            >
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control type="text" id="name" name="name" ref={nameRef} required />
                    </Form.Group>

                    <h2>Request</h2>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="url">API URL</Form.Label>
                        <Form.Control type="text" id="url" name="url" required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="method">Method</Form.Label>
                        <Form.Select id="method" name="method" defaultValue={"GET"} required>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="queryString">Query String</Form.Label>
                        <Form.Control type="text" id="queryString" name="queryString" />
                        <Form.Text className="text-muted">
                            i.e.: <i>textToTranslate=$1&language=spanish</i>.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="body">Body</Form.Label>
                        <Form.Control as="textarea" type="text" rows={3} name="body" id="body" />
                        <Form.Text className="text-muted">
                            Body sent to API as a JSON object.
                        </Form.Text>
                    </Form.Group>

                    <h3>Headers</h3>

                    <Button variant="primary" className="mb-3" onClick={handleAddRequestHeader}>Add Request Header</Button>

                    {requestHeaders.map((requestHeader, i) =>
                        <InputGroup key={i} className="mb-3">
                            <Form.Select
                                id={`dd-request-header-${i}`}
                                onChange={e => { handleChangeRequestHeader(i, "type", e.target.value) }}
                                value={requestHeader.type}
                            >
                                <option value="">Select Item</option>
                                {headerTypes.map((headerType, j) => (
                                    <option key={j} value={headerType.value}>{headerType.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control
                                placeholder="Add header value"
                                onChange={e => { handleChangeRequestHeader(i, "value", e.target.value) }}
                                value={requestHeader.value}
                            />
                            <Button variant="danger" onClick={() => { deleteRequestHeader(i) }}>X</Button>
                        </InputGroup>
                    )}

                    <h2>Response</h2>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="responseMap">Response Map</Form.Label>
                        <Form.Control type="text" id="responseMap" name="responseMap" />
                        <Form.Text className="text-muted">
                            The resulting object is <i>response</i>; use JS template literal syntax to map your data (i.e.: <i>Name: $&#123;response.name&#125; $&#123;response.lastName&#125;</i>).
                        </Form.Text>
                    </Form.Group>

                    <h3>Headers</h3>

                    <Button variant="primary" className="mb-3" onClick={handleAddResponseHeader}>Add Response Header</Button>

                    {responseHeaders.map((responseHeader, i) =>
                        <InputGroup key={i} className="mb-3">
                            <Form.Select
                                id={`dd-response-header-${i}`}
                                onChange={e => { handleChangeResponseHeader(i, "type", e.target.value) }}
                                value={responseHeader.type}
                            >
                                <option value="">Select Item</option>
                                {headerTypes.map((headerType, j) => (
                                    <option key={j} value={headerType.value}>{headerType.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control
                                placeholder="Add header value"
                                onChange={e => { handleChangeRequestHeader(i, "value", e.target.value) }}
                                value={responseHeader.value}
                            />
                            <Button variant="danger" onClick={() => { deleteResponseHeader(i) }}>X</Button>
                        </InputGroup>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="danger" type="reset">Cancel</Button>
                    <Button variant="primary" type="submit">{props.edit < 0 ? "Register" : "Save"}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}