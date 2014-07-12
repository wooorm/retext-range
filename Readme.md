# retext-range [![Build Status](https://travis-ci.org/wooorm/retext-range.svg?branch=master)](https://travis-ci.org/wooorm/retext-range) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-range.svg)](https://coveralls.io/r/wooorm/retext-range?branch=master)

[![browser support](https://ci.testling.com/wooorm/retext-range.png) ](https://ci.testling.com/wooorm/retext-range)

See [Browser Support](#browser-support) for more information (a.k.a. don’t worry about those grey icons above).

---

Ranges—similar to DOM’s [Range](http://dom.spec.whatwg.org/#introduction-to-dom-ranges)—for [retext](https://github.com/wooorm/retext "Retext"): A Range object represents a sequence of content within a TextOM tree. Each range has a start and an end (two “boundary points”—each in turn a node and an offset). In other words, a range represents a piece of content within a TextOM tree between two points.

## Installation

NPM:
```sh
$ npm install retext-range
```

Component.js:
```sh
$ component install wooorm/retext-range
```

## Usage

```js
var Retext = require('retext'),
    retextRange = require('retext-range');

var root = new Retext()
    .use(retextRange)
    .parse(
        'Some simple English words in a sentence. And some ' +
        'more words in another sentence.'
    );

/* The tree now looks as follows:
 *
 * RootNode:
 * └─ ParagraphNode:
 *    ├─ SentenceNode:
 *    │   ├─ WordNode:
 *    │   |   └─ "Some"
 *    │   ├─ WhiteSpaceNode:
 *    │   |   └─ " "
 *    │   ├─ WordNode:
 *    │   |   └─ "simple"
 *    │   ├─ WhiteSpaceNode:
 *    │   |   └─ " "
 *    │   ├─ WordNode:
 *    │   |   └─ "English"
 *    │   ├─ WhiteSpaceNode:
 *    │   |   └─ " "
 *    │   ├─ WordNode:
 *    │   |   └─ "words"
 *    │   ├─ WhiteSpaceNode:
 *    │   |   └─ " "
 *    │   ├─ WordNode:
 *    │   |   └─ "in"
 *    │   ├─ WhiteSpaceNode:
 *    │   |   └─ " "
 *    │   ├─ WordNode:
 *    │   |   └─ "a"
 *    │   ├─ WhiteSpaceNode:
 *    │   |   └─ " "
 *    │   ├─ WordNode:
 *    │   |   └─ "sentence"
 *    │   └─ PunctuationNode:
 *    │       └─ "."
 *    ├─ WhiteSpaceNode:
 *    │   └─ " "
 *    └─ SentenceNode:
 *        ├─ WordNode:
 *        |   └─ "And"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "some"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "more"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "words"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "in"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "another"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "sentence"
 *        └─ PunctuationNode:
 *            └─ "."
 */

var range = new root.TextOM.Range(),
    firstSentenceNode = root.head.head,
    lastSentenceNode = root.head.tail,
    start = firstSentenceNode[11], // WhiteSpaceNode: " ", after "a"
    end = lastSentenceNode[10]; // WordNode: "another"

// Select some content:
range.setStart(start); 
range.setEnd(end.head, 1); // "a|nother"

// Remove the content covered by the range:
range.removeContent();

/* The tree now looks as follows:
 *
 * RootNode:
 * └─ ParagraphNode:
 *    ├─ SentenceNode:
 *    │   ├─ WordNode:
 *    |   |   └─ "Some"
 *    │   ├─ WhiteSpaceNode:
 *    |   |   └─ " "
 *    │   ├─ WordNode:
 *    |   |   └─ "simple"
 *    │   ├─ WhiteSpaceNode:
 *    |   |   └─ " "
 *    │   ├─ WordNode:
 *    |   |   └─ "English"
 *    │   ├─ WhiteSpaceNode:
 *    |   |   └─ " "
 *    │   ├─ WordNode:
 *    |   |   └─ "words"
 *    │   ├─ WhiteSpaceNode:
 *    |   |   └─ " "
 *    │   ├─ WordNode:
 *    |   |   └─ "in"
 *    │   ├─ WhiteSpaceNode:
 *    |   |   └─ " "
 *    │   └─ WordNode:
 *    |       └─ "a"
 *    └─ SentenceNode:
 *        ├─ WordNode:
 *        |   └─ "nother"
 *        ├─ WhiteSpaceNode:
 *        |   └─ " "
 *        ├─ WordNode:
 *        |   └─ "sentence"
 *        └─ PunctuationNode:
 *            └─ "."
 */
```

Note that the sentences are **not** joined together, retext-range is agnostic about content (meaning), and just looks at the nodes the user selects. The white space between the two sentences is however removed, as it was completely covered by the range.

## API

#### TextOM.Range()
Constructor. Creates a new Range (an object allowing for cross-tree manipulation).

##### TextOM\.Range#setStart(node, offset?)
Set the start container and offset of a range.

- node (`Node`): The node to start the range at or in;
- offset (Non-negative integer [`Number`], `null`, or `Infinity`): Point to end at, defaults to `null`.

##### TextOM\.Range#setEnd(node, offset?)
Set the end container and offset of a range.

- node (`Node`): The node to end the range at or in;
- offset (Non-negative integer [`Number`], `null`, or `Infinity`): Point to end at, defaults to `Infinity`.

##### TextOM\.Range#toString()
Return the result of calling `toString` on each completely covered node inside `range`, sub-stringing partially covered nodes when necessary.

##### TextOM\.Range#removeContent()
Removes each completely covered node inside `range`, splitting partially covered nodes when necessary. Returns an array containing the removed nodes.

##### TextOM\.Range#getContent()
Returns an array containing each completely covered node inside `range`, ignores partially covered Text nodes (TextNode, SourceNode).

## Browser Support
Pretty much every browser (available through BrowserStack) runs all retext-content unit tests.

## License

  MIT
