/** Error type: RegExp not valid */
export const ERROR_IS_VALID = "Regular expression is not valid"
export const ERROR_NON_GLOBAL = "Regular expression has no global flag"

/** Extends Regular Expression functionality */
export default class Regex {
  /** Regular expression passed setted as constructor */
  regex!: RegExp

  /** Validates the given regular expression has a global flag */
  isGlobal!: boolean

  /** Validates the regular expression is valid */
  isValid = true

  /** Initializes the constructor
   * 
   * @param regex Regular Expression as a string or regular expression to extend
   */
  constructor(regex: RegExp | string) {
    try {
      this.regex = new RegExp(regex)
      this.isGlobal = this.IsGlobal()

    } catch (ex) {
      this.isValid = false
    }
  }

  /** Gets the groups from the regular expression as an array of strings
   * 
   * @returns The groups array
   */
  groups(): string[] {
    if (!this.isValid) {
      this.error(ERROR_IS_VALID)
      return []
    }

    let selfMatch = this.regex.toString().match(this.regex)

    try {
      if (selfMatch === null) {
        throw new Error("Couldn't match the regular expression")
      }
      selfMatch.shift()
      return selfMatch as string[]
    } catch (ex) {
      if (ex instanceof TypeError) {
        this.error(`Couldn't find any groups in the regular expression."`)
        return []
      }
      this.error("Non captured error")
      return []
    }
  }

  /** The classic string method but improved and executed from the regular expression centralized functionalities
   * 
   * @param str The string to match the regular expression
   * @returns The array of strings
   */
  match(str: string): string[] {
    if (!this.isValid) {
      this.error(ERROR_IS_VALID)
      return []
    }

    return str.match(this.regex) as string[]
  }

  /** The classic string method but improved and executed from the regular expression centralized functionalities
   * 
   * @param str The string to match all occurrences with the regular expression
   * @returns The array of strings
   */
  matchAll(str: string): string[][] {
    if (!this.isValid) {
      this.error(ERROR_IS_VALID)
      return []
    }

    if (!this.isGlobal) {
      this.error(ERROR_NON_GLOBAL)
      return []
    }

    let iteratorArr: string[][] = []

    for (let regExpMatchArray of str.matchAll(this.regex)) {
      const regExpMatchArrayArr: string[] = []

      for (let regExpMatch of regExpMatchArray) {
        regExpMatchArrayArr.push(regExpMatch)
      }

      iteratorArr.push(regExpMatchArrayArr)

    }

    return iteratorArr
  }

  /** The classic RegExp method but executed from the regular expression centralized functionalities
   * 
   * @param str The string to test
   * @returns The validation
   */
  test(str: string): boolean {
    if (!this.isValid) {
      this.error(ERROR_IS_VALID)
      return false
    }

    return this.regex.test(str)
  }

  /** Validates that the regular expression is global
   * 
   * @returns The validation
   */
  private IsGlobal(): boolean {
    if (!this.isValid) {
      this.error(ERROR_IS_VALID)
      return false
    }

    const isGlobalPattern = new RegExp(/^\/.*\/.*g.*$/)
    return isGlobalPattern.test(this.regex.toString())
  }

  /** Displays an error in the console with the date and the message
   * 
   * @param err The error message to display
   */
  private error(err: string) {
    console.error(`${new Date().toISOString()} - Error: ${err}`)
  }
}
