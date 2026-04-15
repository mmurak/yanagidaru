class GlobalManager {
	constructor() {
		this.tocSel = document.getElementById("TOCSel");
		this.entryField = document.getElementById("EntryField");
		this.searchButton = document.getElementById("SearchButton");
		this.URL = 0;
		this.OFFSET = 1;
		this.ENTRIES = 2;
		this.tocSel2 = document.getElementById("TOCSel2");
		this.entryField2 = document.getElementById("EntryField2");
		this.searchButton2 = document.getElementById("SearchButton2");
	}
}

const G = new GlobalManager();
const R = new RegulatorNeo();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const ENV = urlParams.get('env') ?? '';

const header = document.createElement("option");
header. text = "− 索引篇の各種情報 −";
header.value = -1;
G.tocSel.appendChild(header);
for (let i = 1; i < preamble.length; i++) {
	const elem = document.createElement("option");
	elem.text = preamble[i][0];
	elem.value = preamble[i][1];
	G.tocSel.appendChild(elem);
}
for (let i = 1; i < postamble.length; i++) {
	const elem = document.createElement("option");
	elem.text = postamble[i][0];
	elem.value = postamble[i][1];
	G.tocSel.appendChild(elem);
}

const header2 = document.createElement("option");
header2. text = "− 第1〜12巻の各種情報 −";
header2.value = -1;
G.tocSel2.appendChild(header2);
for (let i = 0; i < dossier.length; i++) {
	for (let j = 0; j < dossier[i][1].length; j++) {
		const elem = document.createElement("option");
		elem.text = dossier[i][1][j][0];
		elem.value = dossier[i][0] + '::' + dossier[i][1][j][1];
		G.tocSel2.appendChild(elem);
	}
}


G.entryField.focus();
testConsistency();

////////////////////////////////////////////////////////////

G.entryField.addEventListener("keydown", (evt) => {
	if (evt.key === "Enter" && !evt.isComposing) {
		evt.preventDefault();
		indexSearch();
	} else if (evt.key === "Escape") {
		G.entryField.value = "";
	}
	G.entryField.focus();
});

G.entryField2.addEventListener("keydown", (evt) => {
	if (evt.key === "Enter" && !evt.isComposing) {
		evt.preventDefault();
		indexSearch2();
	} else if (evt.key === "Escape") {
		G.entryField2.value = "";
	}
	G.entryField2.focus();
});

G.entryField.addEventListener("focus", () => {
	G.entryField.select();
});

G.entryField2.addEventListener("focus", () => {
	G.entryField2.select();
});

function tocChange(val) {
	if (val <= 0)  return;
	G.entryField.value = "";
	G.entryField.focus();
	windowOpen(preamble[G.URL], val, '索引編の各種情報');
	G.tocSel.selectedIndex = 0;
}

function indexSearch() {
	G.tocSel.selectedIndex = 0;
	G.tocSel2.selectedIndex = 0;
	let target = G.entryField.value;
	target = target.replace(/[ァ-ン]/g, function(s) {
		return String.fromCharCode(s.charCodeAt(0) - 0x60);
	});
	let vol = contentsIndex.length - 1;
	while (vol >= 0) {
		for (let entIdx = contentsIndex[vol][G.ENTRIES].length-1; entIdx >=0; entIdx--) {
			if (R.compare(target, contentsIndex[vol][G.ENTRIES][entIdx]) >= 0) {
				windowOpen(contentsIndex[vol][G.URL], (contentsIndex[vol][G.OFFSET]+entIdx), '検索結果');
				return;
			}
		}
		vol--;
	}
}

function windowOpen(url, page, windowType) {
	if (ENV === 'local') {
		const uri = url.split('\|')[1];
		window.open(uri + page, windowType);
	} else {
		const uri = url.split('\|')[0];
		window.open(uri + page, windowType);
	}
	G.entryField.focus();
}

function clearField() {
	G.tocSel.selectedIndex = 0;
	G.entryField.value = "";
	G.entryField.focus();
}

function testConsistency() {
	let value = "";
	for (let vol = 0; vol < contentsIndex.length; vol++) {
		for (let ent = 0; ent < contentsIndex[vol][G.ENTRIES].length; ent++) {
			if (R.compare(value, contentsIndex[vol][G.ENTRIES][ent]) > 0) {
				console.log(`${value} : ${contentsIndex[vol][G.ENTRIES][ent]}`);
			}
			value = contentsIndex[vol][G.ENTRIES][ent];
		}
	}
	value = "";
}

function tocChange2(val) {
	if (val <= 0)  return;
	G.entryField.value = "";
	G.entryField.focus();
	const pair = val.split(/::/);
	windowOpen(pair[0], pair[1], '各種情報');
	G.tocSel2.selectedIndex = 0;
}

function concat(char) {
	const start = G.entryField2.selectionStart;
	const end = G.entryField2.selectionEnd;
	G.entryField2.value = G.entryField2.value.slice(0, start) + char + G.entryField2.value.slice(end);
	G.entryField2.focus();
	G.entryField2.selectionStart = G.entryField2.selectionEnd = start + char.length;
}

function clearField2() {
	G.tocSel2.selectedIndex = 0;
	G.entryField2.value = "";
	G.entryField2.focus();
}

function indexSearch2() {
	G.tocSel.selectedIndex = 0;
	G.tocSel2.selectedIndex = 0;
	let target = G.entryField2.value;
	target = target.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
	let [targetHen, targetChou] = target.split(/[\s\-−]/);
	if (targetChou === undefined) {
		alert('篇と丁を空白か「-」で区切って入力してください。');
		return;
	}
	for (let vol = 0; vol < contentsData.length; vol++) {
		for (let hen = 2; hen < contentsData[vol].length; hen++) {
			if (contentsData[vol][hen][0] === targetHen) {
				for (let chou = 0; chou < contentsData[vol][hen][2].length; chou++) {
					if (contentsData[vol][hen][2][chou].includes(targetChou)) {
						windowOpen(contentsData[vol][1], Number(contentsData[vol][hen][1])+chou, '篇丁');
						return;
					}
				}
			}
		}
	}
	alert(`"${G.entryField2.value}"はありません。`);
}
