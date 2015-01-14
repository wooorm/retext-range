# retext-range [![Build Status](https://img.shields.io/travis/wooorm/retext-range.svg?style=flat)](https://travis-ci.org/wooorm/retext-range) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-range.svg?style=flat)](https://coveralls.io/r/wooorm/retext-range?branch=master)

Ranges—similar to DOMs [Range](http://dom.spec.whatwg.org/#introduction-to-dom-ranges), for [**retext**](https://github.com/wooorm/retext)—represent a sequence of content within a [**TextOM**](https://github.com/wooorm/textom) tree. Each range has a start and end (two “boundary points”—each a node and an offset). In other words, a range represents a piece of content within a [**TextOM**](https://github.com/wooorm/textom) tree between two points.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
$ npm install retext-range
```

[Component.js](https://github.com/componentjs/component):

```bash
$ component install wooorm/retext-range
```

[Bower](http://bower.io/#install-packages):

```bash
$ bower install retext-range
```

[Duo](http://duojs.org/#getting-started):

```javascript
var range = require('wooorm/retext-range');
```

## Usage

```javascript
var Retext = require('retext');
var range = require('retext-range');

var retext = new Retext().use(range);

retext.parse(
    'Some simple English words in a sentence. And some ' +
    'more words in another sentence.',
    function (err, tree) {
        if (err) throw err;

        var range = new tree.TextOM.Range();
        var firstSentence = tree.head.head;
        var lastSentence = tree.head.tail;

        /* WhiteSpaceNode: " ", after "a" */
        var start = firstSentence[11];

        /* WordNode: "another" */
        var end = lastSentence[10];

        /* Select some content */
        range.setStart(start);
        range.setEnd(end.head, 1); /* "a|nother" */

        /* Remove nodes covered by range */
        range.removeContent();

        tree.toString();
        /* "Some simple English words in a nother sentence." */
    }
);
```

Note that the sentences are _NOT_ joined together, **retext-range** is agnostic to “meaning”, and just looks at the selected nodes.
The white space between the two sentences is however removed, as it was completely covered by the range.

## API

### [TextOM](https://github.com/wooorm/textom).Range()

Constructor. Creates a new range.

### [TextOM.Range](#textomrange)#setStart([node](https://github.com/wooorm/textom#textomnode-nlcstnode), offset?)

Set `startContainer` and `startOffset` of `range`.

Parameters:

- `node` ([`Node`](https://github.com/wooorm/textom#textomnode-nlcstnode)) — Object to start `range` at.
- `offset` (Non-negative integer `number`, `null`, or `Infinity`) — Point in `node` to start at, defaults to `0`.

Returns self.

### [TextOM.Range](#textomrange)#setEnd([node](https://github.com/wooorm/textom#textomnode-nlcstnode), offset?)

Set `endContainer` and `endOffset` of `range`.

Parameters:

- `node` ([`Node`](https://github.com/wooorm/textom#textomnode-nlcstnode)) — Object to end `range` at.
- `offset` (Non-negative integer `number`, `null`, or `Infinity`) — Point in `node` to end at, defaults to `Infinity`.

Returns self.

### [TextOM.Range](#textomrange)#toString()

Returns text (`string`) of by `range` (partially) covered nodes.

### [TextOM.Range](#textomrange)#removeContent()

Split partially covered nodes. Remove all covered nodes.

Returns all nodes (`Array` of [`Node`](https://github.com/wooorm/textom#textomnode-nlcstnode)s).

### [TextOM.Range](#textomrange)#getContent()

Returns by `range` covered nodes (`Array` of [`Node`](https://github.com/wooorm/textom#textomnode-nlcstnode)s). Ignores partially covered [`Text`](https://github.com/wooorm/textom#textomtextvalue-nlcsttext)s.

## Performance

```text
                  TextOM.Range#setStart()
  18,898,197 op/s » A section
  17,423,587 op/s » An article

                  TextOM.Range#setEnd()
  16,153,655 op/s » A section
  17,243,205 op/s » An article

                  TextOM.Range#setStart() and TextOM.Range#setEnd()
       8,783 op/s » A section
         680 op/s » An article

                  TextOM.Range#setEnd() and TextOM.Range#setStart()
       7,907 op/s » A section
         698 op/s » An article

                  TextOM.Range#toString()
       1,212 op/s » A section
         120 op/s » An article

                  TextOM.Range#getContent()
     335,883 op/s » A section
     110,833 op/s » An article
```

## License

MIT © [Titus Wormer](http://wooorm.com)
