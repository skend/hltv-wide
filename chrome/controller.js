function init() {
	var ranking;
	var width;
	var useColors;

	chrome.storage.sync.get(null, function(items) {
    	ranking = items.ranking;
    	width = items.width;
    	useColors = items.colors;
    	setBoxes = items.switchBoxes;

    	if (width == undefined || ranking == undefined) {
    		width = '1400';
    		ranking = 10;
    	}

    	determineLayout(ranking, width, useColors, setBoxes);
  	});
}

function determineLayout(ranking, width, useColors, setBoxes) {
	injectCSS(width);

	window.addEventListener("DOMContentLoaded", function() {
		insertUsernameIntoNavbar();
		foldComments();
		var url = document.URL;
		// LUL
		if (!(url.startsWith('https://www.hltv.org/matches') || 
			url.startsWith('https://www.hltv.org/events') || 
			url.startsWith('https://www.hltv.org/ranking/teams') ||
			url.startsWith('https://www.hltv.org/results') ||
			url.startsWith('https://www.hltv.org/stats') ||
			url.startsWith('https://www.hltv.org/galleries'))) {
			editRanking(ranking);
		}

		if (useColors) {
			useColorsOnMatches();
		}

		if (setBoxes && url == 'https://www.hltv.org/')
			switchReplaysAndStreams();
	});
}

function switchReplaysAndStreams() {
	var streams = $('.rightCol')[0].children;
	var replays = $('.right2Col')[0].children;
	var asides = [];
	var count = 0;

	for (var i = 0; i < streams.length; i++) {
		if (streams[i].tagName == 'ASIDE') {
			asides[count++] = streams[i];
	    }
	}
	var aside1 = asides[2];

	asides = [];
	count = 0;
	var replays = document.getElementsByClassName('right2Col')[0].children;
	for (var i = 0; i < replays.length; i++) {
		if (replays[i].tagName == 'ASIDE') {
			asides[count++] = replays[i];
	    }
	}
	var aside2 = asides[1];

	var oneCSS = $('.col-box .streamer .a-reset').css;

	swapNodes(aside1, aside2);

	var div = aside1.children[1].children;

	for (var i = 0; i < div.length; i++) {
		div[i].style.cssText += 'height: 30px';
		for (var j = 0; j < div[i].children.length; j++) {
			if (j == 0) div[i].children[j].style.cssText += 'margin-left: 6px;';
			else div[i].children[j].style.cssText += 'margin-left: 2px;';

			div[i].children[j].style.cssText += 
				'vertical-align: middle;' +
				'position: relative;' +
				'left: 5px;' +
				'top: 7px;' +
				'font-size: 12px;'
				;
		}

		var innertext = div[i].innerText;
		var title = div[i].title;
		var viewerCount = innertext.replace(title, '');

		var str = div[i].outerHTML;
		var sub1 = str.substring(0, str.lastIndexOf('</span>')+7)
		var sub2 = str.substring(str.lastIndexOf('</a>'), str.length);
		var html = sub1 + '<span style="position: relative;top: 7px;float: right;margin-right: 12px;">' + viewerCount + '</span>' + sub2;
		div[i].innerHTML = "";

		$(div[i]).append(html);

		// div[i].innerText = innertext.replace(viewerCount, '');
	}
}

function swapNodes(a, b) {
    var aparent = a.parentNode;
    var asibling = a.nextSibling === b ? a : a.nextSibling;
    b.parentNode.insertBefore(a, b);
    aparent.insertBefore(b, asibling);
}

function injectCSS(width) {
	switch(width) {
	    case '1000':
	        document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1000.css") + '">'
			);
	        break;
	    case '1100':
	        document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1100.css") + '">'
			);
	        break;
	    case '1200':
			document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1200.css") + '">'
			);
	        break;
	    case '1300':
	        document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1300.css") + '">'
			);
	        break;
	    case '1400':
	        document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1400.css") + '">'
			);
	        break;
	    case '1500':
			document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1500.css") + '">'
			);
	        break;
	    case '1600':
	        document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1600.css") + '">'
			);
	        break;
	    case '1700':
	        document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1700.css") + '">'
			);
	        break;
	    case '1800':
			document.head.insertAdjacentHTML('beforeend',
			    '<link rel="stylesheet" type="text/css" href="' + 
           		chrome.runtime.getURL("styles/style1800.css") + '">'
			);
	        break;
	    default:
	    	console.log('Error regarding width. Width = ' + width);
	}
}

function editRankingShort(number) {
	var container = $('.col-box-con')[1];

	for (var i = 0; i < number - 5; i++) {
		$(container).append(ranks[i]);
	}
}

