'use strict';
let fs = require('fs');
let css = require('css');
let _ = require('lodash');
let options = {
    prefixes : {
        css : 'sb-',
        generated: 'sb-g-'
    }
};

var myCssText = "";
myCssText += fs.readFileSync('./tests/mock_data/sp2013/corev15.css', 'utf8') + '\n';
myCssText += fs.readFileSync('./tests/mock_data/sp2013/controls15.css', 'utf8') + '\n';
myCssText += fs.readFileSync('./tests/mock_data/sp2013/pagelayouts15.css', 'utf8') + '\n';
//myCssText = fs.readFileSync('./tests/mock_data/o365/themable-corev15.css', 'utf8');

let myParsedCss = css.parse(myCssText);
// rules must have declarations, must have comments that are 'valid' according to our validator function.
let validRules = myParsedCss.stylesheet.rules
                    .filter(r=>r.declarations)
                    .filter(r=>r.declarations.filter(d=>validComment(d.comment)).length); 
// we only want the valid comments, and this is just a nice way to sort them...
let formattedRules = validRules.map( (rule) => {
    return {
        'selectors' : rule.selectors, 
        'comments' : rule.declarations.filter(d=>validComment(d.comment)).map(d=>d.comment)
    }
});


let commentSets = _(formattedRules).groupBy('comments');

var newRules = [];

_(commentSets).forEach(function(val,key) {
    var selectors = [];
    val.forEach(ruleset => selectors = selectors.concat(ruleset.selectors))
    newRules.push({
        rule : cssClassFromComment(key),
        selectors :  selectors
    });
});

var ruleCssTemplate = _.template("\n${ selectors.join(',') }\n" + 
"{ @extend .${ rule } !optional }");

var scss = "";
_(newRules).forEach(r=>scss+=ruleCssTemplate(r));
fs.writeFile('./sb-generated.scss', scss);

// ensures text in comment is a valid SharePoint 'parsed' comment
function validComment(comment) {
    return comment && comment.length && comment.includes('[Replace');
} 

// takes a formatted Value replacement comment, generates a CSS class name that describes the comment.
function cssClassFromComment(comments){
    // e.g. test case : [ReplaceColor(themeColor:\"BackgroundOverlay-Lightest\",opacity:\"1\")]
    // capture groups, e.g. [0] whole, [1] ReplaceColor [2] themeColor [3] TileBackgroundOverlay
    var commentRegex = /\[([0-z]*)\(([0-z]*)\:\"([0-z_\-]*)\".*\)\]/;
    
    var names = comments.split(/[\]\ ],[\[\ ]/).map( (comment) => {
        var ruleParameters = commentRegex.exec(comment.trim());
        if(ruleParameters) {
            return (ruleParameters[1].replace("Replace","").toLowerCase() + "_" + ruleParameters[3]);
        } else { 
            // there are only a few of these... but we can do better here. 
            var heuristicName = comment.replace(/[\[\]\"\(\)\,_:0-9]*/g,'').toLowerCase() + '';
            return heuristicName.trim();
        }
    });

    var name = _(names).union().join('-');
    return options.prefixes.generated + name;
}