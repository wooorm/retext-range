'use strict';

/**
 * Dependencies.
 */

var retextFind,
    retextWalk;

retextFind = require('retext-find');
retextWalk = require('retext-walk');

/**
 * Constants.
 */

var slice;

slice = Array.prototype.slice;

/**
 * Get all ancestors of a node.
 *
 * @param {Node}
 * @return {Array.<Node>}
 */

function findAncestors(node) {
    return 'findParents' in node ? node.findParents() : [];
}

/**
 * Get the root of a node.
 *
 * @param {Node}
 * @return {(Node|null)}
 */

function findRoot(node) {
    var result;

    result = findAncestors(node);

    return result[result.length - 1];
}

/**
 * Get the first child of `container`.
 *
 * @param {Element|Child}
 * @return {Child?}
 */

function findJustBefore(container) {
    var node;

    node = container.findBefore();

    if (!node && 'findFirstChild' in container) {
        node = container.findFirstChild();
    }

    return node || container;
}

/**
 * Define `retextRange`.
 *
 * @param {Retext} retext - Instance of Retext.
 */

function retextRange(retext) {
    var rangePrototype;

    /**
     * Dependencies.
     */

    retext.use(retextFind).use(retextWalk);

    /**
     * Create `Range`.
     */

    function Range() {}

    rangePrototype = Range.prototype;

    /**
     * The starting node of a range, null otherwise.
     *
     * @type {Node?}
     * @readonly
     */

    rangePrototype.startContainer = null;

    /**
     * The starting offset of a range `null` when not existing.
     *
     * @type {number?}
     * @readonly
     */

    rangePrototype.startOffset = null;

    /**
     * The ending node of a range, null otherwise.
     *
     * @type {Node?}
     * @readonly
     */

    rangePrototype.endContainer = null;

    /**
     * The ending offset of a range, `null` when not existing.
     *
     * @type {number?}
     * @readonly
     */

    rangePrototype.endOffset = null;

    /**
     * Set the start of a range.
     *
     * @param {Node} container - Node to start the range at.
     * @param {number?} offset - Offset of `container`.
     * @return this
     */

    rangePrototype.setStart = function (container, offset) {
        var self,
            endContainer,
            endOffset,
            offsetIsDefault,
            resolvedEndOffset,
            end,
            shouldSwitch;

        if (!container) {
            throw new TypeError(
                '`' + container + '` is not a valid `container` for ' +
                '`Range#setStart(container, offset)`'
            );
        }

        self = this;

        offsetIsDefault = false;

        if (
            offset === null ||
            offset === undefined ||
            offset !== offset
        ) {
            offset = 0;
            offsetIsDefault = true;
        } else if (
            typeof offset !== 'number' ||
            offset < 0
        ) {
            throw new TypeError(
                '`' + offset + '` is not a valid `offset` for ' +
                '`Range#setStart(container, offset)`'
            );
        }

        endContainer = self.endContainer;
        endOffset = self.endOffset;

        shouldSwitch = true;

        if (!endContainer) {
            shouldSwitch = false;
        } else {
            if (findRoot(endContainer) !== findRoot(container)) {
                throw new Error(
                    'WrongRootError: `container` is in the wrong document'
                );
            }

            /**
             * When container is also the endContainer.
             */

            if (endContainer === container) {
                shouldSwitch = endOffset < offset;
            } else {
                if ('length' in endContainer) {
                    if (endOffset >= endContainer.length) {
                        resolvedEndOffset = endContainer.length - 1;
                    } else {
                        resolvedEndOffset = endOffset;
                    }

                    end = endContainer[resolvedEndOffset];
                } else {
                    end = endContainer;
                }

                if (container !== end) {
                    findJustBefore(container).walkForwards(function (node) {
                        if (node === end) {
                            shouldSwitch = false;

                            return false;
                        }
                    });
                }
            }
        }

        if (shouldSwitch) {
            self.endContainer = container;
            self.endOffset = offsetIsDefault ? Infinity : offset;
            self.startContainer = endContainer;
            self.startOffset = endOffset;
        } else {
            self.startContainer = container;
            self.startOffset = offset;
        }

        return self;
    };

    /**
     * Set the end of a range.
     *
     * @param {Node} container - Node to end the range at.
     * @param {number?} offset - Offset of `container`.
     * @return this
     */

    rangePrototype.setEnd = function (container, offset) {
        var self,
            startContainer,
            startOffset,
            resolvedStartOffset,
            start,
            offsetIsDefault,
            shouldSwitch;

        if (!container) {
            throw new Error(
                '`' + container + '` is not a valid `container` for ' +
                '`Range#setEnd(container, offset)`'
            );
        }

        self = this;

        offsetIsDefault = false;

        if (offset === null || offset === undefined || offset !== offset) {
            offset = Infinity;
            offsetIsDefault = true;
        } else if (typeof offset !== 'number' || offset < 0) {
            throw new TypeError(
                '`' + offset + '` is not a valid `offset` for ' +
                '`Range#setStart(container, offset)`'
            );
        }

        startContainer = self.startContainer;
        startOffset = self.startOffset;

        shouldSwitch = true;

        if (!startContainer) {
            shouldSwitch = false;
        } else {
            if (findRoot(startContainer) !== findRoot(container)) {
                throw new Error(
                    'WrongRootError: `container` is in the wrong document'
                );
            }

            /**
             * When container is also the startContainer.
             */

            if (startContainer === container) {
                shouldSwitch = startOffset > offset;
            } else {
                if ('length' in startContainer) {
                    if (startOffset >= startContainer.length) {
                        resolvedStartOffset = startContainer.length - 1;
                    } else {
                        resolvedStartOffset = startOffset;
                    }

                    start = startContainer[resolvedStartOffset];
                } else {
                    start = startContainer;
                }

                if (container !== start) {
                    findJustBefore(start).walkForwards(function (node) {
                        if (node === container) {
                            shouldSwitch = false;

                            return false;
                        }
                    });
                }
            }
        }

        if (shouldSwitch) {
            self.startContainer = container;
            self.startOffset = offsetIsDefault ? 0 : offset;
            self.endContainer = startContainer;
            self.endOffset = startOffset;
        } else {
            self.endContainer = container;
            self.endOffset = offset;
        }

        return self;
    };

    /**
     * Stringify every node in a range, substringing
     * where necessary;
     *
     * @return {String}
     */

    rangePrototype.toString = function () {
        var self,
            content,
            startOffset,
            endOffset,
            startContainer,
            endContainer,
            startIsText,
            index;

        self = this;

        content = self.getContent();

        if (content.length === 0) {
            return '';
        }

        startOffset = self.startOffset;
        endOffset = self.endOffset;
        startContainer = self.startContainer;
        endContainer = self.endContainer;

        startIsText = !('length' in startContainer);

        if (
            startContainer === endContainer &&
            startIsText
        ) {
            return startContainer.toString().slice(startOffset, endOffset);
        }

        if (startIsText) {
            content[0] = content[0].toString().slice(startOffset);
        }

        if (!('length' in endContainer)) {
            index = content.length - 1;
            content[index] = content[index].toString().slice(0, endOffset);
        }

        return content.join('');
    };

    /**
     * Remove all nodes covered by `range` and remove
     * partially covered parts.
     *
     * @return {Array.<Node>} Removed nodes.
     */

    rangePrototype.removeContent = function () {
        var self,
            content,
            startOffset,
            endOffset,
            startContainer,
            endContainer,
            index,
            startIsText,
            startValue,
            middle;

        self = this;

        content = self.getContent();

        if (content.length === 0) {
            return content;
        }

        startOffset = self.startOffset;
        endOffset = self.endOffset;
        startContainer = self.startContainer;
        endContainer = self.endContainer;

        startValue = startContainer.toString();

        startIsText = !('length' in startContainer);

        if (
            startIsText &&
            startContainer === endContainer
        ) {
            if (startOffset === endOffset) {
                return [];
            }

            if (
                startOffset === 0 &&
                endOffset >= startValue.length
            ) {
                startContainer.remove();

                return content;
            }

            if (startOffset !== 0) {
                startContainer.split(startOffset);

                endOffset -= startOffset;
            }

            if (endOffset < startValue.length) {
                middle = startContainer.split(endOffset);
            }

            startContainer = middle || startContainer;

            startContainer.remove();

            return [startContainer];
        }

        if (
            startIsText &&
            startOffset > 0
        ) {
            startContainer.split(startOffset);

            content[0] = startContainer;
        }

        if (
            !('length' in endContainer) &&
            endOffset < endContainer.toString().length
        ) {
            content[content.length - 1] = endContainer.split(endOffset);
        }

        index = -1;

        while (content[++index]) {
            content[index].remove();
        }

        return content;
    };

    /**
     * Get the nodes in a range as an array.
     *
     * If a node's parent is completely encapsulated by
     * the range, returns that parent. Treats
     * `startOffset` as `0`) when `startContainer` is
     * `Text`. Treats `endOffset` as `Infinity`) when
     * `endContainer` is `Text`.
     *
     * @return {Array.<Node>} Completely covered nodes.
     */

    rangePrototype.getContent = function () {
        var content,
            self,
            startContainer,
            startOffset,
            endContainer,
            endOffset,
            endAncestors,
            node;

        self = this;

        startContainer = self.startContainer;
        startOffset = self.startOffset;
        endContainer = self.endContainer;
        endOffset = self.endOffset;

        /**
         * Return an empty array when either:
         *
         * - `startContainer` or `endContainer` are not
         *   set;
         * - `startContainer` or `endContainer` are not
         *   attached;
         * - `startContainer` does not share a root with
         *   `endContainer`.
         */

        if (
            !startContainer ||
            !endContainer ||
            !startContainer.parent ||
            !endContainer.parent ||
            findRoot(startContainer) !== findRoot(endContainer)
        ) {
            return [];
        }

        if (startContainer === endContainer) {
            /**
             * Return an array containing `startContainer`
             * when `startContainer` either:
             *
             * - does not accept children;
             * - is covered by `range`.
             */

            if (
                !('length' in startContainer) ||
                (
                    startOffset === 0 &&
                    endOffset >= startContainer.length
                )
            ) {
                return [startContainer];
            }

            /**
             * Return an array containing the children
             * of `startContainer` between `startOffset`
             * and `endOffset`.
             */

            return slice.call(startContainer, startOffset, endOffset);
        }

        if (
            startOffset !== 0 &&
            'length' in startContainer
        ) {
            /**
             * If a child exists at `startOffset`, let
             * `startContainer` be that child.
             *
             * Otherwise, let `startContainer` be a
             * following node of `startContainer`.
             */

            if (startOffset in startContainer) {
                startContainer = startContainer[startOffset];
            } else {
                startContainer =
                    startContainer.next || startContainer.findAfterUpwards();
            }
        }

        /**
         * Find the highest covered ancestor of
         * `endContainer`.
         */

        if (endOffset >= endContainer.length) {
            while (endContainer.parent.tail === endContainer) {
                endContainer = endContainer.parent;

                if (!endContainer.parent) {
                    break;
                }
            }
        }

        content = [];

        endAncestors = findAncestors(endContainer);

        node = startContainer;

        /**
         * Get all nodes between start and end.
         */

        while (node) {
            if (node === endContainer) {
                /**
                 * Add `endContainer` to `content`, if
                 * `endContainer` either:
                 *
                 * - does not accept children;
                 * - is covered by `range`.
                 *
                 * Otherwise, add its children untill
                 * `endOffset`.
                 */

                if (
                    !('length' in endContainer) ||
                    endOffset >= endContainer.length
                ) {
                    content.push(node);
                } else {
                    content = content.concat(
                        slice.call(endContainer, 0, endOffset)
                    );
                }

                break;
            }

            /**
             * If `node` is an ancestor of `endContainer`,
             * let `next` be its `head`.
             *
             * Otherwise, add `node` to `content` and
             * let `next` be one of its following siblings
             * or ancestors.
             */

            if (endAncestors.indexOf(node) !== -1) {
                node = node.head;
            } else {
                content.push(node);

                node = node.next || node.findAfterUpwards();
            }
        }

        return content;
    };

    /**
     * Expose `Range` on `TextOM`.
     */

    retext.TextOM.Range = Range;
}

/**
 * Expose `retextRange`.
 */

module.exports = retextRange;
