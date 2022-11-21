import axios from "axios"
import splitLines from "split-lines"
import { GlobalContextDefaultValue } from "../context/GlobalContext"
import {
    Rule,
    RULE_LOCATION_NEXT,
    RULE_REPLACETYPE_LINE,
    RULE_REPLACETYPE_OCCURRENCE
} from "../Rules/CreateRule"

export interface Status {
	dt: Date,
	value: string
}

interface ReplaceOccurrenceParams {
    /** Line number */
    li: number

    /** Input Line */
    input: string

    /** Input Regular Expression */
    sourceSearchPattern: RegExp

    /** Output Regular Expression */
    targetSearchPattern: RegExp

    /** Replace output value */
    value: string

    /** Middleware Index number */
    middlewareIndex?: number
}

interface ReplaceWithMiddlewareParams {
    middlewareIndex: number
    pattern: RegExp
    line: string
}

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
    async processLines() {
        // Rule processing
        for (let ri = 0; ri < this.rules.length; ri++) {
            const rule = this.context.rules[ri]

            if (this.context.newText.length > 0) {
                this.lines = splitLines(this.context.newText)
            } else {
                this.lines = splitLines(this.context.text)
            }

            const {
                location,
                name,
                replaceType,
                sourceSearchPattern,
                targetSearchPattern,
                middlewareIndex,
            } = rule

            let { value } = rule

            // Line processing
            for (let li = 0; li < this.lines.length; li++) {
                let line = this.lines[li]

                // skip line already added
                if (this.newLines[li] !== undefined) {
                    continue
                }

                this.setStatus(`Processed line ${li + 1} from ${this.lines.length} lines`)

                // add line skip empty source match
                if (this.patternMatches(sourceSearchPattern, line) && this.isMatchEmpty(line, sourceSearchPattern)) {
                    this.newLines = [...this.newLines, line]
                    continue
                }

                try {
                    if (replaceType === RULE_REPLACETYPE_LINE) {
                        if (middlewareIndex !== undefined) {
                            await this.replaceLine(line, sourceSearchPattern, value as string, middlewareIndex)
                        } else if (value !== undefined) {
                            this.replaceLine(line, sourceSearchPattern, value as string)
                        } else {
                            throw new Error("Couldn't process value from rule")
                        }
                    } else if (replaceType === RULE_REPLACETYPE_OCCURRENCE) {
                        // type guards
                        if (location === undefined) throw new Error("location is invalid")
                        if (targetSearchPattern === undefined) throw new Error("target search pattern is invalid")

                        // add current line
                        this.newLines = [...this.newLines, line]

                        // is a match
                        if (sourceSearchPattern.test(line)) {
                            const replaceParams: ReplaceOccurrenceParams = {
                                li,
                                input: line,
                                sourceSearchPattern,
                                targetSearchPattern,
                                value: value as string,
                            }

                            if (middlewareIndex !== undefined) {
                                replaceParams.middlewareIndex = middlewareIndex
                            }

                            if (location === RULE_LOCATION_NEXT) {
                                await this.replaceNextOccurrence(replaceParams)
                            } else {
                                await this.replacePreviousOccurrence(replaceParams)
                            }
                        }
                    }
                } catch (ex: any) {
                    const status = `Rule ${name} failed when processing line #${li} with message: ${ex.message}`
                    this.setStatus(status)
                }
            }

            this.context.setNewText(this.newLines.join("\n"))
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
     * @param params The parameters to replace the next occurrence
     */
    private async replaceNextOccurrence(params: ReplaceOccurrenceParams) {
        let i = params.li + 1
        while (i <= this.lines.length) {
            const line = this.lines[i]
            if (this.patternMatches(params.targetSearchPattern, line)) {
                if (params.middlewareIndex !== undefined) {
                    await this.assignNewLine(i, params.input, params.sourceSearchPattern, params.targetSearchPattern, params.value, params.middlewareIndex)
                } else {
                    await this.assignNewLine(i, params.input, params.sourceSearchPattern, params.targetSearchPattern, params.value)
                }

                i = this.lines.length
            }
            i++;
        }
    }

    /** Replace next occurrence with given parameters
     * 
     * @param params The parameters to replace the previous occurrence
     */
    private async replacePreviousOccurrence(params: ReplaceOccurrenceParams) {
        let i = params.li - 1
        while (i >= 0) {
            const line = this.lines[i]
            if (this.patternMatches(params.targetSearchPattern, line)) {
                if (params.middlewareIndex !== undefined) {
                    await this.assignNewLine(i, params.input, params.sourceSearchPattern, params.sourceSearchPattern, params.value, params.middlewareIndex)
                } else {
                    await this.assignNewLine(i, params.input, params.sourceSearchPattern, params.sourceSearchPattern, params.value)
                }

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
     * @param middlewareIndex       The middleware index number (optional)
     */
    private async replaceLine(line: string, sourceSearchPattern: RegExp, value: string, middlewareIndex?: number): Promise<void> {
        if (sourceSearchPattern.test(line)) {
            if (middlewareIndex !== undefined) {
                const params: ReplaceWithMiddlewareParams = {
                    middlewareIndex, 
                    pattern: sourceSearchPattern, 
                    line
                }
                const replacedValue = await this.replaceWithMiddleware(params)
                line = line.replace(sourceSearchPattern, replacedValue)
            } else {
                line = line.replace(sourceSearchPattern, value)
            }            
        }

        this.newLines = [...this.newLines, line]
    }

    /** Add a line to context.status
     * 
     * @param status The text to add
     */
    private setStatus(status: string) {
        const newStatus: Status = {
            dt: new Date(),
            value: status,
        }

        const statuses = this.context.status
        statuses.push(newStatus)
        this.context.setStatus(statuses)
    }

    /** Verify given string is empty for given regular expression
     * 
     * @param text The text to verify
     * @param pattern The regular expression to match
     * @returns The result of the match
     */
    private isMatchEmpty(text: string, pattern: RegExp): boolean {
        const match = text.match(pattern)

        if (match !== null && match.length > 1) {
            if (match[1].trim().length === 0) return true
            return false
        }

        return true
    }

    /** Assign a new line to specific index
     * 
     * @param i The line index
     * @param line The line to be replaced
     * @param sourceSearchPattern The regular expression to call middleware
     * @param targetSearchPattern The regular expression to search for
     * @param value The value to replace with
     * @param middlewareIndex The middleware index number (optional)
     */
    private async assignNewLine(i: number, line: string, sourceSearchPattern: RegExp, targetSearchPattern: RegExp, value: string, middlewareIndex?: number) {
        if (middlewareIndex !== undefined) {
            const params: ReplaceWithMiddlewareParams = {
                middlewareIndex, 
                pattern: targetSearchPattern, 
                line: this.lines[i]
            }
            value = await this.replaceWithMiddleware(params)
        }

        this.newLines[i] = line.replace(targetSearchPattern, value)
    }

    /** Get value from API
     * 
     * @param params The function parameters
     * @return The text to be replaced with
     */
    async replaceWithMiddleware(params: ReplaceWithMiddlewareParams): Promise<string> {
        const middleware = this.context.middlewares[params.middlewareIndex]
        const matches = params.line.match(params.pattern)
        matches?.splice(0, 1)

        let body = {}
        let qs = ""

        if (middleware.request.body !== undefined && matches !== null && matches.length > 0) {
            body = this.getBody(middleware.request.body, matches)
        }

        if (middleware.request.queryString !== undefined && matches !== null && matches.length > 0) {
            qs = this.getQueryString(middleware.request.queryString, matches)
        }

        const config = {
            url: middleware.request.url,
            timeout: 1000,
            method: middleware.request.method,
            headers: {} as any,
            body,
            params: qs,
        }

        middleware.request.headers.forEach(header => {
            if (header.type === undefined || header.value === undefined) return
            config.headers[header.type] = header.value
        })

        const res = await axios(config)
        if (res.status > 205) {
            throw new Error("Couldn't get data from API")
        }
        const response = res.data
        const svalue = middleware.response.responseMap
        return eval(svalue) as string

    }

    /** Get the query string with replaced group values
     * 
     * @param queryString The query string from middleware input
     * @param matches The result of regular expression match
     * @returns The formatted query string
     */
    private getQueryString(queryString: string, matches: string[]): string {
        const entries = [...new URLSearchParams(queryString).entries()]

        if (matches.length !== entries.length) {
            return ""
        }

        const replaced = entries.reduce((params, [key], index) => {
            params.append(key, matches[index])
            return params
        }, new URLSearchParams())

        return replaced.toString()
    }

    /** Return the middleware body input as an object
     * 
     * @param body The body input
     * @param matches The line matches
     * @returns The parsed body with replaced values
     */
    private getBody(body: string, matches: string[]): any {
        const parsedBody = JSON.parse(body)
        const groupRegex = /\$\d+/g

        Object.keys(parsedBody).forEach(key => {
            for (let match of matches) {
                parsedBody[key] = (parsedBody[key] as string).replace(groupRegex, match)
            }
        })

        return parsedBody
    }
}