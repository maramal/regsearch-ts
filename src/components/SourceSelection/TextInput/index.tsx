import { useContext, useEffect, useRef } from "react";
import { Col, Form, Button, Row } from "react-bootstrap";
import { GlobalContext } from "../../context/GlobalContext";

interface FormData extends EventTarget {
	text: HTMLInputElement
}

export default function TextInput() {
	const context = useContext(GlobalContext);

	const inputRef = useRef<HTMLTextAreaElement>(null);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formData = e.target as FormData

		context.setText(formData.text.value);
		context.setCurrentStep(2);
	}

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	return (
		<Row>
			<Col>
				<Form onSubmit={handleSubmit} className="w-50">
					<Form.Group className="mb-3">
						<Form.Label htmlFor="text">Text:</Form.Label>
						<Form.Control 
							as="textarea"
							id="text" 
							name="text" 
							rows={15} 
							value={context.text} 
							onChange={e => { 
								context.setText(e.target.value) 
							}}
							ref={inputRef}
							required />
					</Form.Group>
					<Button variant="primary" type="submit" disabled={context.text.trim().length < 1}>Submit</Button>
				</Form>
			</Col>
		</Row>
	);
}
