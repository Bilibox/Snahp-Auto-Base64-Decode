// ==UserScript==
// @name        Snahp Auto Base64 Decode
// @description Auto Decode Base64 within User Threads
// @author      Bilibox
// @version     1.0.0
// @include     /^https:\/\/forum\.snahp\.it\/viewtopic\.php\?\/*/
// @icon        https://forum.snahp.it/favicon.ico
// @homepage    https://github.com/Bilibox/Snahp-Auto-Base64-Decode
// @supportURL  https://github.com/Bilibox/Snahp-Auto-Base64-Decode/issues/
// @updateURL   https://github.com/Bilibox/Snahp-Auto-Base64-Decode/raw/main/Snahp%20Auto%20Base64%20Decode.user.js
// @downloadURL https://github.com/Bilibox/Snahp-Auto-Base64-Decode/raw/main/Snahp%20Auto%20Base64%20Decode.user.js
// @match       none
// @grant       none
// @run-at      document-end
// ==/UserScript==

var results = [];

if (document.getElementsByClassName("postbody") != undefined) {
    CustomRecursiveTreeWalker()
    let thread = document.getElementsByClassName("postbody")[0].getElementsByClassName("content")[0];
    for (let index = 0; index < results.length; index++) {
        thread.innerHTML = thread.innerHTML.replace('TextWasDecoded', results[index]);
    }
}

function Base64ToUTF8(str) {
    try {
        return decodeURIComponent(escape(window.atob(str)));
    } catch (e) {
        return '';
    }
}

function ResultsPush(encoded, decoded) {
    results.push(`<br>Encoded Base64: ${encoded} <br>Decoded Base64: <a href='${decoded}' class='postlink'>${decoded}</a>`)
}

function Base64Testing(child, current) {
    const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/g;
    if (child.nodeValue.match(/(\r\n|\n|\r|\s)/gm)) {
        var wasDecoded = false;
        let splitText = child.nodeValue.split(/(\r\n|\n|\r|\s)/);
        for (let index = 0; index < splitText.length; index++) {
            if (splitText[index] && !(splitText[index].length / 4 <= 2)) {
                let encodedText = splitText[index].match(base64Regex)
                if (encodedText) {
                    let decodedText = Base64ToUTF8(encodedText);
                    if (decodedText) {
                        if (decodedText.match(base64Regex)) {
                            decodedText = Base64ToUTF8(decodedText)
                        }
                        ResultsPush(splitText[index], decodedText)
                        splitText[index] = 'TextWasDecoded'
                        wasDecoded = true;
                    }
                }
            }
        }
        if (wasDecoded) {
            child.nodeValue = splitText.join('');
        }
    } else {
        let encodedText = child.nodeValue.match(base64Regex);
        if (encodedText[0] && !(encodedText[0].length / 4 <= 2)) {
            let decodedText = Base64ToUTF8(encodedText[0]);
            if (decodedText) {
                if (decodedText.match(base64Regex)) {
                    decodedText = Base64ToUTF8(decodedText)
                }
                ResultsPush(child.nodeValue, decodedText)
                child.nodeValue = 'TextWasDecoded';
            }
        }
    }
}

function CustomRecursiveTreeWalker() {
    (function findTextNodes(current) {
        for (let i = 0; i < current.childNodes.length; i++) {
            var child = current.childNodes[i];
            if (child.nodeType == 3) {
                try {
                    Base64Testing(child, current)
                } catch (e) {}
            }
            else {
                findTextNodes(child);
            }
        }
    })(document.getElementsByClassName("postbody")[0].getElementsByClassName("content")[0]);
}