function editRanking(number) {
	$.get("https://www.hltv.org/ranking/teams/", function(response) {
		var teamList = [];
		var teamIdList = [];
		var ranking = $('.leftCol')[0].children[3];
		var container = $('.col-box-con')[1];
	    var list = $(response).find('.ranked-team.standard-box');
		for (var i = 0; i < number; i++) {
			var elem = list[i].children[0].children[0];
			teamList[i] = elem.children[2].innerText;
			teamIdList[i] = elem.children[1].children[0].src.slice(-4);
		}

		for (var i = 5; i < teamList.length; i++) {
			var rankBox = '<div class="col-box rank"><a href="/ranking/teams" class="rankNum">' + (i + 1) + 
			'.</a><img alt="' + teamList[i] + '" src="https://static.hltv.org/images/team/logo/' + teamIdList[i] + 
			'" class="teamImg" title="' + teamList[i] + '"><a href="/team/' + teamIdList[i] + '/' + teamList[i] + '" class="text-ellipsis"> ' + teamList[i] + '</a></div>';
			$(container).append(rankBox);
		}
	});
}

// Edit navbar to contain link to your userpage
function insertUsernameIntoNavbar() {
	var insAfter = $('.navborder')[0];
	var anchor = $('.right.nav-popup-header-a')[0];
			
	var profileName = anchor.innerText;
	var linkToProfile = anchor.href;

	var usernameLink = '<div style="position: relative; left: 7px;"><a href="' + linkToProfile + '">' + profileName + '</a></div>';

	$(usernameLink).insertAfter(insAfter);
}

// Add fold button to comments
function foldComments() {
	var children = $('.children');
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if ($(child).is(':empty')) {
			addMinus($(child).prev()[0].children[0].children[0]);
		}
	}

	$('.threading').each(function() {
		if (!($(this).hasClass('newReplyBox'))) {
			if ((this.parentElement).className == 'threading') {
				var box = this.parentElement.children[0].children[0].children;
				addMinus(box[0]);
			}
			else if ((this.parentElement).className == 'children') {
				var children = this.parentElement;
				var box = $(children).prev()[0].children[0].children;
				addMinus(box[0]);
			}
		}
	});
}

function hideUnhide(anchor) {
	if (anchor.className != 'maximizeComment') {
		var element = anchor.parentElement;
		var box = element.parentElement.parentElement;
		if (box.parentElement.className != 'threading') {
	  		$(box.children[0]).hide();
	  		$(box).next().hide();
	  		$(element).insertAfter(box);
	  		$('<div class="minimize-spacing" style="height: 8px;"></div>').insertAfter(element);
		}
		else {
			box = box.parentElement;
			$(element).insertBefore(box.children[0]);
			for (var i = 1; i < box.children.length; i++) {
				$(box.children[i]).hide();
			}
		}
		anchor.innerText = '[ + ]';
	  	anchor.className = "maximizeComment";
	}
	// unhide
	else {
		var forumTopbar = anchor.parentElement;

		// inner
		if (forumTopbar.parentElement.className == 'threading') {
			var standardBox = $(forumTopbar).next();
			var replies = standardBox[0].parentElement.children;
			var threading = $(standardBox[0]).next();
			for (var i = 1; i < replies.length; i++) {
				replies[i].style.cssText = 'display: block;';
			}
			$(forumTopbar).prependTo(standardBox[0].children[0]);
		}
		// outer
		else {
			var post = $(forumTopbar).prev();
			post[0].children[0].style.cssText = 'display: block;';
			$(forumTopbar).prependTo(post[0].children[0]);

			var spacing = $(post[0]).next();
			spacing[0].remove();

			var replies = $(post[0]).next();
			replies[0].style.cssText = 'display: block';
		}

		anchor.innerText = '[ - ]';
	  	anchor.className = "minimizeComment";
	}
}

function addMinus(element) {
	if ($(element).find('.minimizeComment').length == 0) { 
  		var anchor = document.createElement('a');
		anchor.appendChild(document.createTextNode('[ - ]'));
		anchor.className = "minimizeComment";
		anchor.style = 'padding-right: 6px; cursor: pointer; user-select: none;';
		anchor.addEventListener('click', function() {
			hideUnhide(anchor);
		});

		element.prepend(anchor);
	}
}

// Edit matches column to colour ones with X number of stars
function useColorsOnMatches() {
	var colors = [
		'#e0f0ff',
		'#dcf4dd',
		'#d9d6fc',
		'rgb(241, 201, 175)',
		'#e8de9e'
	];

	$('.star1').each(function() {
		setBackgroundColor($(this)[0], colors[0]);
	});

	$('.star2').each(function() {
		setBackgroundColor($(this)[0], colors[1]);
	});

	$('.star3').each(function() {
		setBackgroundColor($(this)[0], colors[2]);
	});

	$('.star4').each(function() {
		setBackgroundColor($(this)[0], colors[3]);
	});

	$('.star5').each(function() {
		setBackgroundColor($(this)[0], colors[4]);
	});
}

function setBackgroundColor(element, color) {
	element.parentElement.style.backgroundColor = color;
}

