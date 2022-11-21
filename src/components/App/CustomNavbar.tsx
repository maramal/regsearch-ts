import { useContext } from "react";
import { Nav } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";

export default function CustomNavbar() {
    const context = useContext(GlobalContext)

    return (
        <Nav className="me-auto">
            <Nav.Link onClick={() => { context.setCurrentStep(1) }}>Home</Nav.Link>
            <Nav.Link onClick={() => { context.setCurrentStep(5) }}>Middlewares</Nav.Link>
        </Nav>
    )
}