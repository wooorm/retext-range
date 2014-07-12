'use strict';

var retextRange, Retext, assert, TextOM, retext, Range;

retextRange = require('..');
Retext = require('retext');
assert = require('assert');

retext = new Retext().use(retextRange);
TextOM = retext.parser.TextOM;

Range = TextOM.Range;

describe('retext-range', function () {
    it('should be of type `function`', function () {
        assert(typeof retextRange === 'function');
    });

    it('should export an `attach` method', function () {
        assert(typeof retextRange.attach === 'function');
    });
});

describe('retext-range.attach', function () {
    it('should attach a `Range` constructor to `TextOM`', function () {
        assert('Range' in TextOM);
    });
});

describe('TextOM.Range()', function () {
    it('should be of type `function`', function () {
        assert(typeof Range === 'function');
    });
});

describe('TextOM.Range#setStart(node, offset?)', function () {
    it('should be of type `function`', function () {
        assert(typeof (new Range()).setStart === 'function');
    });

    it('should throw when no node is given', function () {
        var range = new Range();

        assert.throws(function () {
            range.setStart();
        }, 'undefined');

        assert.throws(function () {
            range.setStart(false);
        }, 'false');
    });

    it('should NOT throw when an unattached node is given', function () {
        var range = new Range();

        assert.doesNotThrow(function () {
            range.setStart(new TextOM.WordNode());
        });
    });

    it('should throw when a negative offset is given', function () {
        var wordNode = retext.parse('test').head.head.head;

        assert.throws(function () {
            (new Range()).setStart(wordNode, -1);
        }, '-1');

        assert.throws(function () {
            (new Range()).setStart(wordNode, -Infinity);
        }, '-Infinity');
    });

    it('should NOT throw when NaN is given, but treat it as `0`',
        function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head;

            assert.doesNotThrow(function () {
                range.setStart(wordNode, NaN);
            });

            assert(range.startOffset === 0);
        }
    );

    it('should throw when a value other than a number is given',
        function () {
            var wordNode = retext.parse('test').head.head.head;

            assert.throws(function () {
                (new Range()).setStart(wordNode, 'failure');
            }, 'failure');
        }
    );

    it('should NOT throw when an offset greater than the length of the ' +
        'node is given', function () {
            var sentenceNode = retext.parse('test1 test2').head.head;

            assert.doesNotThrow(function () {
                (new Range()).setStart(sentenceNode, 3);
            });

            assert.doesNotThrow(function () {
                (new Range()).setStart(sentenceNode, Infinity);
            });
        }
    );

    it('should throw when `endContainer` does not share the same root as ' +
        'the given node', function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head,
                wordNode1 = retext.parse('test1').head.head.head;

            range.setEnd(wordNode);

            assert.throws(function () {
                range.setStart(wordNode1);
            }, 'WrongRootError');
        }
    );

    it('should not throw when an offset is given, but no length property ' +
        'exists on the given node', function () {
            var wordNode = retext.parse('test').head.head.head;

            assert.doesNotThrow(function () {
                (new Range()).setStart(wordNode, 1);
            });

            assert.doesNotThrow(function () {
                (new Range()).setStart(wordNode, Infinity);
            });
        }
    );

    it('should set `startContainer` and `startOffset` to the given values, ' +
        'when no endContainer exists', function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head;

            range.setStart(wordNode, 1);
            assert(range.startContainer === wordNode);
            assert(range.startOffset === 1);
        }
    );

    it('should switch the given start values with the current end values, ' +
        'when `endContainer` equals the given container and the endOffset ' +
        'is lower than the given offset', function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head;

            range.setEnd(wordNode, 0);
            range.setStart(wordNode, 1);

            assert(range.startOffset === 0);
            assert(range.endOffset === 1);
        }
    );

    it('should switch the given start values with the current end values, ' +
        'when the given item is a descendant of the current end container',
        function () {
            var paragraphNode = retext.parse('test').head,
                sentenceNode = paragraphNode.head,
                wordNode = sentenceNode.head,
                range;

            range = new Range();

            range.setEnd(sentenceNode);
            range.setStart(wordNode);
            assert(range.endContainer === wordNode);
            assert(range.startContainer === sentenceNode);

            range = new Range();

            range.setEnd(paragraphNode);
            range.setStart(wordNode);
            assert(range.endContainer === wordNode);
            assert(range.startContainer === paragraphNode);
        }
    );

    it('should switch the given start values with the current end values, ' +
        'when the given item is before the current end container',
        function () {
            var root = retext.parse(
                    'One two. Three four.\n\nFive six. Seven eighth.'
                ),
                range;

            range = new Range();

            range.setEnd(root.tail.head.tail);
            range.setStart(root.tail.tail.tail);
            assert(range.startContainer === root.tail.head.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setEnd(root.head.tail.tail);
            range.setStart(root.tail.tail.tail);
            assert(range.startContainer === root.head.tail.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setEnd(root.head.head.tail);
            range.setStart(root.tail.tail.tail);
            assert(range.startContainer === root.head.head.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setEnd(root.tail.tail);
            range.setStart(root.tail.tail.tail);
            assert(range.startContainer === root.tail.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setEnd(root.head.tail);
            range.setStart(root.tail.tail.tail);
            assert(range.startContainer === root.head.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setEnd(root.head);
            range.setStart(root.tail.tail.tail);
            assert(range.startContainer === root.head);
            assert(range.endContainer === root.tail.tail.tail);
        }
    );
});

describe('TextOM.Range#setEnd(node, offset?)', function () {
    it('should be of type `function`', function () {
        assert(typeof (new Range()).setEnd === 'function');
    });

    it('should throw when no node is given', function () {
        var range = new Range();

        assert.throws(function () {
            range.setEnd();
        }, 'undefined');

        assert.throws(function () {
            range.setEnd(false);
        }, 'false');
    });

    it('should NOT throw when an unattached node is given', function () {
        var range = new Range();

        assert.doesNotThrow(function () {
            range.setEnd(new TextOM.WordNode());
        });
    });

    it('should throw when a negative offset is given', function () {
        var wordNode = retext.parse('test').head.head.head;

        assert.throws(function () {
            (new Range()).setEnd(wordNode, -1);
        }, '-1');

        assert.throws(function () {
            (new Range()).setEnd(wordNode, -Infinity);
        }, '-Infinity');
    });

    it('should NOT throw when NaN is given, but treat it as `Infinity`',
        function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head;

            assert.doesNotThrow(function () {
                range.setEnd(wordNode, NaN);
            });

            assert(range.endOffset === Infinity);
        }
    );

    it('should throw when a value other than a number is given',
        function () {
            var wordNode = retext.parse('test').head.head.head;

            assert.throws(function () {
                (new Range()).setEnd(wordNode, 'failure');
            }, 'failure');
        }
    );

    it('should NOT throw when an offset greater than the length of the ' +
        'node is given', function () {
            var sentenceNode = retext.parse('test1 test2').head.head;

            assert.doesNotThrow(function () {
                (new Range()).setEnd(sentenceNode, 3);
            });

            assert.doesNotThrow(function () {
                (new Range()).setEnd(sentenceNode, Infinity);
            });
        }
    );

    it('should throw when `startContainer` does not share the same root as ' +
        'the given node', function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head,
                wordNode1 = retext.parse('test1').head.head.head;

            range.setStart(wordNode);

            assert.throws(function () {
                range.setEnd(wordNode1);
            }, 'WrongRootError');
        }
    );

    it('should not throw when an offset is given, but no length property ' +
        'exists on the given node', function () {
            var wordNode = retext.parse('test').head.head.head;

            assert.doesNotThrow(function () {
                (new Range()).setEnd(wordNode, 1);
            });

            assert.doesNotThrow(function () {
                (new Range()).setEnd(wordNode, Infinity);
            });
        }
    );

    it('should set `endContainer` and `endOffset` to the given values, ' +
        'when no endContainer exists', function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head;

            range.setEnd(wordNode, 1);
            assert(range.endContainer === wordNode);
            assert(range.endOffset === 1);
        }
    );

    it('should switch the given end values with the current start values, ' +
        'when `startContainer` equals the given container and the ' +
        'startOffset is higher than the given offset', function () {
            var range = new Range(),
                wordNode = retext.parse('test').head.head.head;

            range.setStart(wordNode, 1);
            range.setEnd(wordNode, 0);

            assert(range.startOffset === 0);
            assert(range.endOffset === 1);
        }
    );

    it('should switch the given start values with the current end values, ' +
        'when the given item is before the current end container',
        function () {
            var root = retext.parse(
                    'One two. Three four.\n\nFive six. Seven eighth.'
                ),
                range;

            range = new Range();

            range.setStart(root.tail.tail.tail);
            range.setEnd(root.tail.head.tail);
            assert(range.startContainer === root.tail.head.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setStart(root.tail.tail.tail);
            range.setEnd(root.head.tail.tail);
            assert(range.startContainer === root.head.tail.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setStart(root.tail.tail.tail);
            range.setEnd(root.head.head.tail);
            assert(range.startContainer === root.head.head.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setStart(root.tail.tail.tail);
            range.setEnd(root.tail.tail);
            assert(range.startContainer === root.tail.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setStart(root.tail.tail.tail);
            range.setEnd(root.head.tail);
            assert(range.startContainer === root.head.tail);
            assert(range.endContainer === root.tail.tail.tail);

            range = new Range();

            range.setStart(root.tail.tail.tail);
            range.setEnd(root.head);
            assert(range.startContainer === root.head);
            assert(range.endContainer === root.tail.tail.tail);
        }
    );
});

describe('TextOM.Range#toString()', function () {
    it('should be of type `function`', function () {
        assert(typeof (new Range()).toString === 'function');
    });

    it('should return an empty string when no start- or endpoints exist',
        function () {
            var wordNode = retext.parse('alfred').head.head.head,
                range = new Range();

            assert(range.toString() === '');

            range = new Range();
            range.setStart(wordNode);
            assert(range.toString() === '');

            range = new Range();
            range.setEnd(wordNode);
            assert(range.toString() === '');
        }
    );

    it('should return an empty string when startContainer equals ' +
        'endContainer and startOffset equals endOffset', function () {
            var wordNode = retext.parse('alfred').head.head.head,
                range = new Range();

            range.setStart(wordNode, 2);
            range.setEnd(wordNode, 2);
            assert(range.toString() === '');
        }
    );

    it('should return the substring of the `startContainer`, starting at ' +
        '`startOffset` and ending at `endOffset`, when `startContainer` ' +
        'equals `endContainer` and `startContainer` has no `length` ' +
        'property', function () {
            var range = new Range(),
                textNode = retext.parse('alfred').head.head.head.head;

            range.setStart(textNode, 2);
            range.setEnd(textNode, 4);
            assert(range.toString() === 'fr');

            range.setEnd(textNode);
            assert(range.toString() === 'fred');

            range.setStart(textNode);
            assert(range.toString() === 'alfred');
        }
    );

    it('should return the substring of the `startContainer`, starting at ' +
        '`startOffset` and ending at the last possible character, when ' +
        '`startContainer` equals `endContainer`, `startContainer` has no ' +
        '`length`property, and `endOffset` is larger than the result of ' +
        'calling the `toString` method on `startContainer`', function () {
            var range = new Range(),
                textNode = retext.parse('alfred').head.head.head.head;

            range.setStart(textNode);
            range.setEnd(textNode);
            textNode.fromString('bert');
            assert(range.toString() === 'bert');
        }
    );

    it('should substring the endContainer from its start and ending at ' +
        'its `endOffset`', function () {
            var range = new Range(),
                wordNode = retext.parse('alfred bertrand').head.head.head;

            range.setStart(wordNode);
            range.setEnd(wordNode.next.next.head, 6);
            assert(range.toString() === 'alfred bertra');
        }
    );

    it('should concatenate two siblings', function () {
        var range = new Range(),
            textNode1 = retext.parse('alfredbertrand').head.head.head.head,
            textNode = textNode1.split(6);

        range.setStart(textNode);
        range.setEnd(textNode1);
        assert(range.toString() === 'alfredbertrand');

        range.setStart(textNode, 2);
        assert(range.toString() === 'fredbertrand');

        range.setEnd(textNode1, 6);
        assert(range.toString() === 'fredbertra');
    });

    it('should concatenate multiple siblings', function () {
        var range = new Range(),
            wordNode = retext.parse(
                'alfredbertrandceesdick'
            ).head.head.head;

        wordNode.head.split(6);
        wordNode.tail.split(8);
        wordNode.tail.split(4);

        range.setStart(wordNode.head);
        range.setEnd(wordNode.tail);
        assert(
            range.toString() === 'alfredbertrandceesdick'
        );

        range.setStart(wordNode.head, 3);
        assert(range.toString() === 'redbertrandceesdick');

        range.setEnd(wordNode.tail, 2);
        assert(range.toString() === 'redbertrandceesdi');
    });

    it('should concatenate children of different parents', function () {
        var range = new Range(),
            sentenceNode = retext.parse('Alfred bertrand').head.head;

        range.setStart(sentenceNode.head.head);
        range.setEnd(sentenceNode.tail.head);
        assert(range.toString() === 'Alfred bertrand');

        range.setStart(sentenceNode.head.head, 1);
        assert(range.toString() === 'lfred bertrand');

        range.setEnd(sentenceNode.tail.head, 5);
        assert(range.toString() === 'lfred bertr');
    });

    it('should concatenate children of different grandparents',
        function () {
            var range = new Range(),
                root = retext.parse('One. Two.\n\nThree. Four.');

            range.setStart(root.head.head.head.head);
            range.setEnd(root.tail.tail.head.head);
            assert(range.toString() === 'One. Two.\n\nThree. Four');

            range.setStart(root.head.head.head.head, 1);
            assert(range.toString() === 'ne. Two.\n\nThree. Four');

            range.setEnd(root.tail.tail.head.head, 2);
            assert(range.toString() === 'ne. Two.\n\nThree. Fo');

            range.setStart(root.head.tail.head.head);
            assert(range.toString() === 'Two.\n\nThree. Fo');

            range.setEnd(root.tail.head.head.head);
            assert(range.toString() === 'Two.\n\nThree');

            range.setStart(root.head.tail.head.head, 1);
            assert(range.toString() === 'wo.\n\nThree');

            range.setEnd(root.tail.head.head.head, 3);
            assert(range.toString() === 'wo.\n\nThr');
        }
    );

    it('should return an empty string, when startContainer and ' +
        'endContainer no longer share the same root', function () {
            var range = new Range(),
                sentenceNode = retext.parse('One two').head.head;

            range.setStart(sentenceNode.head);
            range.setEnd(sentenceNode.tail);
            assert(range.toString() === 'One two');

            sentenceNode.tail.remove();
            assert(range.toString() === '');
        }
    );

    it('should concatenate a parent using offset', function () {
        var range = new Range(),
            sentenceNode = retext.parse(
                'alfred bertrand cees dick'
            ).head.head;

        range.setStart(sentenceNode, 2);
        range.setEnd(sentenceNode, 5);
        assert(range.toString() === 'bertrand cees');
    });

    it('should concatenate different parents', function () {
        var range = new Range(),
            paragraphNode = retext.parse('Alfred. Bertrand.').head;

        range.setStart(paragraphNode.head);
        range.setEnd(paragraphNode.tail);
        assert(range.toString() === 'Alfred. Bertrand.');
    });

    it('should concatenate different grandparents', function () {
        var range = new Range(),
            root = retext.parse('One. Two.\n\nThree. Four.');

        range.setStart(root.head);
        range.setEnd(root.tail);
        assert(range.toString() === 'One. Two.\n\nThree. Four.');
    });

    it('should concatenate different parents using offset', function () {
        var range = new Range(),
            paragraphNode = retext.parse('Alfred bertrand. Cees dick.').head;

        range.setStart(paragraphNode.head, 2);
        range.setEnd(paragraphNode.tail, 3);
        assert(range.toString() === 'bertrand. Cees dick');
    });
});

describe('TextOM.Range#removeContent()', function () {
    it('should be of type `function`', function () {
        assert(typeof (new Range()).removeContent === 'function');
    });

    it('should return an empty array when no start- or endpoints exist',
        function () {
            var range = new Range();

            assert(range.removeContent().length === 0);

            range = new Range();
            range.setStart(retext.parse('Alfred').head.head.head);
            assert(range.removeContent().length === 0);

            range = new Range();
            range.setEnd(retext.parse('Alfred').head.head.head);
            assert(range.removeContent().length === 0);
        }
    );

    it('should return an empty array when startContainer equals ' +
        'endContainer and startOffset equals endOffset', function () {
            var range = new Range(),
                wordNode = retext.parse('Alfred').head.head.head;

            range.setStart(wordNode.head, 2);
            range.setEnd(wordNode.head, 2);
            assert(range.removeContent().length === 0);
            assert(wordNode.toString() === 'Alfred');
            assert(wordNode.length === 1);
        }
    );

    it('should remove the substring of the `startContainer`, from ' +
        '`startOffset` to `endOffset`, when `startContainer` ' +
        'equals `endContainer` and `startContainer` is a Text node',
        function () {
            var range = new Range(),
                sentenceNode = retext.parse('Alfred').head.head;

            range.setStart(sentenceNode.head.head, 2);
            range.setEnd(sentenceNode.head.head, 4);

            assert(range.removeContent().toString() === 'fr');
            assert(sentenceNode.toString() === 'Aled');
            assert(sentenceNode.head.length === 2);

            range = new Range();
            sentenceNode = retext.parse('Alfred').head.head;
            range.setStart(sentenceNode.head.head, 2);
            range.setEnd(sentenceNode.head.head);
            assert(range.removeContent().toString() === 'fred');
            assert(sentenceNode.toString() === 'Al');
            assert(sentenceNode.head.length === 1);

            range = new Range();
            sentenceNode = retext.parse('Alfred').head.head;
            range.setStart(sentenceNode.head);
            range.setEnd(sentenceNode.head);
            assert(range.removeContent().toString() === 'Alfred');
            assert(sentenceNode.length === 0);
        }
    );

    it('should remove the substring of the `startContainer`, from ' +
        '`startOffset` to the last possible character, when ' +
        '`startContainer` equals `endContainer`, `startContainer` is a Text' +
        'Node, and `endOffset` is larger than the length of ' +
        '`startContainer`', function () {
            var range = new Range(),
                wordNode = retext.parse('Alfred').head.head.head,
                textNode = wordNode.head;

            range.setStart(textNode);
            range.setEnd(textNode);
            textNode.fromString('Bert');
            assert(range.removeContent().toString() === 'Bert');
            assert(wordNode.length === 0);
        }
    );

    it('should remove the substring of the `startContainer`, when ' +
        '`startContainer` equals `endContainer`, from its start to ' +
        '`endOffset`', function () {
            var range = new Range(),
                sentenceNode = retext.parse('Alfred').head.head,
                wordNode = sentenceNode.head;

            range.setStart(wordNode.head);
            range.setEnd(wordNode.head, 4);
            assert(range.removeContent().toString() === 'Alfr');
            assert(sentenceNode.toString() === 'ed');
            assert(sentenceNode.length === 1);
        }
    );

    it('should remove the substring of `endContainer`, from its start to ' +
        '`endOffset`', function () {
            var range = new Range(),
                sentenceNode = retext.parse('Alfred').head.head,
                wordNode = sentenceNode.head,
                wordNode1 = wordNode.after(new TextOM.WordNode());

            wordNode1.append(new TextOM.TextNode('bertrand'));

            range.setStart(wordNode.head);
            range.setEnd(wordNode1.head, 6);
            assert(range.removeContent().toString() === 'Alfred,bertra');
            assert(sentenceNode.toString() === 'nd');
            assert(sentenceNode.tail.length === 1);
        }
    );

    it('should remove two siblings', function () {
        var range = new Range(),
            wordNode = retext.parse('Alfredbertrand').head.head.head,
            textNode1 = wordNode.head,
            textNode = textNode1.split(6);

        range.setStart(textNode);
        range.setEnd(textNode1);
        assert(range.removeContent().toString() === 'Alfred,bertrand');
        assert(wordNode.length === 0);

        range = new Range();
        wordNode.append(textNode);
        wordNode.append(textNode1);
        range.setStart(textNode, 2);
        range.setEnd(textNode1);
        assert(range.removeContent().toString() === 'fred,bertrand');
        assert(wordNode.toString() === 'Al');
        assert(wordNode.length === 1);

        range = new Range();
        wordNode.head.remove(); // Remove 'Al'
        textNode.fromString('Alfred');
        wordNode.append(textNode);
        wordNode.append(textNode1);
        range.setStart(textNode, 2);
        range.setEnd(textNode1, 6);
        assert(range.removeContent().toString() === 'fred,bertra');
        assert(wordNode.toString() === 'Alnd');
        assert(wordNode.length === 2);
    });

    it('should remove multiple siblings', function () {
        var range = new Range(),
            sentenceNode = retext.parse(
                'Alfred bertrand cees dick eric ferdinand'
            ).head.head;

        range.setStart(sentenceNode.head);
        range.setEnd(sentenceNode.tail);

        assert(
            range.removeContent().toString() ===
            'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand'
        );
        assert(sentenceNode.length === 0);

        range = new Range();
        sentenceNode = retext.parse(
            'Alfred bertrand cees dick eric ferdinand'
        ).head.head;
        range.setStart(sentenceNode.head.head, 3);
        range.setEnd(sentenceNode.tail.head);

        assert(
            range.removeContent().toString() ===
            'red, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand'
        );
        assert(sentenceNode.toString() === 'Alf');
        assert(sentenceNode.length === 2);

        range = new Range();
        sentenceNode = retext.parse(
            'Alfred bertrand cees dick eric ferdinand'
        ).head.head;
        range.setStart(sentenceNode.head.head, 3);
        range.setEnd(sentenceNode.tail.head, 7);

        assert(
            range.removeContent().toString() ===
            'red, ,bertrand, ,cees, ,dick, ,eric, ,ferdina'
        );
        assert(sentenceNode.toString() === 'Alfnd');
        assert(sentenceNode.length === 2);
    });

    it('should remove children of different parents', function () {
        var range = new Range(),
            paragraphNode = retext.parse('Alfred. Bertrand.').head;

        range.setStart(paragraphNode.head.head.head);
        range.setEnd(paragraphNode.tail.tail.head);

        assert(range.removeContent().toString() === 'Alfred,., ,Bertrand,.');
        assert(paragraphNode.head.head.length === 0);
        assert(paragraphNode.tail.head.length === 0);

        range = new Range();
        paragraphNode = retext.parse('Alfred. Bertrand.').head;
        range.setStart(paragraphNode.head.head.head, 1);
        range.setEnd(paragraphNode.tail.tail.head);
        assert(range.removeContent().toString() === 'lfred,., ,Bertrand,.');
        assert(paragraphNode.head.head.length === 1);
        assert(paragraphNode.head.toString() === 'A');
        assert(paragraphNode.tail.head.length === 0);

        range = new Range();
        paragraphNode = retext.parse('Alfred. Bertrand.').head;
        range.setStart(paragraphNode.head.head.head);
        range.setEnd(paragraphNode.tail.head.head, 3);
        assert(range.removeContent().toString() === 'Alfred,., ,Ber');
        assert(paragraphNode.head.head.length === 0);
        assert(paragraphNode.tail.length === 2);
        assert(paragraphNode.tail.toString() === 'trand.');
    });

    it('should concatenate children of different grandparents', function () {
        var range = new Range(),
            root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.');

        range.setStart(root.head.head.head.head);
        range.setEnd(root.tail.tail.tail.head);

        assert(
            range.removeContent().toString() ===
            'Alfred,., ,Bertrand.,\n\n,Cees., ,Dick,.'
        );
        assert(root.head.length === 1);
        assert(root.head.head.head.length === 0);
        assert(root.tail.length === 1);
        assert(root.tail.head.head.length === 0);

        range = new Range();
        root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.');
        range.setStart(root.head.head.head.head, 2);
        range.setEnd(root.tail.tail.tail.head);

        assert(
            range.removeContent().toString() ===
            'fred,., ,Bertrand.,\n\n,Cees., ,Dick,.'
        );
        assert(root.head.head.length === 1);
        assert(root.head.head.head.length === 1);
        assert(root.head.head.head.toString() === 'Al');
        assert(root.tail.head.length === 1);
        assert(root.tail.head.head.length === 0);

        range = new Range();
        root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.');
        range.setStart(root.head.tail.head.head);
        range.setEnd(root.tail.tail.head.head, 3);

        assert(
            range.removeContent().toString() ===
            'Bertrand,.,\n\n,Cees., ,Dic'
        );

        assert(root.head.length === 3);
        assert(root.head.toString() === 'Alfred. ');
        assert(root.head.head.length === 2);
        assert(root.head.head.toString() === 'Alfred.');
        assert(root.tail.length === 1);
        assert(root.tail.head.length === 2);
        assert(root.tail.head.toString() === 'k.');

        range = new Range();
        root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.');
        range.setStart(root.head.head.head.head, 3);
        range.setEnd(root.tail.tail.head.head, 3);

        assert(
            range.removeContent().toString() ===
            'red,., ,Bertrand.,\n\n,Cees., ,Dic'
        );

        assert(root.head.length === 1);
        assert(root.tail.length === 1);
        assert(root.head.head.length === 1);
        assert(root.head.head.toString() === 'Alf');
        assert(root.tail.head.length === 2);
        assert(root.tail.head.toString() === 'k.');
    });

    it('should *not* remove anything, when `startContainer` and ' +
        '`endContainer` no longer share the same root', function () {
            var range = new Range(),
                wordNode = retext.parse('Alfred').head.head.head,
                wordNode1 = wordNode.after(new TextOM.WordNode('bertrand'));

            range.setStart(wordNode);
            range.setEnd(wordNode1);

            wordNode1.remove();

            assert(range.removeContent().length === 0);
            assert(wordNode.parent.length === 1);
            assert(wordNode.parent.toString() === 'Alfred');
        }
    );
});

describe('TextOM.Range#getContent()', function () {
    it('should be of type `function`', function () {
        assert(typeof (new Range()).getContent === 'function');
    });

    it('should return an empty array, when no start- or endpoints exist',
        function () {
            var range = new Range();

            assert(range.getContent().length === 0);

            range = new Range();
            range.setStart(retext.parse('Alfred').head.head.head);
            assert(range.getContent().length === 0);

            range = new Range();
            range.setEnd(retext.parse('Alfred').head.head.head);
            assert(range.getContent().length === 0);
        }
    );

    it('should return an array containging `startContainer` when ' +
        '`startContainer` equals `endContainer`', function () {
            var range = new Range(),
                wordNode = retext.parse('Alfred').head.head.head;

            range.setStart(wordNode.head, 2);
            range.setEnd(wordNode.head, 2);
            assert(range.getContent().length === 1);
            assert(range.getContent()[0] === wordNode.head);
        }
    );

    it('should return an empty array, when startContainer is not in the ' +
        'same root as endContainer', function () {
            var range = new Range(),
                wordNode = retext.parse('Alfred').head.head.head,
                wordNode1 = wordNode.after(new TextOM.WordNode('bertrand'));

            range.setStart(wordNode);
            range.setEnd(wordNode1);

            wordNode1.remove();

            assert(range.getContent().length === 0);
        }
    );

    it('should return an array containing two direct siblings',
        function () {
            var range = new Range(),
                textNode1 = retext.parse('Alfredbert').head.head.head.head,
                textNode = textNode1.split(6),
                result;

            range.setStart(textNode);
            range.setEnd(textNode1);
            result = range.getContent();
            assert(result.length === 2);
            assert(result[0] === textNode);
            assert(result[1] === textNode1);
        }
    );

    it('should return an array containing multiple siblings',
        function () {
            var range = new Range(),
                sentenceNode = retext.parse(
                    'Alfred bertrand cees dick eric ferdinand.'
                ).head.head,
                result;

            range.setStart(sentenceNode.head);
            range.setEnd(sentenceNode.tail);
            result = range.getContent();
            assert(result.length === 12);
            assert(
                result.join() ===
                'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand,.'
            );

            range.setStart(sentenceNode.head.head, 3);
            result = range.getContent();
            assert(result.length === 12);
            assert(
                result.join() ===
                'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand,.'
            );

            range.setEnd(sentenceNode.tail, 7);
            result = range.getContent();
            assert(result.length === 12);
            assert(
                result.join() ===
                'Alfred, ,bertrand, ,cees, ,dick, ,eric, ,ferdinand,.'
            );
        }
    );

    it('should return an array containing text children of different parents',
        function () {
            var range = new Range(),
                sentenceNode = retext.parse('Alfred bertrand.').head.head,
                result;

            range.setStart(sentenceNode.head.head);
            range.setEnd(sentenceNode.tail.head);
            result = range.getContent();
            assert(result.toString() === 'Alfred, ,bertrand,.');
            assert(result.length === 4);
        }
    );

    it('should return an array containing children of different ' +
        'grandparents', function () {
            var range = new Range(),
                root = retext.parse('Alfred.\n\nBertrand.'),
                result;

            range.setStart(root.head.head.head.head);
            range.setEnd(root.tail.head.tail.head);
            result = range.getContent();
            assert(result.toString() === 'Alfred,.,\n\n,Bertrand,.');
            assert(result.length === 5);
        }
    );

    it('should return an array containing startContainer, when ' +
        'startContainer equals endContaineris an Element node, ' +
        'and the offsets cover the whole node', function () {
            var range = new Range(),
                sentenceNode = retext.parse('Alfred bertrand.').head.head,
                result;

            range.setStart(sentenceNode);
            range.setEnd(sentenceNode);
            result = range.getContent();

            assert(result.length === 1);
            assert(result[0] === sentenceNode);
        }
    );

    it('should return an array containing two direct element siblings',
        function () {
            var range = new Range(),
                paragraphNode = retext.parse('Alfred. Bertrand.').head,
                result;

            range.setStart(paragraphNode.head);
            range.setEnd(paragraphNode.tail);

            result = range.getContent();
            assert(result.length === 3);
            assert(result[0] === paragraphNode.head);
            assert(result[1] === paragraphNode.head.next);
            assert(result[2] === paragraphNode.tail);
        }
    );

    it('should return an array containing multiple element siblings',
        function () {
            var range = new Range(),
                paragraphNode = retext.parse(
                    'Alfred. Bertrand. Cees. Dick. Eric.'
                ).head,
                result;

            range.setStart(paragraphNode.head);
            range.setEnd(paragraphNode.tail);
            result = range.getContent();
            assert(result.length === 9);
            assert(result[0] === paragraphNode.head);
            assert(result[8] === paragraphNode.tail);

            range.setStart(paragraphNode.head.next.next);
            result = range.getContent();
            assert(result.length === 7);
            assert(result[0] === paragraphNode.head.next.next);
            assert(result[6] === paragraphNode.tail);

            range.setEnd(paragraphNode.tail.prev.prev);
            result = range.getContent();
            assert(result.length === 5);
            assert(result[0] === paragraphNode.head.next.next);
            assert(result[4] === paragraphNode.tail.prev.prev);
        }
    );

    it('should return an array containing elements of different grandparents',
        function () {
            var range = new Range(),
                root = retext.parse('Alfred.\n\nBertrand.'),
                result;

            range.setStart(root.head);
            range.setEnd(root.tail);
            result = range.getContent();
            assert(result.length === 3);
            assert(result[0] === root.head);
            assert(result[1] === root.head.next);
            assert(result[2] === root.tail);
        }
    );

    it('should return an array containing children, when startContainer ' +
        'equals endContainer, is an Element node, and endOffset is NOT ' +
        'equal to or greater than the length of node', function () {
            var range = new Range(),
                paragraphNode = retext.parse('Alfred. Bertrand. Cees.').head,
                result;

            range.setStart(paragraphNode);
            range.setEnd(paragraphNode, 3);
            result = range.getContent();
            assert(result.length === 3);
            assert(result[0] === paragraphNode.head);
            assert(result[1] === paragraphNode.head.next);
            assert(result[2] === paragraphNode.head.next.next);

            range.setStart(paragraphNode, 2);
            result = range.getContent();
            assert(result.length === 1);
            assert(result[0] === paragraphNode.head.next.next);
        }
    );

    it('should return an array containing children, when startContainer ' +
        'is an Element node, and endContainer is inside startContainer',
        function () {
            var range = new Range(),
                sentenceNode = retext.parse(
                    'Alfred bertrand cees.'
                ).head.head,
                result;

            range.setStart(sentenceNode);
            range.setEnd(sentenceNode.tail.prev);
            result = range.getContent();
            assert(result.length === 5);
            assert(result[0] === sentenceNode.head);
            assert(result[1] === sentenceNode.head.next);
            assert(result[2] === sentenceNode.head.next.next);
            assert(result[3] === sentenceNode.head.next.next.next);
            assert(result[4] === sentenceNode.head.next.next.next.next);

            range.setStart(sentenceNode, 2);
            result = range.getContent();
            assert(result.length === 3);
            assert(result[0] === sentenceNode.head.next.next);
            assert(result[1] === sentenceNode.head.next.next.next);
            assert(result[2] === sentenceNode.head.next.next.next.next);
        }
    );

    it('should return an array containing children but excluding ' +
        'startContainer, when startOffset is more than the length ' +
        'of startContainer', function () {
            var range = new Range(),
                root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.'),
                result;

            range.setStart(root.head.head, Infinity);
            range.setEnd(root.tail.tail.tail.head);
            result = range.getContent();
            assert(result.toString() === ' ,Bertrand.,\n\n,Cees., ,Dick,.');

            range.setStart(root.head, Infinity);
            result = range.getContent();
            assert(result.toString() === '\n\n,Cees., ,Dick,.');

            range = new Range();
            range.setStart(root.head.tail, Infinity);
            range.setEnd(root.tail.tail.tail);
            result = range.toString();
            assert(result.toString() === '\n\nCees. Dick.');
        }
    );

    it('should return an array containing children, when endContainer ' +
        'is an element, and endOffset is equal to or greater than the ' +
        'length of node', function () {
            var range = new Range(),
                root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.'),
                result;

            range.setStart(root.head.head.head);
            range.setEnd(root.tail.tail, Infinity);
            result = range.getContent();
            assert(
                result.toString() === 'Alfred,., ,Bertrand.,\n\n,Cees. Dick.'
            );
        }
    );

    it('should return an array containing children, when endContainer ' +
        'is an element, and endOffset is less than the length of node',
        function () {
            var range = new Range(),
                root = retext.parse('Alfred. Bertrand.\n\nCees. Dick.'),
                result;

            range.setStart(root.head);
            range.setEnd(root.tail.tail, 1);

            result = range.getContent();
            assert(
                result.toString() === 'Alfred. Bertrand.,\n\n,Cees., ,Dick'
            );

            range.setEnd(root.tail, 1);

            result = range.getContent();
            assert(
                result.toString() === 'Alfred. Bertrand.,\n\n,Cees.'
            );
        }
    );
});
