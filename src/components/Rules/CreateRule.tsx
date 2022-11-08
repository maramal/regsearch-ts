import { useContext, useEffect, useRef, useState } from "react";
import { Button, Form, ButtonGroup, Modal } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";

export const RULE_REPLACETYPE_LINE = "line"
export const RULE_REPLACETYPE_OCCURRENCE = "occurrence"
export const RULE_LOCATION_NEXT = "next"
export const RULE_LOCATION_PREVIOUS = "previous"

export type REPLACETYPE = typeof RULE_REPLACETYPE_LINE | typeof RULE_REPLACETYPE_OCCURRENCE
export type LOCATIONTYPE = typeof RULE_LOCATION_NEXT | typeof RULE_LOCATION_PREVIOUS

export interface Rule {
    name: string
    sourceSearchPattern: RegExp
    replaceType: REPLACETYPE
    value: string
    targetSearchPattern?: RegExp
    location?: LOCATIONTYPE
}

interface FormData extends EventTarget {
    name: HTMLInputElement
    sourceSearchPattern: HTMLInputElement
    replaceType: string
    value: HTMLInputElement
    targetSearchPattern?: HTMLInputElement
    location?: string
}

interface CreateRuleProps {
    displayNewRule: boolean
    setDisplayNewRule: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CreateRule(props: CreateRuleProps) {
    const context = useContext(GlobalContext);

    const [replaceType, setReplaceType] = useState<REPLACETYPE>(RULE_REPLACETYPE_LINE);
    const [location, setLocation] = useState<LOCATIONTYPE>(RULE_LOCATION_NEXT);
    const [status, setStatus] = useState("");
    
    const nameRef = useRef<HTMLInputElement>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = e.target as FormData

        const rule: Rule = {
            name: formData.name.value,
            sourceSearchPattern: new RegExp(formData.sourceSearchPattern.value),
            replaceType,
            value: formData.value.value
        };

        if (replaceType === RULE_REPLACETYPE_OCCURRENCE) {
            if (formData.targetSearchPattern === undefined) {
                setStatus("Target search pattern is invalid")
                return
            }

            rule.targetSearchPattern = new RegExp(formData.targetSearchPattern.value);
            rule.location = location;
        }

        context.setRules([...context.rules, rule]);

        (e.target as HTMLFormElement).reset();
        handleReset();
    }

    function handleReset() {
        setReplaceType(RULE_REPLACETYPE_LINE);
        setLocation(RULE_LOCATION_NEXT);
        setStatus("");

        props.setDisplayNewRule(false);
    }

    useEffect(() => {
        nameRef.current?.focus();
    }, [props.displayNewRule])

    return (
        <Modal show={props.displayNewRule} onHide={() => { props.setDisplayNewRule(false) }}>
            <Modal.Header closeButton>
                <Modal.Title>Add new rule</Modal.Title>
            </Modal.Header>

            <Form
                onSubmit={handleSubmit}
                onReset={handleReset}
                style={{ display: props.displayNewRule ? "block" : "none" }}
                autoComplete="off"
            >

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control type="text" id="name" name="name" ref={nameRef} required />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="sourceSearchPattern">Source search pattern:</Form.Label>
                        <Form.Control
                            type="text"
                            id="sourceSearchPattern"
                            name="sourceSearchPattern"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="replaceType">Replace type:</Form.Label>
                        <Form.Select
                            id="replaceType"
                            name="replaceType"
                            onChange={(e) => {
                                setReplaceType(e.target.value as REPLACETYPE);
                            }}
                            defaultValue={replaceType}
                            required
                        >
                            <option value="line">Replace line</option>
                            <option value="occurrence">Replace occurrence</option>
                        </Form.Select>
                    </Form.Group>

                    {replaceType === "occurrence" && (
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="targetSearchPattern">Target search pattern:</Form.Label>
                            <Form.Control
                                type="text"
                                id="targetSearchPattern"
                                name="targetSearchPattern"
                                required
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="value">Value:</Form.Label>
                        <Form.Control type="text" id="value" name="value" required />
                    </Form.Group>

                    {replaceType === "occurrence" && (
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="location">Occurrence location:</Form.Label>
                            <Form.Select
                                id="location"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value as LOCATIONTYPE);
                                }}
                            >
                                <option value="next">Next occurrence</option>
                                <option value="previous">Previous occurrence</option>
                            </Form.Select>
                        </Form.Group>
                    )}

                    <p className="form-status">{status}</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="danger" type="reset">Cancel</Button>
                    <Button variant="primary" type="submit">Submit</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