// var ranks = [
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">6</a><img alt="North" src="https://static.hltv.org/images/team/logo/7533" class="teamImg" title="North"><a href="/team/7533/North" class="text-ellipsis"> North</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">7</a><img alt="Natus Vincere" src="https://static.hltv.org/images/team/logo/4608" class="teamImg" title="Natus Vincere"><a href="/team/4608/Natus%20Vincere" class="text-ellipsis"> Natus Vincere</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">8</a><img alt="Gambit" src="https://static.hltv.org/images/team/logo/6651" class="teamImg" title="Gambit"><a href="/team/6651/Gambit" class="text-ellipsis"> Gambit</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">9</a><img alt="HellRaisers" src="https://static.hltv.org/images/team/logo/5310" class="teamImg" title="HellRaisers"><a href="/team/5310/HellRaisers" class="text-ellipsis"> HellRaisers</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">10</a><img alt="OpTic" src="https://static.hltv.org/images/team/logo/6615" class="teamImg" title="OpTic"><a href="/team/6615/OpTic" class="text-ellipsis"> OpTic</a></div>',

// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">11</a><img alt="fnatic" src="https://static.hltv.org/images/team/logo/4991" class="teamImg" title="fnatic"><a href="/team/4991/fnatic" class="text-ellipsis"> fnatic</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">12</a><img alt="Cloud9" src="https://static.hltv.org/images/team/logo/5752" class="teamImg" title="Cloud9"><a href="/team/5752/Cloud9" class="text-ellipsis"> Cloud9</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">13</a><img alt="NiP" src="https://static.hltv.org/images/team/logo/4411" class="teamImg" title="NiP"><a href="/team/4411/NiP" class="text-ellipsis"> NiP</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">14</a><img alt="mousesports" src="https://static.hltv.org/images/team/logo/4494" class="teamImg" title="mousesports"><a href="/team/4494/mousesports" class="text-ellipsis"> mousesports</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">15</a><img alt="Immortals" src="https://static.hltv.org/images/team/logo/7010" class="teamImg" title="Immortals"><a href="/team/7010/Immortals" class="text-ellipsis"> Immortals</a></div>',

// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">16</a><img alt="CLG" src="https://static.hltv.org/images/team/logo/5974" class="teamImg" title="CLG"><a href="/team/5974/CLG" class="text-ellipsis"> CLG</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">17</a><img alt="Heroic" src="https://static.hltv.org/images/team/logo/7175" class="teamImg" title="Heroic"><a href="/team/7175/Heroic" class="text-ellipsis"> Heroic</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">18</a><img alt="Misfits" src="https://static.hltv.org/images/team/logo/7557" class="teamImg" title="Misfits"><a href="/team/7557/Misfits" class="text-ellipsis"> Misfits</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">19</a><img alt="Liquid" src="https://static.hltv.org/images/team/logo/5973" class="teamImg" title="Liquid"><a href="/team/5973/Liquid" class="text-ellipsis"> Liquid</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">20</a><img alt="PENTA" src="https://static.hltv.org/images/team/logo/5395" class="teamImg" title="PENTA"><a href="/team/5395/PENTA" class="text-ellipsis"> PENTA</a></div>',

// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">21</a><img alt="Chiefs" src="https://static.hltv.org/images/team/logo/6010" class="teamImg" title="Chiefs"><a href="/team/6010/Chiefs" class="text-ellipsis"> Chiefs</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">22</a><img alt="Renegades" src="https://static.hltv.org/images/team/logo/6211" class="teamImg" title="Renegades"><a href="/team/6211/Renegades" class="text-ellipsis"> Renegades</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">23</a><img alt="BIG" src="https://static.hltv.org/images/team/logo/7532" class="teamImg" title="BIG"><a href="/team/7532/BIG" class="text-ellipsis"> BIG</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">24</a><img alt="Singularity" src="https://static.hltv.org/images/team/logo/6978" class="teamImg" title="Singularity"><a href="/team/6978/Singularity" class="text-ellipsis"> Singularity</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">25</a><img alt="GODSENT" src="https://static.hltv.org/images/team/logo/6902" class="teamImg" title="GODSENT"><a href="/team/6902/GODSENT" class="text-ellipsis"> GODSENT</a></div>',

// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">26</a><img alt="EnVyUs" src="https://static.hltv.org/images/team/logo/5991" class="teamImg" title="EnVyUs"><a href="/team/5991/EnVyUs" class="text-ellipsis"> EnVyUs</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">27</a><img alt="Tricked" src="https://static.hltv.org/images/team/logo/4602" class="teamImg" title="Tricked"><a href="/team/4602/Tricked" class="text-ellipsis"> Tricked</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">28</a><img alt="Luminosity" src="https://static.hltv.org/images/team/logo/6290" class="teamImg" title="Luminosity"><a href="/team/6290/Luminosity" class="text-ellipsis"> Luminosity</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">29</a><img alt="NRG" src="https://static.hltv.org/images/team/logo/6673" class="teamImg" title="NRG"><a href="/team/6673/NRG" class="text-ellipsis"> NRG</a></div>',
// 	'<div class="col-box rank"><a href="/ranking/teams" class="rankNum">30</a><img alt="Space Soldiers" src="https://static.hltv.org/images/team/logo/5929" class="teamImg" title="Space Soldiers"><a href="/team/5929/Space-Soldiers" class="text-ellipsis"> Space Soldiers</a></div>'
// 	];

init();
