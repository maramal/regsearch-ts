import splitLines from "split-lines";
import { GlobalContextDefaultValue } from "../context/GlobalContext";
import {
    LOCATIONTYPE,
    Rule,
    RULE_LOCATION_NEXT,
    RULE_REPLACETYPE_LINE,
    RULE_REPLACETYPE_OCCURRENCE
} from "../Rules/CreateRule";

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

        debugger

        for (let ri = 0; ri < this.rules.length; ri++) {
            const rule = this.context.rules[ri]

            if (this.context.newText.length > 0) {
                this.lines = splitLines(this.context.newText, { preserveNewlines: true });
            } else {
                this.lines = splitLines(this.context.text, { preserveNewlines: true });
            }

            const {
                location,
                name,
                replaceType,
                sourceSearchPattern,
                targetSearchPattern,
                value
            } = rule;

            // Line processing
            for (let li = 0; li < this.lines.length; li++) {
                let line = this.lines[li];

                this.setStatus(`Processed line ${li+1} from ${this.lines.length} lines`)

                if (this.context.lines[li] !== undefined) continue;

                try {
                    if (replaceType === RULE_REPLACETYPE_LINE) {
                        this.replaceLine(line, sourceSearchPattern, value)
                    } else if (replaceType === RULE_REPLACETYPE_OCCURRENCE) {
                        if (location === undefined) throw new Error("location is invalid")
                        if (targetSearchPattern === undefined) throw new Error("target search pattern is invalid")

                        // add current line if it's different from the target search pattern
                        if (!targetSearchPattern.test(line)) {
                            this.newLines = [...this.newLines, line]
                        } else {
                            this.replaceOccurrence(location, li, sourceSearchPattern, targetSearchPattern, value)
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

    /** Replace the previous or the next occurrence according to the position and assign to the context.newLines
     * 
     * @param location              Next or previous occurrence
     * @param li                    Line index
     * @param sourceSearchPattern   The regular expression to replace
     * @param targetSearchPattern   The regular expression for the matching line
     * @param value                 The value to replace the target search pattern
     */
    private replaceOccurrence(location: LOCATIONTYPE, li: number, sourceSearchPattern: RegExp, targetSearchPattern: RegExp, value: string): void {
        /** Initialize the line number according to the occurrence location
         * 
         * @param li The line number
         * @returns  The line number initialized
         */
        const setI = (li: number) => location === RULE_LOCATION_NEXT ? li + 1 : li - 1

        /** Set the operation according to the occurrence location
         * 
         * @param i The sub-line operation
         * @returns The operation
         */
        const operation = (i: number) => location === RULE_LOCATION_NEXT ? i + 1 : i - 1

        /** Checks whether the line is valid or not
         * 
         * @param i The line number to check
         * @returns A boolean that represents the comparation result
         */
        const isLineValid = (i: number) => location === RULE_LOCATION_NEXT ? i <= this.lines.length : i >= 0

        let i = setI(li)
        while (isLineValid(i)) {
            const line = this.lines[i]

            if (this.patternMatches(targetSearchPattern, line)) {
                this.newLines[i] = line.replace(sourceSearchPattern, value)

                i = location === RULE_LOCATION_NEXT ? this.lines.length : 0
            }

            i = operation(i);
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
}