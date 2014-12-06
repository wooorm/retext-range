'use strict';

var Retext,
    retextRange;

/**
 * Dependencies.
 */

Retext = require('retext');
retextRange = require('./');

/**
 * Dependencies.
 */

var retext;

retext = new Retext().use(retextRange);

/**
 * Test data: A (big?) article (w/ 100 paragraphs, 500
 * sentences, 10,000 words);
 *
 * Source:
 *   http://www.gutenberg.org/files/10745/10745-h/10745-h.htm
 */

var sentence,
    paragraph,
    section,
    article,
    completeSection,
    completeArticle;

sentence = 'Where she had stood was clear, and she was gone since Sir ' +
    'Kay does not choose to assume my quarrel.';

paragraph = 'Thou art a churlish knight to so affront a lady ' +
    'he could not sit upon his horse any longer. ' +
    'For methinks something hath befallen my lord and that he ' +
    'then, after a while, he cried out in great voice. ' +
    'For that light in the sky lieth in the south ' +
    'then Queen Helen fell down in a swoon, and lay. ' +
    'Touch me not, for I am not mortal, but Fay ' +
    'so the Lady of the Lake vanished away, everything behind. ' +
    sentence;

section = paragraph + Array(10).join('\n\n' + paragraph);

article = section + Array(10).join('\n\n' + section);

before(function (done) {
    retext.parse(section, function (err, tree) {
        section = tree;

        completeSection = new section.TextOM.Range()
            .setStart(section.head)
            .setEnd(section.tail);

        done(err);
    });
});

before(function (done) {
    retext.parse(article, function (err, tree) {
        article = tree;

        completeArticle = new section.TextOM.Range()
            .setStart(article.head)
            .setEnd(article.tail);

        done(err);
    });
});

suite('TextOM.Range#setStart()', function () {
    bench('A section', function () {
        new section.TextOM.Range().setStart(section.head);
    });

    bench('An article', function () {
        new article.TextOM.Range().setStart(article.head);
    });
});

suite('TextOM.Range#setEnd()', function () {
    bench('A section', function () {
        new section.TextOM.Range().setStart(section.head);
    });

    bench('An article', function () {
        new article.TextOM.Range().setStart(article.head);
    });
});

suite('TextOM.Range#setStart() and TextOM.Range#setEnd()', function () {
    bench('A section', function () {
        new section.TextOM.Range()
            .setStart(section.head)
            .setEnd(section.tail);
    });

    bench('An article', function () {
        new article.TextOM.Range()
            .setStart(article.head)
            .setEnd(article.tail);
    });
});

suite('TextOM.Range#setEnd() and TextOM.Range#setStart()', function () {
    bench('A section', function () {
        new section.TextOM.Range()
            .setEnd(section.tail)
            .setStart(section.head);
    });

    bench('An article', function () {
        new article.TextOM.Range()
            .setEnd(article.tail)
            .setStart(article.head);
    });
});

suite('TextOM.Range#toString()', function () {
    bench('A section', function () {
        completeSection.toString();
    });

    bench('An article', function () {
        completeArticle.toString();
    });
});

suite('TextOM.Range#getContent()', function () {
    bench('A section', function () {
        completeSection.getContent();
    });

    bench('An article', function () {
        completeArticle.getContent();
    });
});
