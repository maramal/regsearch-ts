import React, { createContext, useState } from "react";
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
	status: string[]
	setStatus: React.Dispatch<React.SetStateAction<string[]>>
}

export const GlobalContext = createContext({} as GlobalContextDefaultValue);

export default function GlobalContextWrapper({ children }: { children: React.ReactNode }) {
	const [currentStep, setCurrentStep] = useState(1);

	const [text, setText] = useState("");
	const [newText, setNewText] = useState("");
	const [rules, setRules] = useState([] as Rule[]);
	const [lines, setLines] = useState([] as string[]);
	const [status, setStatus] = useState([] as string[]);

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
	};

	return (
		<GlobalContext.Provider value={defaultValue}>
			{children}
		</GlobalContext.Provider>
	);
}
