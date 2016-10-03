'use strict';
let fs = require('fs');
let css = require('css');
var myCssText = "";
myCssText += fs.readFileSync('./tests/mock_data/sp2013/controls15.css', 'utf8') + '\n';
myCssText += fs.readFileSync('./tests/mock_data/sp2013/pagelayouts15.css', 'utf8') + '\n';
myCssText += fs.readFileSync('./tests/mock_data/sp2013/corev15.css', 'utf8') + '\n';

let myParsedCss = css.parse(myCssText);
// rules must have declarations, must have comments that are 'valid' according to our validator function.
let validRules = myParsedCss.stylesheet.rules
                    .filter(r=>r.declarations)
                    .filter(r=>r.declarations.filter(d=>validComment(d.comment)).length); 
let report = validRules.map( (rule) => {
    return {
        'selectors' : rule.selectors, 
        'comments' : rule.declarations.filter(d=>validComment(d.comment)).map(d=>d.comment)
    }
});
fs.writeFile('./report.json', JSON.stringify(report));

// ensures text in comment is a valid SharePoint 'parsed' comment
function validComment(comment) {
    return comment && comment.length && comment.includes('[Replace') 
} 
