import splitLines from "split-lines"
import { GlobalContextDefaultValue } from "../context/GlobalContext"
import {
    LOCATIONTYPE,
    Rule,
    RULE_LOCATION_NEXT,
    RULE_REPLACETYPE_LINE,
    RULE_REPLACETYPE_OCCURRENCE
} from "../Rules/CreateRule"

export class FileProcess {
    private context: GlobalContextDefaultValue
    private newLines: string[] = []
    private lines: string[]
    private rules: Rule[]

    /** Set the constructor parameters
     * 
     * @param context The app context
     */
    constructor(context: GlobalContextDefaultValue) {
        this.context = context
        this.lines = context.lines
        this.rules = context.rules
    }

    /** Iterate each line replacing the line / occurrence
     */
    processLines() {
        this.setStatus("Starting to process lines")

        // Rule processing
        for (let ri = 0; ri < this.rules.length; ri++) {
            const rule = this.context.rules[ri]

            if (this.context.newText.length > 0) {
                this.lines = splitLines(this.context.newText, { preserveNewlines: true })
            } else {
                this.lines = splitLines(this.context.text, { preserveNewlines: true })
            }

            const {
                location,
                name,
                replaceType,
                sourceSearchPattern,
                targetSearchPattern,
                value
            } = rule

            // Line processing
            for (let li = 0; li < this.lines.length; li++) {
                let line = this.lines[li]

                this.setStatus(`Processed line ${li+1} from ${this.lines.length} lines`)

                // skip line already added
                if (this.newLines[li] !== undefined) {
                    continue
                }

                // add line skip empty source match
                if (this.patternMatches(sourceSearchPattern, line) && this.isEmptyMatch(line, sourceSearchPattern)) {
                    this.newLines = [...this.newLines, line]
                    continue
                }

                try {
                    if (replaceType === RULE_REPLACETYPE_LINE) {
                        this.replaceLine(line, sourceSearchPattern, value)
                    } else if (replaceType === RULE_REPLACETYPE_OCCURRENCE) {
                        // type guards
                        if (location === undefined) throw new Error("location is invalid")
                        if (targetSearchPattern === undefined) throw new Error("target search pattern is invalid")

                        // add current line
                        this.newLines = [...this.newLines, line]

                        // is a match
                        if (sourceSearchPattern.test(line)) {
                            // input value to replace in target
                            let sourceMatch = line.match(sourceSearchPattern) as string[]
                            if (sourceMatch === null || sourceMatch.length < 2) {
                                throw new Error("Cannot determine source search pattern value")
                            }
                            const outputValue = sourceMatch[1]

                            if (location === RULE_LOCATION_NEXT) {
                                this.replaceNextOccurrence(li, targetSearchPattern, value, outputValue)
                            } else {
                                this.replacePreviousOccurrence(li, targetSearchPattern, value, outputValue)
                            }
                            
                        }                        
                    }
                } catch (ex: any) {
                    const status = `Rule ${name} failed when processing line #${li} with message: ${ex.message}`
                    this.setStatus(status)
                }
            }

            this.context.setNewText(this.newLines.join(""))
        }
    }

    /** Verifies the pattern matches with the current line
     * 
     * @param pattern   The regular expression to test the line
     * @param line      The current line
     * @returns         Whether the pattern matches the line or not
     */
    private patternMatches(pattern: RegExp, line: string): boolean {
        return pattern !== undefined && pattern.test(line) && line !== undefined
    }

    /** Replace next occurrence with given parameters
     * 
     * @param li Current line number
     * @param targetSearchPattern Output Regular Expression
     * @param value The value to replace the output match for the input
     * @param outputValue The output value from the source search pattern
     */
    private replaceNextOccurrence(li: number, targetSearchPattern: RegExp, value: string, outputValue: string) {
        let i = li + 1

        while (i <= this.lines.length) {
            const line = this.lines[i]

            if (this.patternMatches(targetSearchPattern, line)) {
                this.newLines[i] = outputValue.replace(targetSearchPattern, value)

                i = this.lines.length
            }

            i++;
        }
    }

    /** Replace previous occurrence with given parameters
     * 
     * @param li Current line number
     * @param targetSearchPattern Output Regular Expression
     * @param value The value to replace the output match for the input
     * @param outputValue The output value from the source search pattern
     */
    private replacePreviousOccurrence(li: number, targetSearchPattern: RegExp, value: string, outputValue: string) {
        let i = li - 1

        while (i >= 0) {
            const line = this.lines[i]

            if (this.patternMatches(targetSearchPattern, line)) {
                this.newLines[i] = outputValue.replace(targetSearchPattern, value)

                i = 0
            }

            i--;
        }
    }

    /** Replace the current line with the value and assign it to context.newLines
     * 
     * @param line                  The current line string
     * @param sourceSearchPattern   The regular expression to test the line
     * @param value                 The value to replace the line
     */
    private replaceLine(line: string, sourceSearchPattern: RegExp, value: string): void {
        if (sourceSearchPattern.test(line)) {
            line = line.replace(sourceSearchPattern, value)
        }

        this.newLines = [...this.newLines, line]
    }

    /** Add a line to context.status
     * 
     * @param status The text to add
     */
    private setStatus(status: string) {
        status = `${new Date().toUTCString()}: ` + status
        this.context.setStatus([...this.context.status, status])
    }

    /** Verify given string is empty for given regular expression
     * 
     * @param text The text to verify
     * @param pattern The regular expression to match
     * @returns The result of the match
     */
    private isEmptyMatch(text: string, pattern: RegExp): boolean {
        const match = text.match(pattern)

        return match === null || match[1].trim().length === 0
    }
}