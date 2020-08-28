ace.define("ace/mode/doc_comment_highlight_rules",[], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var DocCommentHighlightRules = function() {
    this.$rules = {
        "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
        }, 
        DocCommentHighlightRules.getTagRule(),
        {
            defaultToken : "comment.doc",
            caseInsensitive: true
        }]
    };
};

oop.inherits(DocCommentHighlightRules, TextHighlightRules);

DocCommentHighlightRules.getTagRule = function(start) {
    return {
        token : "comment.doc.tag.storage.type",
        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
};

DocCommentHighlightRules.getStartRule = function(start) {
    return {
        token : "comment.doc", // doc comment
        regex : "\\/\\*(?=\\*)",
        next  : start
    };
};

DocCommentHighlightRules.getEndRule = function (start) {
    return {
        token : "comment.doc", // closing comment
        regex : "\\*\\/",
        next  : start
    };
};


exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

ace.define("ace/mode/volant_highlight_rules",[], function(require, exports, module) {
    "use strict";
    
    function types() {
        return {
            token: 'storage.type',
            regex: /(?:^|(?<!\B))(?<=\,|\[|\]|\)|\{|\:|\(|\s|\n|\*)(?:u8|u16|u32|u64|i8|i16|i32|i64|float|double|bool|dynamic|func){1}(?!\B)/
        }
    }
    
    let lang = require("../lib/lang");
    let preTypes = 'start', preStart = null;
    
    let DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
    
    let escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
        "u[0-9a-fA-F]{4}|" + // unicode
        "u{[0-9a-fA-F]{1,6}}|" + // es6 unicode
        "[0-2][0-7]{0,2}|" + // oct
        "3[0-7][0-7]?|" + // oct
        "[4-7][0-7]?|" + //oct
        ".)";
    
    let VolantHighlightRules = function() {
    
        this.$rules = {
            "start" : [
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : 'storage.type',
                regex : /(?<=\=\s*)func\b/,
                next : 'params' 
            }, {
                token : "paren.lparen",
                regex : /(?<=\b(enum|struct|tuple|union)\s+(\w+\d*\_*)+\s*)\{/,
                next : 'structure_definitions'
            },
            types(), {
                token: 'storage.type',
                regex: /\b(const)\b/
            }, {
                token : "string",
                regex : "'(?=.)",
                next  : "qstring"
            }, {
                token : "string",
                regex : '"(?=.)',
                next  : "qqstring"
            }, {
                token : "constant.numeric", // hexadecimal, octal and binary
                regex : /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/
            }, {
                token : "constant.numeric", // decimal integers and floats
                regex : /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
            }, {
                token : "comment",
                regex : /\/\/.+/
            }, {
                token : "comment.doc",
                regex : '\\\/\\\*',
                next : 'eoc'
            }, {
                token : 'storage.type markdown.italic',
                regex : /(?<=\:\s*)((async|work)\s+)?(func)/
            }, {
                token : 'keyword',
                regex : /\b(enum|struct|tuple|typedef|union)(?=\s*(\w+\d*\_*)+)\b/
            }, {
                token : "keyword.operator",
                regex : /(\+|\=|\!|\-|\*|\/|\&|(\:\=))/
            }, {
                token : 'keyword.control markup.italic',
                regex : /\b(if|else|for|switch|case|default|break|continue)\b/
            }, {
                token : "paren.lparen",
                regex : /[\[({]/,
            }, {
                token : "paren.rparen",
                regex : /[\])}]/
            }, {
                token : 'keyword.control markup.bold',
                regex : /\b(return|new|inline|delete|cast)\b/
            }, {
                token : 'keyword',
                regex : /\b(import)(?=\s+(\"|\'))/
            }, {
                token : 'entity.function.name',
                regex : /(\w\d*\_*)+(?=\s*\(.*\))/
            }, {
                token : 'entity.name.class',
                regex : /(?<=\b(enum|struct|tuple|union|typedef)\s+)(\w+\d*\_*)+/
            }, {
                token : 'variable.name',
                regex : /((\b(\w+\d*\_*)+(?=(\[.*\])?\s*(\:|\=)))|((?<=(return)\s+)(\w+\d*\_*)+))/
            }, {
                token : 'text',
                regex : /\b(\w+\d*\_*)+\b/
            }, {
                token : 'text',
                regex : /(\,|\;)/,
                next : () => preStart || 'start'
            }, {
                defaultToken : "text"
            }],
            "qqstring" : [
                {
                    token : "constant.language.escape",
                    regex : escapedRe
                }, {
                    token : "string",
                    regex : "\\\\$",
                    consumeLineEnd  : true
                }, {
                    token : "string",
                    regex : '"|$',
                    next  : "start"
                }, {
                    defaultToken: "string"
                }
            ],
            "qstring" : [
                {
                    token : "constant.language.escape",
                    regex : escapedRe
                }, {
                    token : "string",
                    regex : "\\\\$",
                    consumeLineEnd  : true
                }, {
                    token : "string",
                    regex : "'|$",
                    next  : "start"
                }, {
                    defaultToken: "string"
                }
            ],
            "eoc": [
                {
                    token : 'comment.doc',
                    regex : "\\\*\\\/",
                    next : 'start',
                    consumeLineEnd: true
                }, {
                    defaultToken: "comment.doc"
                }
            ],
            'params': [{
                    token : "paren.lparen",
                    regex : /[\[({]/,
                }, {
                    token : 'text',
                    regex : /\:/,
                    next : (() => {preTypes = 'params'; return 'types'})()
                }, {
                    token : "paren.rparen",
                    regex : /[\])}]/,
                    next : 'start'
                }, {
                    token : 'variable.parameter',
                    regex : /(\w\d*\_*)+/
                }, {
                    defaultToken: 'text'
                }
            ],
            'types': [types(), {
                    token : 'text',
                    regex : /(\,|\;)/,
                    next : (() => { return preTypes; })()
                }, {
                    token : "paren.rparen",
                    regex : /[\])}]/,
                    next : 'start'
                }
            ],
            'structure_definitions': [
                {
                    token : "comment",
                    regex : /\/\/.+/
                }, {
                    token : "comment.doc",
                    regex : '\\\/\\\*',
                    next : 'eoc'
                },
                types(),
                {
                    token : 'variable.parameter',
                    regex : /(\w\d*\_*)+/
                }, {
                    token : "paren.lparen",
                    regex : /[\[({]/,
                }, {
                    token : 'keyword.operator',
                    regex :/\=/,
                    next : () => {preStart = 'structure_definitions'; return 'start'}
                }, {
                    token : 'text',
                    regex : /\:/,
                    next : (() => {preTypes = 'structure_definitions'; return 'types'})()
                }, {
                    token : "paren.rparen",
                    regex : /[\])}]/,
                    next : () => {preStart = undefined; return 'start'; }
                },
            ]
        };
    };
    
    (function() {
    
        this.addRules = function(rules, prefix) {
            if (!prefix) {
                for (let key in rules)
                    this.$rules[key] = rules[key];
                return;
            }
            for (let key in rules) {
                let state = rules[key];
                for (let i = 0; i < state.length; i++) {
                    let rule = state[i];
                    if (rule.next || rule.onMatch) {
                        if (typeof rule.next == "string") {
                            if (rule.next.indexOf(prefix) !== 0)
                                rule.next = prefix + rule.next;
                        }
                        if (rule.nextState && rule.nextState.indexOf(prefix) !== 0)
                            rule.nextState = prefix + rule.nextState;
                    }
                }
                this.$rules[prefix + key] = state;
            }
        };
    
        this.getRules = function() {
            return this.$rules;
        };
    
        this.embedRules = function (HighlightRules, prefix, escapeRules, states, append) {
            let embedRules = typeof HighlightRules == "function"
                ? new HighlightRules().getRules()
                : HighlightRules;
            if (states) {
                for (let i = 0; i < states.length; i++)
                    states[i] = prefix + states[i];
            } else {
                states = [];
                for (let key in embedRules)
                    states.push(prefix + key);
            }
    
            this.addRules(embedRules, prefix);
    
            if (escapeRules) {
                let addRules = Array.prototype[append ? "push" : "unshift"];
                for (let i = 0; i < states.length; i++)
                    addRules.apply(this.$rules[states[i]], lang.deepCopy(escapeRules));
            }
    
            if (!this.$embeds)
                this.$embeds = [];
            this.$embeds.push(prefix);
        };
    
        this.getEmbeds = function() {
            return this.$embeds;
        };
    
        let pushState = function(currentState, stack) {
            if (currentState != "start" || stack.length)
                stack.unshift(this.nextState, currentState);
            return this.nextState;
        };
        let popState = function(currentState, stack) {
            stack.shift();
            return stack.shift() || "start";
        };
    
        this.normalizeRules = function() {
            let id = 0;
            let rules = this.$rules;
            function processState(key) {
                let state = rules[key];
                state.processed = true;
                for (let i = 0; i < state.length; i++) {
                    let rule = state[i];
                    let toInsert = null;
                    if (Array.isArray(rule)) {
                        toInsert = rule;
                        rule = {};
                    }
                    if (!rule.regex && rule.start) {
                        rule.regex = rule.start;
                        if (!rule.next)
                            rule.next = [];
                        rule.next.push({
                            defaultToken: rule.token
                        }, {
                            token: rule.token + ".end",
                            regex: rule.end || rule.start,
                            next: "pop"
                        });
                        rule.token = rule.token + ".start";
                        rule.push = true;
                    }
                    let next = rule.next || rule.push;
                    if (next && Array.isArray(next)) {
                        let stateName = rule.stateName;
                        if (!stateName)  {
                            stateName = rule.token;
                            if (typeof stateName != "string")
                                stateName = stateName[0] || "";
                            if (rules[stateName])
                                stateName += id++;
                        }
                        rules[stateName] = next;
                        rule.next = stateName;
                        processState(stateName);
                    } else if (next == "pop") {
                        rule.next = popState;
                    }
    
                    if (rule.push) {
                        rule.nextState = rule.next || rule.push;
                        rule.next = pushState;
                        delete rule.push;
                    }
    
                    if (rule.rules) {
                        for (let r in rule.rules) {
                            if (rules[r]) {
                                if (rules[r].push)
                                    rules[r].push.apply(rules[r], rule.rules[r]);
                            } else {
                                rules[r] = rule.rules[r];
                            }
                        }
                    }
                    let includeName = typeof rule == "string" ? rule : rule.include;
                    if (includeName) {
                        if (Array.isArray(includeName))
                            toInsert = includeName.map(function(x) { return rules[x]; });
                        else
                            toInsert = rules[includeName];
                    }
    
                    if (toInsert) {
                        let args = [i, 1].concat(toInsert);
                        if (rule.noEscape)
                            args = args.filter(function(x) {return !x.next;});
                        state.splice.apply(state, args);
                        i--;
                    }
                    
                    if (rule.keywordMap) {
                        rule.token = this.createKeywordMapper(
                            rule.keywordMap, rule.defaultToken || "text", rule.caseInsensitive
                        );
                        delete rule.defaultToken;
                    }
                }
            }
            Object.keys(rules).forEach(processState, this);
        };
    
        this.createKeywordMapper = function(map, defaultToken, ignoreCase, splitChar) {
            let keywords = Object.create(null);
            this.$keywordList = [];
            Object.keys(map).forEach(function(className) {
                let a = map[className];
                let list = a.split(splitChar || "|");
                for (let i = list.length; i--; ) {
                    let word = list[i];
                    this.$keywordList.push(word);
                    if (ignoreCase)
                        word = word.toLowerCase(); 
                    keywords[word] = className;
                }
            }, this);
            map = null;
            return ignoreCase
                ? function(value) {return keywords[value.toLowerCase()] || defaultToken; }
                : function(value) {return keywords[value] || defaultToken; };
        };
    
        this.getKeywords = function() {
            return this.$keywords;
        };
    
    }).call(VolantHighlightRules.prototype);
    
    exports.VolantHighlightRules = VolantHighlightRules;
    });

ace.define("ace/mode/matching_brace_outdent",[], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define("ace/mode/folding/cstyle",[], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
    }
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {
    
    this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;
    this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
    this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
    this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
    this._getFoldWidgetBase = this.getFoldWidget;
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);
    
        if (this.singleLineBlockCommentRe.test(line)) {
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                return "";
        }
    
        var fw = this._getFoldWidgetBase(session, foldStyle, row);
    
        if (!fw && this.startRegionRe.test(line))
            return "start"; // lineCommentRegionStart
    
        return fw;
    };

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
        var line = session.getLine(row);
        
        if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);
        
        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
                
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            
            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle != "all")
                    range = null;
            }
            
            return range;
        }

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) {
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    };
    
    this.getSectionRange = function(session, row) {
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);
            
            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent == indent) {
                    break;
                }
            }
            endRow = row;
        }
        
        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };
    this.getCommentRegionBlock = function(session, line, row) {
        var startColumn = line.search(/\s*$/);
        var maxRow = session.getLength();
        var startRow = row;
        
        var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
        var depth = 1;
        while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
        }

        var endRow = row;
        if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
        }
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/volant",[], function(require, exports, module) {
    "use strict";
    
    let oop = require("../lib/oop");
    let TextMode = require("./text").Mode;
    let VolantHighlightRules = require("./volant_highlight_rules").VolantHighlightRules;
    let MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
    let WorkerClient = require("../worker/worker_client").WorkerClient;
    let CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
    let CStyleFoldMode = require("./folding/cstyle").FoldMode;
    
    let Mode = function() {
        this.HighlightRules = VolantHighlightRules;
        
        this.$outdent = new MatchingBraceOutdent();
        this.$behaviour = new CstyleBehaviour();
        this.foldingRules = new CStyleFoldMode();
    };
    oop.inherits(Mode, TextMode);
    
    (function() {
    
        this.lineCommentStart = "//";
        this.blockComment = {start: "/*", end: "*/"};
        this.$quotes = {'"': '"', "'": "'"};
    
        this.getNextLineIndent = function(state, line, tab) {
            let indent = this.$getIndent(line);
    
            let tokenizedLine = this.getTokenizer().getLineTokens(line, state);
            let tokens = tokenizedLine.tokens;
            let endState = tokenizedLine.state;
    
            if (tokens.length && tokens[tokens.length-1].type == "comment") {
                return indent;
            }
    
            if (state == "start" || state == "no_regex") {
                let match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
                if (match) {
                    indent += tab;
                }
            } else if (state == "doc-start") {
                if (endState == "start" || endState == "no_regex") {
                    return "";
                }
                let match = line.match(/^\s*(\/?)\*/);
                if (match) {
                    if (match[1]) {
                        indent += " ";
                    }
                    indent += "* ";
                }
            }
    
            return indent;
        };
    
        this.checkOutdent = function(state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };
    
        this.autoOutdent = function(state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };
    
        this.createWorker = function(session) {
            return null;
        };
    
        this.$id = "ace/mode/javascript";
        this.snippetFileId = "ace/snippets/javascript";
    }).call(Mode.prototype);
    
    exports.Mode = Mode;
    });
                (function() {
                    ace.require(["ace/mode/volant"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            