# Frequent Bugs

During the development process of `PaperCollateralRenderer` we have encountered a few detrimental bugs and documented their fixes.

### Fixes

**1. Font rendering**

- If the desired font is not rendering,
- Solution #1: This lib requires base64 encoded fonts in order to guarantee font availability. Check that your font is included in this format.
- Solution #2: Ensure that the imported fonts match all fonts used in your template, _especially the specific font weights._ Each template has [an array](https://github.com/urbit/PaperCollateralRenderer/blob/master/lib/src/templates.json) of fontFamilies and fontWeights used.

- How to test: In order to test for font availability, you must open font book and disable Inter, Inter UI and Source Code Pro or any fonts this library uses.

**2. Package issues**

- If your stack trace is something along the lines of:
  `'urbit-sigil-js' is imported by dist/js/lib/load.js, but could not be resolved – treating it as an external dependency`

- Solution #1: run `npm install` to install all necessary packages
- Solution #2: if the error persists even after Solution #1, try to npm install each component individually, such as `npm i urbit-sigil-js`

### Non-issues

The following stack traces are non-breaking errors (although we would like to eventually resolve them).

1. `Circular dependency: node_modules/rollup-plugin-node-builtins/src/es6/readable-stream/duplex.js`

2. `The "onwrite" hook used by plugin node-resolve is deprecated. The "generateBundle/writeBundle" hook should be used instead.`

3. `Each child in an array or iterator should have a unique "key" prop.`
