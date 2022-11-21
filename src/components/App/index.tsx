import { Container, Navbar, Nav } from "react-bootstrap";
import GlobalContext from "../context/GlobalContext";
import Stepper from "../Stepper";
import CustomNavbar from "./CustomNavbar";
import "./styles.css";

export default function App() {
	return (
		<GlobalContext>
			<Navbar bg="light" expand="lg" className="mb-5">
				<Container fluid>
					<Navbar.Brand>Regex Search</Navbar.Brand>
					<CustomNavbar />
				</Container>
			</Navbar>
			<Stepper />
		</GlobalContext>
	);
}
