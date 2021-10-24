// ==UserScript==
// @name        Snahp Auto Base64 Decode
// @description Auto Decode Base64 within User Threads
// @author      Bilibox
// @version     1.0.1
// @include     /^https:\/\/forum\.snahp\.it\/viewtopic\.php\?\/*/
// @icon        https://forum.snahp.it/favicon.ico
// @homepage    https://github.com/Bilibox/Snahp-Auto-Base64-Decode
// @supportURL  https://github.com/Bilibox/Snahp-Auto-Base64-Decode/issues/
// @updateURL   https://github.com/Bilibox/Snahp-Auto-Base64-Decode/raw/main/Snahp%20Auto%20Base64%20Decode.user.js
// @downloadURL https://github.com/Bilibox/Snahp-Auto-Base64-Decode/raw/main/Snahp%20Auto%20Base64%20Decode.user.js
// @grant       none
// @run-at      document-end
// ==/UserScript==

var results = [];

main();

function main() {
	if (document.getElementsByClassName('postbody') != undefined) {
		CustomRecursiveTreeWalker();
		let thread = document
			.getElementsByClassName('postbody')[0]
			.getElementsByClassName('content')[0];
		for (let index = 0; index < results.length; index++) {
			thread.innerHTML = thread.innerHTML.replace(
				'TextWasDecoded',
				results[index]
			);
		}
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
	let decodedList = decoded.split('\n');
	let result = `<br>Encoded: ${encoded} <br>Decoded: `;
	for (decoded of decodedList) {
		let link = decoded.match(
			/(?:https?:\/\/)?(?:www)?(?:\.?[^\s]*\.)+(?:\/?[^\s]*\/?)+/
		);
		let replaceValue = '';
		if (!link) {
			link = KeyToLink(decoded);
			replaceValue = decoded;
		} else {
			replaceValue = link;
		}
		result += decoded.replace(
			replaceValue,
			`<a href='${link}' class='postlink'>${link}</a>\n<br>`
		);
	}
	results.push(result);
}

function KeyToLink(key) {
	if (key.match(/(?<=^folder\/|^file\/|^#!|^#F!)\w{8}/)) {
		return `https://mega.nz/${key}`;
	}
	return key;
}

function Base64Testing(child) {
	const base64Regex =
		/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/g;
	// Check if string has newlines or spaces
	if (child.nodeValue.match(/(\r\n|\n|\r|\s)/gm)) {
		var wasDecoded = false;
		// Split strings by newline/spaces
		let splitText = child.nodeValue.split(/(\r\n|\n|\r|\s)/);
		for (let index = 0; index < splitText.length; index++) {
			const megafied = KeyToLink(splitText[index]);
			if (splitText[index] !== megafied) {
				splitText[index] = megafied;
			}
			// Check string is divisble by 4 or 8
			if (splitText[index] && !(splitText[index].length / 4 <= 2)) {
				let encodedText = splitText[index].match(base64Regex);
				if (encodedText) {
					// Decode String
					let decodedText = Base64ToUTF8(encodedText);
					if (decodedText) {
						// Check if it matches regex again (Double Encoded B64)
						if (decodedText.match(base64Regex)) {
							decodedText = Base64ToUTF8(decodedText);
						}
						if (decodedText.includes('xxxx.nz')) {
							decodedText = decodedText.replace('xxxx.nz', 'mega.nz');
						}
						decodedText = KeyToLink(decodedText);
						ResultsPush(splitText[index], decodedText);
						splitText[index] = 'TextWasDecoded';
						wasDecoded = true;
					}
				}
			}
		}
		child.nodeValue = splitText.join('');
	} else {
		let encodedText = child.nodeValue.match(base64Regex);
		if (encodedText[0] && !(encodedText[0].length / 4 <= 2)) {
			let decodedText = Base64ToUTF8(encodedText[0]);
			if (decodedText) {
				if (decodedText.match(base64Regex)) {
					decodedText = Base64ToUTF8(decodedText);
				}
				if (decodedText.includes('xxxx.nz')) {
					decodedText = decodedText.replace('xxxx.nz', 'mega.nz');
				}
				decodedText = KeyToLink(decodedText);
				ResultsPush(child.nodeValue, decodedText);
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
					Base64Testing(child);
				} catch (e) {
					console.error(e);
				}
			} else {
				findTextNodes(child);
			}
		}
	})(
		document
			.getElementsByClassName('postbody')[0]
			.getElementsByClassName('content')[0]
	);
}
