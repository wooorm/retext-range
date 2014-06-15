'use strict';

exports = module.exports = function () {};

var arraySlice = Array.prototype.slice;

function findAncestors(node) {
    var result = [];

    while (node) {
        if (!node.parent) {
            return result;
        }

        result.push(node);

        node = node.parent;
    }
}

function findRoot(node) {
    var result = findAncestors(node);

    return result[result.length - 1].parent;
}

function findNextAncestor(node) {
    while (node) {
        if ((node = node.parent) && node.next) {
            return node.next;
        }
    }

    return null;
}

function attach(retext) {
    var rangePrototype;

    /**
     * Expose Range.
     */
    function Range() {}

    rangePrototype = Range.prototype;

    /**
     * The starting node of a range, null otherwise.
     *
     * @api public
     * @type {?Node}
     * @readonly
     */
    rangePrototype.startContainer = null;

    /**
     * The starting offset of a range `null` when not existing.
     *
     * @api public
     * @type {?number}
     * @readonly
     */
    rangePrototype.startOffset = null;

    /**
     * The ending node of a range, null otherwise.
     *
     * @api public
     * @type {?Node}
     * @readonly
     */
    rangePrototype.endContainer = null;

    /**
     * The ending offset of a range, `null` when not existing.
     *
     * @api public
     * @type {?number}
     * @readonly
     */
    rangePrototype.endOffset = null;

    /**
     * Set the start container and offset of a range.
     *
     * @param {Node} startContainer - the start container to start the range
     *                                at.
     * @param {?number} offset - (integer) the start offset of the container
     *                           to start the range at;
     * @api public
     */
    rangePrototype.setStart = function (startContainer, offset) {
        if (!startContainer) {
            throw new TypeError('\'' + startContainer + ' is not a valid ' +
                'argument for \'Range.prototype.setStart\'');
        }

        var self = this,
            endContainer = self.endContainer,
            endOffset = self.endOffset,
            offsetIsDefault = false,
            wouldBeValid = false,
            endAncestors, node;

        if (offset === null || offset === undefined || offset !== offset) {
            offset = 0;
            offsetIsDefault = true;
        } else if (typeof offset !== 'number' || offset < 0) {
            throw new TypeError('\'' + offset + ' is not a valid argument ' +
                'for \'Range.prototype.setStart\'');
        }

        if (!endContainer) {
            wouldBeValid = true;
        } else {
            if (findRoot(endContainer) !== findRoot(startContainer)) {
                throw new Error('WrongRootError: The given startContainer ' +
                    'is in the wrong document.');
            }

            /* When startContainer is also the endContainer; */
            if (endContainer === startContainer) {
                wouldBeValid = endOffset >= offset;
            } else {
                endAncestors = findAncestors(endContainer);
                node = startContainer;

                while (node) {
                    if (node === endContainer) {
                        wouldBeValid = true;
                        break;
                    }

                    if (endAncestors.indexOf(node) === -1) {
                        node = node.next || findNextAncestor(node);
                    } else {
                        node = node.head;
                    }
                }
            }
        }

        if (wouldBeValid) {
            self.startContainer = startContainer;
            self.startOffset = offset;
        } else {
            self.endContainer = startContainer;
            self.endOffset = offsetIsDefault ? Infinity : offset;
            self.startContainer = endContainer;
            self.startOffset = endOffset;
        }
    };

    /**
     * Set the end container and offset of a range.
     *
     * @param {Node} endContainer - the end container to start the range at.
     * @param {?number} offset - (integer) the end offset of the container to
     *                           end the range at;
     * @api public
     */
    rangePrototype.setEnd = function (endContainer, offset) {
        if (!endContainer) {
            throw new TypeError('\'' + endContainer + ' is not a valid ' +
                'argument for \'Range.prototype.setEnd\'');
        }

        var self = this,
            startContainer = self.startContainer,
            startOffset = self.startOffset,
            offsetIsDefault = false,
            wouldBeValid = false,
            endAncestors, node;

        if (offset === null || offset === undefined || offset !== offset) {
            offset = Infinity;
            offsetIsDefault = true;
        } else if (typeof offset !== 'number' || offset < 0) {
            throw new TypeError('\'' + offset + ' is not a valid argument ' +
                'for \'Range.prototype.setEnd\'');
        }

        if (!startContainer) {
            wouldBeValid = true;
        } else {
            if (findRoot(startContainer) !== findRoot(endContainer)) {
                throw new Error('WrongRootError: The given endContainer ' +
                    'is in the wrong document.');
            }

            /* When endContainer is also the startContainer; */
            if (startContainer === endContainer) {
                wouldBeValid = startOffset <= offset;
            } else {
                endAncestors = findAncestors(endContainer);
                node = startContainer;

                while (node) {
                    if (node === endContainer) {
                        wouldBeValid = true;
                        break;
                    }

                    if (endAncestors.indexOf(node) === -1) {
                        node = node.next || findNextAncestor(node);
                    } else {
                        node = node.head;
                    }
                }
            }
        }

        if (wouldBeValid) {
            self.endContainer = endContainer;
            self.endOffset = offset;
        } else {
            self.startContainer = endContainer;
            self.startOffset = offsetIsDefault ? 0 : offset;
            self.endContainer = startContainer;
            self.endOffset = startOffset;
        }
    };

    /**
     * Return the result of calling `toString` on each of Text node inside
     * `range`, substringing when necessary;
     *
     * @return {String}
     * @api public
     */
    rangePrototype.toString = function () {
        var content = this.getContent(),
            startOffset = this.startOffset,
            endOffset = this.endOffset,
            startContainer = this.startContainer,
            endContainer = this.endContainer,
            startIsText, index;

        if (content.length === 0) {
            return '';
        }

        startIsText = !('length' in startContainer);

        if (startContainer === endContainer && startIsText) {
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
     * Removes all nodes completely covered by `range` and removes the parts
     * covered by `range` in partial covered nodes.
     *
     * @return {Node[]} content - The removed nodes.
     * @api public
     */
    rangePrototype.removeContent = function () {
        var content = this.getContent(),
            startOffset = this.startOffset,
            endOffset = this.endOffset,
            startContainer = this.startContainer,
            endContainer = this.endContainer,
            iterator = -1,
            startIsText, startValue, middle;

        if (content.length === 0) {
            return content;
        }

        startIsText = !('length' in startContainer);
        startValue = startContainer.toString();

        if (startContainer === endContainer && startIsText) {
            if (startOffset === endOffset) {
                return [];
            }

            if (startOffset === 0 && endOffset >= startValue.length) {
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

        if (startIsText && startOffset > 0) {
            startContainer.split(startOffset);
            content[0] = startContainer;
        }

        if (!('length' in endContainer) &&
            endOffset < endContainer.toString().length) {
                content[content.length - 1] = endContainer.split(endOffset);
        }

        while (content[++iterator]) {
            content[iterator].remove();
        }

        return content;
    };

    /**
     * Return the nodes in a range as an array. If a nodes parent is
     * completely encapsulated by the range, returns that parent. Ignores
     * startOffset (i.e., treats as `0`) when startContainer is a text node.
     * Ignores endOffset (i.e., treats as `Infinity`) when endContainer is a
     * text node.
     *
     * @return {Node[]} content - The nodes completely encapsulated by
     *                            the range.
     * @api public
     */
    rangePrototype.getContent = function () {
        var content = [],
            self = this,
            startContainer = self.startContainer,
            startOffset = self.startOffset,
            endContainer = self.endContainer,
            endOffset = self.endOffset,
            endAncestors, node;

        /*
         * Return an empty array when either:
         * - startContainer or endContainer are not set;
         * - startContainer or endContainer are not attached;
         * - startContainer does not share a root with endContainer.
         */
        if (!startContainer || !endContainer || !startContainer.parent ||
            !endContainer.parent || findRoot(startContainer) !==
            findRoot(endContainer)) {
                return content;
        }

        /* If startContainer equals endContainer... */
        if (startContainer === endContainer) {
            /* Return an array containing startContainer when startContainer
             * either:
             * - does not accept children;
             * - starts and ends so range contains all its children.
             */
            if (!('length' in startContainer) ||
                (startOffset === 0 && endOffset >= startContainer.length)) {
                    return [startContainer];
            }

            /* Return an array containing the children of startContainer
             * between startOffset and endOffset. */
            return arraySlice.call(startContainer, startOffset, endOffset);
        }

        /* If startOffset isn't `0` and startContainer accepts children... */
        if (startOffset && ('length' in startContainer)) {
            /* If a child exists at startOffset, let startContainer be that
             * child. */
            if (startOffset in startContainer) {
                startContainer = startContainer[startOffset];
            /* Otherwise, let startContainer be a following node of
             * startContainer. */
            } else {
                startContainer = startContainer.next || findNextAncestor(
                    startContainer
                );
            }
        }

        /* If the whole endNode is in the range... */
        if (endOffset >= endContainer.length) {
            /* While endContainer is the last child of its parent... */
            while (endContainer.parent.tail === endContainer) {
                /* Let endContainer be its parent. */
                endContainer = endContainer.parent;

                /* Break when the new endContainer has no parent. */
                if (!endContainer.parent) {
                    break;
                }
            }
        }

        /* Find all ancestors of endContainer. */
        endAncestors = findAncestors(endContainer);

        /* While node is truthy... */
        node = startContainer;

        while (node) {
            /* If node equals endContainer... */
            if (node === endContainer) {
                /* Add endContainer to content, if either:
                 * - endContainer does not accept children;
                 * - ends so range contains all its children.
                 */
                if (!('length' in endContainer) ||
                    endOffset >= endContainer.length) {
                        content.push(node);
                /* Add the children of endContainer to content from its start
                 * until its endOffset. */
                } else {
                    content = content.concat(
                        arraySlice.call(endContainer, 0, endOffset)
                    );
                }

                /* Stop iterating. */
                break;
            }

            /* If node is not an ancestor of endContainer... */
            if (endAncestors.indexOf(node) === -1) {
                /* Add node to content */
                content.push(node);

                /* Let the next node to iterate over be either its next
                 * sibling, or a following ancestor. */
                node = node.next || findNextAncestor(node);
            /* Otherwise, let the next node to iterate over be either its
             * first child, its next sibling, or a following ancestor. */
            } else {
                /* Note that a `head` always exists on a parent of
                 * `endContainer`, thus we do not check for `next`, or a next
                 * ancestor. */
                node = node.head;
            }
        }

        /* Return content. */
        return content;
    };

    retext.parser.TextOM.Range = Range;
}

/**
 * Expose `attach`.
 * @memberof exports
 */
exports.attach = attach;
