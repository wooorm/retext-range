'use strict';

/**
 * Dependencies.
 */

var retextRange,
    inspect,
    Retext,
    assert;

retextRange = require('./');
inspect = require('retext-inspect');
Retext = require('retext');
assert = require('assert');

/**
 * Retext.
 */

var retext,
    TextOM,
    Range;

retext = new Retext().use(retextRange).use(inspect);

TextOM = retext.TextOM;
Range = TextOM.Range;

/**
 * Factory for multiple async operations in a test.
 */

function completeFactory(done, count) {
    var exception;

    return function (err) {
        /* istanbul ignore if */
        if (err) {
            exception = err;
        }

        count--;

        if (count < 1) {
            done(exception);
        }
    };
}

/**
 * Tests.
 */

describe('retext-range()', function () {
    it('should be a `function`', function () {
        assert(typeof retextRange === 'function');
    });

    it('should have an `attach` method', function () {
        assert(typeof retextRange.attach === 'function');
    });
});

describe('retext-range.attach()', function () {
    it('should attach a `Range` constructor to `TextOM`', function () {
        assert('Range' in TextOM);
    });
});

describe('TextOM.Range()', function () {
    it('should be a `function`', function () {
        assert(typeof Range === 'function');
    });
});

describe('TextOM.Range#setStart(node, offset?)', function () {
    it('should be a `function`', function () {
        assert(typeof new Range().setStart === 'function');
    });

    it('should throw when no `node` is given', function () {
        var range;

        range = new Range();

        assert.throws(function () {
            range.setStart();
        }, /undefined/);

        assert.throws(function () {
            range.setStart(false);
        }, /false/);
    });

    it('should NOT throw when `node` is not attached', function () {
        var range;

        range = new Range();

        assert.doesNotThrow(function () {
            range.setStart(new TextOM.WordNode());
        });
    });

    it('should throw when `offset` is negative', function () {
        assert.throws(function () {
            new Range().setStart(new TextOM.WordNode(), -1);
        }, /-1/);

        assert.throws(function () {
            new Range().setStart(new TextOM.WordNode(), -Infinity);
        }, /-Infinity/);
    });

    it('should NOT throw when `offset` is `NaN`', function () {
        var range;

        range = new Range();

        assert.doesNotThrow(function () {
            range.setStart(new TextOM.WordNode(), NaN);
        });
    });

    it('should treat an `offset` of `NaN` as `0`', function () {
        var range;

        range = new Range();

        range.setStart(new TextOM.WordNode(), NaN);

        assert(range.startOffset === 0);
    });

    it('should throw when a `offset` is non-number', function () {
        assert.throws(function () {
            new Range().setStart(new TextOM.WordNode(), 'failure');
        }, /failure/);
    });

    it('should NOT throw when `offset` is greater than `length` of ' +
        '`node`',
        function (done) {
            retext.parse('One two.', function (err, tree) {
                var node;

                node = tree.head.head;

                assert.doesNotThrow(function () {
                    new Range().setStart(node, 5);
                });

                assert.doesNotThrow(function () {
                    new Range().setStart(node, Infinity);
                });

                done(err);
            });
        }
    );

    it('should throw when `endContainer` does not share `node`s root',
        function (done) {
            var complete;

            complete = completeFactory(done, 2);

            retext.parse('test1', function (err, tree1) {
                retext.parse('test2', function (err, tree2) {
                    var range;

                    range = new Range();

                    range.setEnd(tree1.head.head.head);

                    assert.throws(function () {
                        range.setStart(tree2.head.head.head);
                    }, /WrongRootError/);

                    complete(err);
                });

                complete(err);
            });
        }
    );

    it('should NOT throw when `offset` is given, but `node` has no `length`',
        function () {
            assert.doesNotThrow(function () {
                new Range().setStart(new TextOM.WordNode(), 1);
            });

            assert.doesNotThrow(function () {
                new Range().setStart(new TextOM.WordNode(), Infinity);
            });
        }
    );

    it('should return `self`', function () {
        var range;

        range = new Range();

        assert(range.setStart(new TextOM.WordNode()) === range);
    });

    it('should set `startContainer` and `startOffset` to the given values',
        function () {
            var range,
                node,
                offset;

            range = new Range();
            node = new TextOM.WordNode();
            offset = 1;

            range.setStart(node, offset);

            assert(range.startContainer === node);
            assert(range.startOffset === offset);
        }
    );

    it('should switch the given values with the current end values, ' +
        'when `endContainer` is `node` and `endOffset` is lower than ' +
        '`offset`',
        function () {
            var range,
                node;

            range = new Range();

            node = new TextOM.SentenceNode()
                .append(new TextOM.WordNode())
                .append(new TextOM.TextNode('test'))
                .parent;

            range.setEnd(node, 0);
            range.setStart(node, 1);

            assert(range.startOffset === 0);
            assert(range.endOffset === 1);
        }
    );

    it('should switch the given values with the current end values, ' +
        'when `node` is a descendant of `endContainer`',
        function () {
            var range,
                node;

            node = new TextOM.RootNode()
                .append(new TextOM.ParagraphNode())
                .append(new TextOM.SentenceNode())
                .append(new TextOM.WordNode())
                .append(new TextOM.TextNode('test'))
                .parent;

            range = new Range();
            range.setEnd(node.parent);
            range.setStart(node);

            assert(range.endContainer === node);
            assert(range.startContainer === node.parent);

            range = new Range();
            range.setEnd(node.parent.parent);
            range.setStart(node);

            assert(range.endContainer === node);
            assert(range.startContainer === node.parent.parent);
        }
    );

    it('should switch the given values with the current end values, ' +
        'when the `node` is before `endContainer`',
        function (done) {
            retext.parse(
                'One two. Three four.\n\nFive six. Seven eighth.',
                function (err, tree) {
                    var range;

                    range = new Range();
                    range.setEnd(tree.tail.head.tail);
                    range.setStart(tree.tail.tail.tail);

                    assert(range.startContainer === tree.tail.head.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();
                    range.setEnd(tree.head.tail.tail);
                    range.setStart(tree.tail.tail.tail);

                    assert(range.startContainer === tree.head.tail.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();
                    range.setEnd(tree.head.head.tail);
                    range.setStart(tree.tail.tail.tail);

                    assert(range.startContainer === tree.head.head.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();
                    range.setEnd(tree.tail.tail);
                    range.setStart(tree.tail.tail.tail);

                    assert(range.startContainer === tree.tail.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();
                    range.setEnd(tree.head.tail);
                    range.setStart(tree.tail.tail.tail);

                    assert(range.startContainer === tree.head.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();
                    range.setEnd(tree.head);
                    range.setStart(tree.tail.tail.tail);

                    assert(range.startContainer === tree.head);
                    assert(range.endContainer === tree.tail.tail.tail);

                    done(err);
                }
            );
        }
    );
});

describe('TextOM.Range#setEnd(node, offset?)', function () {
    it('should be a `function`', function () {
        assert(typeof new Range().setEnd === 'function');
    });

    it('should throw when no `node` is given', function () {
        var range;

        range = new Range();

        assert.throws(function () {
            range.setEnd();
        }, /undefined/);

        assert.throws(function () {
            range.setEnd(false);
        }, /false/);
    });

    it('should NOT throw when `node` is not attached', function () {
        var range;

        range = new Range();

        assert.doesNotThrow(function () {
            range.setEnd(new TextOM.WordNode());
        });
    });

    it('should throw when `offset` is negative', function () {
        assert.throws(function () {
            new Range().setEnd(new TextOM.WordNode(), -1);
        }, /-1/);

        assert.throws(function () {
            new Range().setEnd(new TextOM.WordNode(), -Infinity);
        }, /-Infinity/);
    });

    it('should NOT throw when `offset` is `NaN`', function () {
        var range;

        range = new Range();

        assert.doesNotThrow(function () {
            range.setEnd(new TextOM.WordNode(), NaN);
        });
    });

    it('should treat an `offset` of `NaN` as `Infinity`', function () {
        var range;

        range = new Range();

        range.setEnd(new TextOM.WordNode(), NaN);

        assert(range.endOffset === Infinity);
    });

    it('should throw when a `offset` is non-number', function () {
        assert.throws(function () {
            new Range().setEnd(new TextOM.WordNode(), 'failure');
        }, /failure/);
    });

    it('should NOT throw when `offset` is greater than `length` of ' +
        '`node`',
        function (done) {
            retext.parse('One two.', function (err, tree) {
                var node;

                node = tree.head.head;

                assert.doesNotThrow(function () {
                    new Range().setEnd(node, 5);
                });

                assert.doesNotThrow(function () {
                    new Range().setEnd(node, Infinity);
                });

                done(err);
            });
        }
    );

    it('should throw when `startContainer` does not share `node`s root',
        function (done) {
            var complete;

            complete = completeFactory(done, 2);

            retext.parse('test1', function (err, tree1) {
                retext.parse('test2', function (err, tree2) {
                    var range;

                    range = new Range();
                    range.setStart(tree1.head.head.head);

                    assert.throws(function () {
                        range.setEnd(tree2.head.head.head);
                    }, /WrongRootError/);

                    complete(err);
                });

                complete(err);
            });
        }
    );

    it('should NOT throw when `offset` is given, but `node` has no `length`',
        function () {
            assert.doesNotThrow(function () {
                new Range().setEnd(new TextOM.WordNode(), 1);
            });

            assert.doesNotThrow(function () {
                new Range().setEnd(new TextOM.WordNode(), Infinity);
            });
        }
    );

    it('should return `self`', function () {
        var range;

        range = new Range();

        assert(range.setEnd(new TextOM.WordNode()) === range);
    });

    it('should set `endContainer` and `endOffset` to the given values',
        function () {
            var range,
                node,
                offset;

            range = new Range();
            node = new TextOM.WordNode();
            offset = 1;

            range.setEnd(node, offset);

            assert(range.endContainer === node);
            assert(range.endOffset === offset);
        }
    );

    it('should switch the given values with the current start values, ' +
        'when `startContainer` is `node` and `startOffset` is higher than ' +
        '`offset`',
        function () {
            var range,
                node;

            range = new Range();

            node = new TextOM.SentenceNode()
                .append(new TextOM.WordNode())
                .append(new TextOM.TextNode('test'))
                .parent;

            range.setStart(node, 1);
            range.setEnd(node, 0);

            assert(range.startOffset === 0);
            assert(range.endOffset === 1);
        }
    );

    it('should switch the given values with the current start values, ' +
        'when the `node` is before `startContainer`',
        function (done) {
            retext.parse(
                'One two. Three four.\n\nFive six. Seven eighth.',
                function (err, tree) {
                    var range;

                    range = new Range();

                    range.setStart(tree.tail.tail.tail);
                    range.setEnd(tree.tail.head.tail);
                    assert(range.startContainer === tree.tail.head.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();

                    range.setStart(tree.tail.tail.tail);
                    range.setEnd(tree.head.tail.tail);
                    assert(range.startContainer === tree.head.tail.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();

                    range.setStart(tree.tail.tail.tail);
                    range.setEnd(tree.head.head.tail);
                    assert(range.startContainer === tree.head.head.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();

                    range.setStart(tree.tail.tail.tail);
                    range.setEnd(tree.tail.tail);
                    assert(range.startContainer === tree.tail.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();

                    range.setStart(tree.tail.tail.tail);
                    range.setEnd(tree.head.tail);
                    assert(range.startContainer === tree.head.tail);
                    assert(range.endContainer === tree.tail.tail.tail);

                    range = new Range();

                    range.setStart(tree.tail.tail.tail);
                    range.setEnd(tree.head);
                    assert(range.startContainer === tree.head);
                    assert(range.endContainer === tree.tail.tail.tail);

                    done(err);
                }
            );
        }
    );
});

describe('TextOM.Range#toString()', function () {
    it('should be a `function`', function () {
        assert(typeof new Range().toString === 'function');
    });

    it('should return an empty string when no start- or endpoints exist',
        function () {
            var range;

            range = new Range();

            assert(range.toString() === '');

            range = new Range();
            range.setStart(new TextOM.WordNode());

            assert(range.toString() === '');

            range = new Range();
            range.setEnd(new TextOM.WordNode());

            assert(range.toString() === '');
        }
    );

    it('should return an empty string when the start- and endpoints are ' +
        'equal',
        function () {
            var range,
                node;

            node = new TextOM.WordNode()
                .append(new TextOM.TextNode('test'));

            range = new Range();
            range.setStart(node, 2);
            range.setEnd(node, 2);

            assert(range.toString() === '');
        }
    );

    it('should return the substring of `startContainer` from `startOffset` ' +
        'to `endOffset`, when `startContainer` is `endContainer`, and ' +
        '`startContainer` has no `length`',
        function () {
            var range,
                node;

            node = new TextOM.WordNode()
                .append(new TextOM.TextNode('Alfred'));

            range = new Range();
            range.setStart(node, 2);
            range.setEnd(node, 4);
            assert(range.toString() === 'fr');

            range.setEnd(node);
            assert(range.toString() === 'fred');

            range.setStart(node);
            assert(range.toString() === 'Alfred');
        }
    );

    it('should return the substring of `startContainer` from `startOffset`,' +
        ' when `startContainer` is `endContainer`, `startContainer` has no ' +
        '`length`,  and `endOffset` is larger than  the result of invoking ' +
        '`startContainer#toString()`',
        function () {
            var range,
                node;

            node = new TextOM.WordNode()
                .append(new TextOM.TextNode('Alfred'));

            range = new Range();
            range.setStart(node);
            range.setEnd(node);
            node.fromString('Bert');

            assert(range.toString() === 'Bert');
        }
    );

    it('should return the substring of `endContainer` from its start to ' +
        '`endOffset`',
        function (done) {
            retext.parse('Alfred Bertrand.', function (err, tree) {
                var range,
                    node;

                node = tree.head.head.head;

                range = new Range();
                range.setStart(node);
                range.setEnd(node.next.next.head, 6);

                assert(range.toString() === 'Alfred Bertra');

                done(err);
            });
        }
    );

    it('should concatenate two siblings', function (done) {
        retext.parse('Alfredbertrand', function (err, tree) {
            var range,
                node1,
                node2;

            node2 = tree.head.head.head.head;
            node1 = node2.split(6);

            range = new Range();
            range.setStart(node1);
            range.setEnd(node2);

            assert(range.toString() === 'Alfredbertrand');

            range.setStart(node1, 2);

            assert(range.toString() === 'fredbertrand');

            range.setEnd(node2, 6);

            assert(range.toString() === 'fredbertra');

            done(err);
        });
    });

    it('should concatenate multiple siblings', function (done) {
        retext.parse('Alfredbertrandceesdick', function (err, tree) {
            var range,
                node;

            node = tree.head.head.head;
            node.head.split(6);
            node.tail.split(8);
            node.tail.split(4);

            range = new Range();
            range.setStart(node.head);
            range.setEnd(node.tail);

            assert(range.toString() === 'Alfredbertrandceesdick');

            range.setStart(node.head, 3);

            assert(range.toString() === 'redbertrandceesdick');

            range.setEnd(node.tail, 2);

            assert(range.toString() === 'redbertrandceesdi');

            done(err);
        });
    });

    it('should concatenate children of different parents', function (done) {
        retext.parse('Alfred Bertrand', function (err, tree) {
            var range,
                node;

            node = tree.head.head;

            range = new Range();
            range.setStart(node.head.head);
            range.setEnd(node.tail.head);

            assert(range.toString() === 'Alfred Bertrand');

            range.setStart(node.head.head, 1);

            assert(range.toString() === 'lfred Bertrand');

            range.setEnd(node.tail.head, 5);

            assert(range.toString() === 'lfred Bertr');

            done(err);
        });
    });

    it('should concatenate children of different grandparents',
        function (done) {
            retext.parse('One. Two.\n\nThree. Four.', function (err, tree) {
                var range;

                range = new Range();
                range.setStart(tree.head.head.head.head);
                range.setEnd(tree.tail.tail.head.head);

                assert(range.toString() === 'One. Two.\n\nThree. Four');

                range.setStart(tree.head.head.head.head, 1);

                assert(range.toString() === 'ne. Two.\n\nThree. Four');

                range.setEnd(tree.tail.tail.head.head, 2);

                assert(range.toString() === 'ne. Two.\n\nThree. Fo');

                range.setStart(tree.head.tail.head.head);

                assert(range.toString() === 'Two.\n\nThree. Fo');

                range.setEnd(tree.tail.head.head.head);

                assert(range.toString() === 'Two.\n\nThree');

                range.setStart(tree.head.tail.head.head, 1);

                assert(range.toString() === 'wo.\n\nThree');

                range.setEnd(tree.tail.head.head.head, 3);

                assert(range.toString() === 'wo.\n\nThr');

                done(err);
            });
        }
    );

    it('should return an empty string when `startContainer` and ' +
        '`endContainer` no longer share a root',
        function (done) {
            retext.parse('One two.', function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head);
                range.setEnd(node.tail);

                assert(range.toString() === 'One two.');

                node.tail.remove();

                assert(range.toString() === '');

                done(err);
            });
        }
    );

    it('should concatenate a `Parent` using `offset`', function (done) {
        retext.parse('Alfred Bertrand Cees Dick', function (err, tree) {
            var range,
                node;

            node = tree.head.head;

            range = new Range();
            range.setStart(node, 2);
            range.setEnd(node, 5);

            assert(range.toString() === 'Bertrand Cees');

            done(err);
        });
    });

    it('should concatenate parents', function (done) {
        retext.parse('Alfred. Bertrand.', function (err, tree) {
            var range,
                node;

            node = tree.head;

            range = new Range();
            range.setStart(node.head);
            range.setEnd(node.tail);

            assert(range.toString() === 'Alfred. Bertrand.');

            done(err);
        });
    });

    it('should concatenate grandparents', function (done) {
        retext.parse('One. Two.\n\nThree. Four.', function (err, tree) {
            var range;

            range = new Range();
            range.setStart(tree.head);
            range.setEnd(tree.tail);

            assert(range.toString() === 'One. Two.\n\nThree. Four.');

            done(err);
        });
    });

    it('should concatenate parents using offset', function (done) {
        retext.parse('Alfred Bertrand. Cees Dick.', function (err, tree) {
            var range,
                node;

            node = tree.head;

            range = new Range();
            range.setStart(node.head, 2);
            range.setEnd(node.tail, 3);

            assert(range.toString() === 'Bertrand. Cees Dick');

            done(err);
        });
    });
});

describe('TextOM.Range#removeContent()', function () {
    it('should be a `function`', function () {
        assert(typeof new Range().removeContent === 'function');
    });

    it('should return an empty array when no start- or endpoints exist',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range;

                range = new Range();

                assert(range.removeContent().length === 0);

                range.setStart(tree.head.head.head);

                assert(range.removeContent().length === 0);

                range = new Range();
                range.setEnd(tree.head.head.head);

                assert(range.removeContent().length === 0);

                done(err);
            });
        }
    );

    it('should return an empty array when the start- and endpoints are equal',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head.head;

                range = new Range();
                range.setStart(node.head, 2);
                range.setEnd(node.head, 2);

                assert(range.removeContent().length === 0);

                done(err);
            });
        }
    );

    it('should remove the substring of `startContainer` from `startOffset` ' +
        'to `endOffset`, when `startContainer` is `endContainer` and ' +
        '`startContainer` is `Text`',
        function (done) {
            var complete;

            complete = completeFactory(done, 3);

            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head.head, 2);
                range.setEnd(node.head.head, 4);

                assert(range.removeContent().toString() === 'fr');
                assert(node.toString() === 'Aled');
                assert(node.head.length === 2);

                complete(err);
            });

            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head.head, 2);
                range.setEnd(node.head.head);

                assert(range.removeContent().toString() === 'fred');
                assert(node.toString() === 'Al');
                assert(node.head.length === 1);

                complete(err);
            });

            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head);
                range.setEnd(node.head);

                assert(range.removeContent().toString() === 'Alfred');
                assert(node.length === 0);

                complete(err);
            });
        }
    );

    it('should remove the substring of `startContainer` from `startOffset`,' +
        ' when `startContainer` equals `endContainer`, `startContainer` is ' +
        '`Text`, and `endOffset` is larger than the length of ' +
        '`startContainer`',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node,
                    textNode;

                node = tree.head.head.head;
                textNode = node.head;

                range = new Range();
                range.setStart(textNode);
                range.setEnd(textNode);

                textNode.fromString('Bert');

                assert(range.removeContent().toString() === 'Bert');
                assert(node.length === 0);

                done(err);
            });
        }
    );

    it('should remove the substring of `startContainer` from its start to ' +
        '`endOffset`, when `startContainer` is `endContainer`',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head.head;

                range = new Range();
                range.setStart(node.head);
                range.setEnd(node.head, 4);

                assert(range.removeContent().toString() === 'Alfr');
                assert(tree.head.head.toString() === 'ed');
                assert(tree.head.head.length === 1);

                done(err);
            });
        }
    );

    it('should remove the substring of `endContainer`, from its start to ' +
        '`endOffset`',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node1,
                    node2;

                node1 = tree.head.head.head;
                node2 = node1.after(new TextOM.WordNode());

                node2.append(new TextOM.TextNode('Bertrand'));

                range = new Range();
                range.setStart(node1.head);
                range.setEnd(node2.head, 6);

                assert(range.removeContent().toString() === 'Alfred,Bertra');
                assert(tree.head.head.toString() === 'nd');
                assert(tree.head.head.tail.length === 1);

                done(err);
            });
        }
    );

    it('should remove two siblings', function (done) {
        retext.parse('AlfredBertrand', function (err, tree) {
            var range,
                node,
                textNode2,
                textNode1;

            node = tree.head.head.head;
            textNode2 = node.head;
            textNode1 = textNode2.split(6);

            range = new Range();
            range.setStart(textNode1);
            range.setEnd(textNode2);
            assert(range.removeContent().toString() === 'Alfred,Bertrand');
            assert(node.length === 0);

            range = new Range();
            node.append(textNode1);
            node.append(textNode2);
            range.setStart(textNode1, 2);
            range.setEnd(textNode2);

            assert(range.removeContent().toString() === 'fred,Bertrand');
            assert(node.toString() === 'Al');
            assert(node.length === 1);

            range = new Range();
            node.head.remove(); // Remove 'Al'
            textNode1.fromString('Alfred');
            node.append(textNode1);
            node.append(textNode2);
            range.setStart(textNode1, 2);
            range.setEnd(textNode2, 6);

            assert(range.removeContent().toString() === 'fred,Bertra');
            assert(node.toString() === 'Alnd');
            assert(node.length === 2);

            done(err);
        });
    });

    it('should remove multiple siblings', function (done) {
        var complete;

        complete = completeFactory(done, 3);

        retext.parse(
            'Alfred Bertrand Cees Dick Eric Ferdinand',
            function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head);
                range.setEnd(node.tail);

                assert(
                    range.removeContent().toString() ===
                    'Alfred, ,Bertrand, ,Cees, ,Dick, ,Eric, ,Ferdinand'
                );
                assert(node.length === 0);

                complete(err);
            }
        );

        retext.parse(
            'Alfred Bertrand Cees Dick Eric Ferdinand',
            function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head.head, 3);
                range.setEnd(node.tail.head);

                assert(
                    range.removeContent().toString() ===
                    'red, ,Bertrand, ,Cees, ,Dick, ,Eric, ,Ferdinand'
                );
                assert(node.toString() === 'Alf');
                assert(node.length === 2);

                complete(err);
            }
        );

        retext.parse(
            'Alfred Bertrand Cees Dick Eric Ferdinand',
            function (err, tree) {
                var range,
                    node;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head.head, 3);
                range.setEnd(node.tail.head, 7);

                assert(
                    range.removeContent().toString() ===
                    'red, ,Bertrand, ,Cees, ,Dick, ,Eric, ,Ferdina'
                );
                assert(node.toString() === 'Alfnd');
                assert(node.length === 2);

                complete(err);
            }
        );
    });

    it('should remove children of different parents', function (done) {
        var complete;

        complete = completeFactory(done, 3);

        retext.parse('Alfred. Bertrand.', function (err, tree) {
            var range,
                node;

            node = tree.head;

            range = new Range();
            range.setStart(node.head.head.head);
            range.setEnd(node.tail.tail);

            assert(
                range.removeContent().toString() === 'Alfred,., ,Bertrand,.'
            );
            assert(node.head.head.length === 0);
            assert(node.tail.length === 0);

            complete(err);
        });

        retext.parse('Alfred. Bertrand.', function (err, tree) {
            var range,
                node;

            node = tree.head;

            range = new Range();
            range.setStart(node.head.head.head, 1);
            range.setEnd(node.tail.tail);

            assert(
                range.removeContent().toString() === 'lfred,., ,Bertrand,.'
            );
            assert(node.head.head.length === 1);
            assert(node.head.toString() === 'A');
            assert(node.tail.length === 0);

            complete(err);
        });

        retext.parse('Alfred. Bertrand.', function (err, tree) {
            var range,
                node;

            node = tree.head;

            range = new Range();
            range.setStart(node.head.head.head);
            range.setEnd(node.tail.head.head, 3);

            assert(range.removeContent().toString() === 'Alfred,., ,Ber');
            assert(node.head.head.length === 0);
            assert(node.tail.length === 2);
            assert(node.tail.toString() === 'trand.');

            complete(err);
        });
    });

    it('should concatenate children of different grandparents',
        function (done) {
            var complete;

            complete = completeFactory(done, 4);

            retext.parse('Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range;

                    range = new Range();
                    range.setStart(tree.head.head.head.head);
                    range.setEnd(tree.tail.tail.tail);

                    assert(
                        range.removeContent().toString() ===
                        'Alfred,., ,Bertrand.,\n\n,Cees., ,Dick,.'
                    );
                    assert(tree.head.length === 1);
                    assert(tree.head.head.head.length === 0);
                    assert(tree.tail.length === 1);
                    assert(tree.tail.head.length === 0);

                    complete(err);
                }
            );

            retext.parse('Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range;

                    range = new Range();
                    range.setStart(tree.head.head.head.head, 2);
                    range.setEnd(tree.tail.tail.tail);

                    assert(
                        range.removeContent().toString() ===
                        'fred,., ,Bertrand.,\n\n,Cees., ,Dick,.'
                    );
                    assert(tree.head.head.length === 1);
                    assert(tree.head.head.head.length === 1);
                    assert(tree.head.head.head.toString() === 'Al');
                    assert(tree.tail.length === 1);
                    assert(tree.tail.head.length === 0);

                    complete(err);
                }
            );

            retext.parse('Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range;

                    range = new Range();
                    range.setStart(tree.head.tail.head.head);
                    range.setEnd(tree.tail.tail.head.head, 3);

                    assert(
                        range.removeContent().toString() ===
                        'Bertrand,.,\n\n,Cees., ,Dic'
                    );

                    assert(tree.head.length === 3);
                    assert(tree.head.toString() === 'Alfred. ');
                    assert(tree.head.head.length === 2);
                    assert(tree.head.head.toString() === 'Alfred.');
                    assert(tree.tail.length === 1);
                    assert(tree.tail.head.length === 2);
                    assert(tree.tail.head.toString() === 'k.');

                    complete(err);
                }
            );

            retext.parse('Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range;

                    range = new Range();
                    range.setStart(tree.head.head.head.head, 3);
                    range.setEnd(tree.tail.tail.head.head, 3);

                    assert(
                        range.removeContent().toString() ===
                        'red,., ,Bertrand.,\n\n,Cees., ,Dic'
                    );

                    assert(tree.head.length === 1);
                    assert(tree.tail.length === 1);
                    assert(tree.head.head.length === 1);
                    assert(tree.head.head.toString() === 'Alf');
                    assert(tree.tail.head.length === 2);
                    assert(tree.tail.head.toString() === 'k.');

                    complete(err);
                }
            );
        }
    );

    it('should NOT remove anything when `startContainer` and `endContainer`' +
        ' no longer share the same root',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node1,
                    node2;

                node1 = tree.head.head.head;
                node2 = node1.after(new TextOM.WordNode());
                node2.append(new TextOM.TextNode('Bertrand'));

                range = new Range();
                range.setStart(node1);
                range.setEnd(node2);

                node2.remove();

                assert(range.removeContent().length === 0);
                assert(node1.parent.length === 1);
                assert(node1.parent.toString() === 'Alfred');

                done(err);
            });
        }
    );
});

