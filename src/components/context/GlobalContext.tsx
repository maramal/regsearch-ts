import React, { createContext, useState } from "react";
import { Status } from "../FileProcessing/FileProcess";
import { Middleware } from "../Middlewares/RegisterMiddleware";
import { Rule } from "../Rules/CreateRule";

export interface GlobalContextDefaultValue {
	currentStep: number
	setCurrentStep: React.Dispatch<React.SetStateAction<number>>
	text: string
	setText: React.Dispatch<React.SetStateAction<string>>
	newText: string
	setNewText: React.Dispatch<React.SetStateAction<string>>
	rules: Rule[]
	setRules: React.Dispatch<React.SetStateAction<Rule[]>>
	lines: string[]
	setLines: React.Dispatch<React.SetStateAction<string[]>>
	status: Status[]
	setStatus: React.Dispatch<React.SetStateAction<Status[]>>
	middlewares: Middleware[]
	setMiddlewares: React.Dispatch<React.SetStateAction<Middleware[]>>
}

export const GlobalContext = createContext({} as GlobalContextDefaultValue);

const defaultMiddlewares: Middleware[] = [
	{
        name: "JSON Placeholder",
        request: {
            url: "https://jsonplaceholder.typicode.com/users/1",
            method: "GET",
            queryString: "",
            headers: [
                {
                    type: "Content-Type",
                    value: "application/json"
                }
            ],
        },
        response: {
            headers: [
                {
                    type: "Content-Type",
                    value: "application/json"
                }
            ],
            responseMap: "`${response.name} <${response.email}>`"
        }
    }
]

export default function GlobalContextWrapper({ children }: { children: React.ReactNode }) {
	const [currentStep, setCurrentStep] = useState(1);

	const [text, setText] = useState("");
	const [newText, setNewText] = useState("");
	const [rules, setRules] = useState([] as Rule[]);
	const [lines, setLines] = useState([] as string[]);
	const [status, setStatus] = useState([] as Status[]);
	const [middlewares, setMiddlewares] = useState(defaultMiddlewares)

	const defaultValue: GlobalContextDefaultValue = {
		currentStep,
		setCurrentStep,
		text,
		setText,
		newText,
		setNewText,
		rules,
		setRules,
		lines,
		setLines,
		status,
		setStatus,
		middlewares,
		setMiddlewares,
	};

	return (
		<GlobalContext.Provider value={defaultValue}>
			{children}
		</GlobalContext.Provider>
	);
}
