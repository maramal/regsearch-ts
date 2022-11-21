import { useContext } from "react";
import { GlobalContext } from "../context/GlobalContext";
import SourceSelection from "../SourceSelection";
import Rules from "../Rules";
import FileProcessing from "../FileProcessing";
import Results from "../Results";
import Middlewares from "../Middlewares";

export default function Stepper() {
  const context = useContext(GlobalContext);

  function getStep() {
    switch (context.currentStep) {
      case 1:
        return <SourceSelection />;
      case 2:
        return <Rules />;
      case 3:
        return <FileProcessing />;
      case 4:
        return <Results />;
      case 5:
        return <Middlewares />

      default:
        return <p>Step not found</p>;
    }
  }

  return getStep();
}