describe('TextOM.Range#getContent()', function () {
    it('should be a `function`', function () {
        assert(typeof new Range().getContent === 'function');
    });

    it('should return an empty array, when no start- or endpoints exist',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range;

                range = new Range();

                assert(range.getContent().length === 0);

                range.setStart(tree.head.head.head);

                assert(range.getContent().length === 0);

                range = new Range();
                range.setEnd(tree.head.head.head);

                assert(range.getContent().length === 0);

                done(err);
            });
        }
    );

    it('should return an array containing `startContainer` when ' +
        '`startContainer` is `endContainer`',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head.head;

                range = new Range();
                range.setStart(node.head, 2);
                range.setEnd(node.head, 2);

                assert(range.getContent().length === 1);
                assert(range.getContent()[0] === node.head);

                done(err);
            });
        }
    );

    it('should return an empty array when `startContainer` and ' +
        '`endContainer` no longer share a root',
        function (done) {
            retext.parse('Alfred', function (err, tree) {
                var range,
                    node;

                node = tree.head.head;
                node
                    .append(new TextOM.WordNode())
                    .append(new TextOM.TextNode('Bertrand'));

                range = new Range();
                range.setStart(node.head);
                range.setEnd(node.tail);

                node.tail.remove();

                assert(range.getContent().length === 0);

                done(err);
            });
        }
    );

    it('should return an array containing two direct siblings',
        function (done) {
            retext.parse('Alfredbert', function (err, tree) {
                var range,
                    textNode2,
                    textNode1,
                    result;

                textNode2 = tree.head.head.head.head;
                textNode1 = textNode2.split(6);

                range = new Range();
                range.setStart(textNode1);
                range.setEnd(textNode2);
                result = range.getContent();

                assert(result.length === 2);
                assert(result[0] === textNode1);
                assert(result[1] === textNode2);

                done(err);
            });
        }
    );

    it('should return an array containing multiple siblings',
        function (done) {
            retext.parse(
                'Alfred bertrand cees dick eric ferdinand.',
                function (err, tree) {
                    var range,
                        node,
                        result;

                    node = tree.head.head;

                    range = new Range();
                    range.setStart(node.head);
                    range.setEnd(node.tail);
                    result = range.getContent();

                    assert(result.length === 12);
                    assert(
                        result.join() ===
                        'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand,.'
                    );

                    range.setStart(node.head.head, 3);
                    result = range.getContent();

                    assert(result.length === 12);
                    assert(
                        result.join() ===
                        'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand,.'
                    );

                    range.setEnd(node.tail, 7);
                    result = range.getContent();

                    assert(result.length === 12);
                    assert(
                        result.join() ===
                        'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand,.'
                    );

                    done(err);
                }
            );
        }
    );

    it('should return an array containing text children of different parents',
        function (done) {
            retext.parse('Alfred bertrand.', function (err, tree) {
                var range,
                    node,
                    result;

                node = tree.head.head;

                range = new Range();
                range.setStart(node.head.head);
                range.setEnd(node.tail);
                result = range.getContent();

                assert(result.toString() === 'Alfred, ,bertrand,.');
                assert(result.length === 4);

                done(err);
            });
        }
    );

    it('should return an array containing children of different ' +
        'grandparents',
        function (done) {
            retext.parse('Alfred.\n\nBertrand.', function (err, tree) {
                var range,
                    result;

                range = new Range();
                range.setStart(tree.head.head.head.head);
                range.setEnd(tree.tail.head.tail);
                result = range.getContent();

                assert(result.toString() === 'Alfred,.,\n\n,Bertrand,.');
                assert(result.length === 5);

                done(err);
            });
        }
    );

    it('should return an array containing `startContainer`, when ' +
        '`startContainer` is `endContainer`, is an `Element`, and  the ' +
        '`offset`s cover the node',
        function (done) {
            retext.parse('Alfred bertrand.', function (err, tree) {
                var range,
                    node,
                    result;

                node = tree.head.head;

                range = new Range();
                range.setStart(node);
                range.setEnd(node);
                result = range.getContent();

                assert(result.length === 1);
                assert(result[0] === node);

                done(err);
            });
        }
    );

    it('should return an array containing two direct element siblings',
        function (done) {
            retext.parse('Alfred. Bertrand.', function (err, tree) {
                var range,
                    node,
                    result;

                node = tree.head;

                range = new Range();
                range.setStart(node.head);
                range.setEnd(node.tail);
                result = range.getContent();

                assert(result.length === 3);
                assert(result[0] === node.head);
                assert(result[1] === node.head.next);
                assert(result[2] === node.tail);

                done(err);
            });
        }
    );

    it('should return an array containing multiple element siblings',
        function (done) {
            retext.parse('Alfred. Bertrand. Cees. Dick. Eric.',
                function (err, tree) {
                    var range,
                        node,
                        result;

                    node = tree.head;

                    range = new Range();

                    range.setStart(node.head);
                    range.setEnd(node.tail);
                    result = range.getContent();

                    assert(result.length === 9);
                    assert(result[0] === node.head);
                    assert(result[8] === node.tail);

                    range.setStart(node.head.next.next);
                    result = range.getContent();
                    assert(result.length === 7);
                    assert(result[0] === node.head.next.next);
                    assert(result[6] === node.tail);

                    range.setEnd(node.tail.prev.prev);
                    result = range.getContent();
                    assert(result.length === 5);
                    assert(result[0] === node.head.next.next);
                    assert(result[4] === node.tail.prev.prev);

                    done(err);
                }
            );
        }
    );

    it('should return an array containing elements of different grandparents',
        function (done) {
            retext.parse('Alfred.\n\nBertrand.', function (err, tree) {
                var range,
                    result;

                range = new Range();
                range.setStart(tree.head);
                range.setEnd(tree.tail);
                result = range.getContent();

                assert(result.length === 3);
                assert(result[0] === tree.head);
                assert(result[1] === tree.head.next);
                assert(result[2] === tree.tail);

                done(err);
            });
        }
    );

    it('should return an array containing children, when `startContainer` ' +
        'is `endContainer`, an `Element`, and `endOffset` is NOT ' +
        'equal to or greater than the node\'s `length`',
        function (done) {
            retext.parse('Alfred. Bertrand. Cees.', function (err, tree) {
                var range,
                    node,
                    result;

                node = tree.head;

                range = new Range();

                range.setStart(node);
                range.setEnd(node, 3);
                result = range.getContent();

                assert(result.length === 3);
                assert(result[0] === node.head);
                assert(result[1] === node.head.next);
                assert(result[2] === node.head.next.next);

                range.setStart(node, 2);
                result = range.getContent();

                assert(result.length === 1);
                assert(result[0] === node.head.next.next);

                done(err);
            });
        }
    );

    it('should return an array containing children, when `startContainer` ' +
        'is an `Element` and `endContainer` is inside `startContainer`',
        function (done) {
            retext.parse('Alfred Bertrand Cees.', function (err, tree) {
                var range,
                    node,
                    result;

                node = tree.head.head;

                range = new Range();

                range.setStart(node);
                range.setEnd(node.tail.prev);
                result = range.getContent();

                assert(result.length === 5);
                assert(result[0] === node.head);
                assert(result[1] === node.head.next);
                assert(result[2] === node.head.next.next);
                assert(result[3] === node.head.next.next.next);
                assert(result[4] === node.head.next.next.next.next);

                range.setStart(node, 2);
                result = range.getContent();

                assert(result.length === 3);
                assert(result[0] === node.head.next.next);
                assert(result[1] === node.head.next.next.next);
                assert(result[2] === node.head.next.next.next.next);

                done(err);
            });
        }
    );

    it('should return an array containing children, excluding ' +
        '`startContainer`, when `startOffset` is higher than ' +
        '`startContainer`s `length`',
        function (done) {
            retext.parse(
                'Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range,
                        result;

                    range = new Range();
                    range.setStart(tree.head.head, Infinity);
                    range.setEnd(tree.tail.tail.tail);
                    result = range.getContent();

                    assert(
                        result.toString() ===
                        ' ,Bertrand.,\n\n,Cees., ,Dick,.'
                    );

                    range.setStart(tree.head, Infinity);
                    result = range.getContent();

                    assert(
                        result.toString() ===
                        '\n\n,Cees., ,Dick,.'
                    );

                    range = new Range();
                    range.setStart(tree.head.tail, Infinity);
                    range.setEnd(tree.tail.tail.tail);
                    result = range.toString();

                    assert(result.toString() === '\n\nCees. Dick.');

                    done(err);
                }
            );
        }
    );

    it('should return an array containing children, when `endContainer` ' +
        'is an `Element`, and `endOffset` is equal to or greater than the ' +
        'node\'s `length`',
        function (done) {
            retext.parse(
                'Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range,
                        result;

                    range = new Range();
                    range.setStart(tree.head.head.head);
                    range.setEnd(tree.tail.tail, Infinity);
                    result = range.getContent();

                    assert(
                        result.toString() ===
                        'Alfred,., ,Bertrand.,\n\n,Cees. Dick.'
                    );

                    done(err);
                }
            );
        }
    );

    it('should return an array containing children, when endContainer ' +
        'is an element, and endOffset is less than the length of node',
        function (done) {
            retext.parse(
                'Alfred. Bertrand.\n\nCees. Dick.',
                function (err, tree) {
                    var range,
                        result;

                    range = new Range();
                    range.setStart(tree.head);
                    range.setEnd(tree.tail.tail, 1);
                    result = range.getContent();

                    assert(
                        result.toString() ===
                        'Alfred. Bertrand.,\n\n,Cees., ,Dick'
                    );

                    range.setEnd(tree.tail, 1);
                    result = range.getContent();

                    assert(
                        result.toString() === 'Alfred. Bertrand.,\n\n,Cees.'
                    );

                    done(err);
                }
            );
        }
    );
});
