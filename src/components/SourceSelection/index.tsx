import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import TextInput from "./TextInput";

export default function SourceSelection() {
	const [source, setSource] = useState("");

	function getSourceComponent() {
		switch (source) {
			case "text":
				return <TextInput />;
			default:
				return <p>Source component not found</p>;
		}
	}

	return (
		<Container>
			<Row className="mb-2">
				<Col>
					<h2>Step1: Select source</h2>
				</Col>
			</Row>
			<Row className="mb-5">
				<Col>
					<Button
						variant="primary"
						onClick={() => {
							setSource("text");
						}}
						disabled={source === "text"}
					>
						Text area
					</Button>
				</Col>
			</Row>

			{source !== "" && getSourceComponent()}
		</Container>
	);
}