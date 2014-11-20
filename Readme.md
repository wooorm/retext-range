# retext-range [![Build Status](https://img.shields.io/travis/wooorm/retext-range.svg?style=flat)](https://travis-ci.org/wooorm/retext-range) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-range.svg?style=flat)](https://coveralls.io/r/wooorm/retext-range?branch=master)

Ranges—similar to DOMs [Range](http://dom.spec.whatwg.org/#introduction-to-dom-ranges)—for [**retext**](https://github.com/wooorm/retext "Retext"): A **Range** represents a sequence of content within a **TextOM** tree. Each range has a start and an end (two “boundary points”—each a node and an offset). In other words, a range represents a piece of content within a TextOM tree between two points.

## Installation

npm:
```sh
$ npm install retext-range
```

Component:
```sh
$ component install wooorm/retext-range
```

Bower:
```sh
$ bower install retext-range
```

## Usage

```js
var Retext, retextRange, retext;

Retext = require('retext');
retextRange = require('retext-range');

retext = new Retext().use(retextRange);

retext.parse(
    'Some simple English words in a sentence. And some ' +
    'more words in another sentence.',
    function (err, tree) {
        var range, firstSentence, lastSentence, start, end;

        /* Handle errors. */
        if (err) {
            throw err;
        }

        range = new tree.TextOM.Range();
        firstSentence = tree.head.head;
        lastSentence = tree.head.tail;

        /* WhiteSpaceNode: " ", after "a" */
        start = firstSentence[11];

        /* WordNode: "another" */
        end = lastSentence[10];

        /* Select some content: */
        range.setStart(start);
        range.setEnd(end.head, 1); /* "a|nother" */

        /* Remove the content covered by the range: */
        range.removeContent();

        tree.toString();
        /* "Some simple English words in a nother sentence." */
    }
);
```

Note that the sentences are **not** joined together, **retext-range** is agnostic about content (meaning), and just looks at the selected nodes. The white space between the two sentences is however removed, as it was completely covered by the range.

## API

#### TextOM.Range()

Constructor. Creates a new Range.

##### TextOM\.Range#setStart(node, offset?)

Set the start container and offset of a range.

- node (`Node`): Node to start the range at.
- offset (Non-negative integer [`number`], `null`, or `Infinity`): Point to start at, defaults to `0`.

Returns self.

##### TextOM\.Range#setEnd(node, offset?)

Set the end container and offset of a range.

- node (`Node`): Node to end the range at.
- offset (Non-negative integer [`Number`], `null`, or `Infinity`): Point to end at, defaults to `Infinity`.

Returns self.

##### TextOM\.Range#toString()

Returns the result of calling `toString` on each completely covered node inside `range`, sub-stringing partially covered nodes where necessary.

##### TextOM\.Range#removeContent()

Removes each completely covered node inside `range`, removes the covered part of partially covered nodes.

Returns an array containing the removed nodes.

##### TextOM\.Range#getContent()

Returns an array containing each completely covered node inside `range`, ignores partially covered `Text` nodes (`TextNode`, `SourceNode`).

## License

MIT © Titus Wormer
