import { Container, Row, Col, Navbar } from "react-bootstrap";
import GlobalContext from "../context/GlobalContext";
import Stepper from "../Stepper";
import "./styles.css";

export default function App() {
	return (
		<GlobalContext>
			<Navbar bg="light" expand="lg" className="mb-5">
				<Container fluid>
					<Navbar.Brand>Regex Search</Navbar.Brand>
				</Container>
			</Navbar>
			<Stepper />
		</GlobalContext>
	);
}
