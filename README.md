# Reg Search

The objective of this project is to provide an advanced search and replace application that will be used with large text files to automatize repetitive tasks.

> This application runs completely on client side, so the process speed depends on your CPU speed.

> This application does not store any data or use cookies from third parties.

## Usage

1. Select an input source. So far, text input is the only available source.
2. Paste the text you want to use in the textarea input and submit.
3. Add rules according to your needs:
  
  | Field | Description |
  |-------|-------------|
  | Name | A descriptive rule name. |
  | Source search pattern | A regular expression. You can read about regular expressions syntax [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet) |
  | Replace type | Type of replace. `Replace line` replaces the same line and `Replace occurrence` replaces a line next or before the selected. |
  | Target search pattern | A regular expression to match the next or previous occurrence. |
  | Value | The value to be replaced with in the same line or the next or previous occurrence where `$n` represents the source search pattern groups respectively. |
  | Occurrence location | Position of the occurrence to replace according to the current line. |

4. Click on "Process rules" button next to "Add rule" button.
5. Click on "View results" if there was no errors. Otherwise check them under "Errors" title.
6. Copy the text or start over.

## Version 2.0

In a future version of this application, each rule's value will be able to be processed by a middleware.