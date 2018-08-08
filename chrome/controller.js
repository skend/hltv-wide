function init() {
	var ranking;
	var width;
	var useColors;
	var setBoxes;
	var commentPages;
	var blockUsers;

	chrome.storage.sync.get(null, function(items) {
    	ranking = items.ranking;
    	width = items.width;
    	useColors = items.colors;
		setBoxes = items.switchBoxes;
		commentPages = items.commentPages;
		lastRankingUpdate = items.lastRankingUpdate;
		blockUsers = items.blockUsers;

		if (width == undefined || ranking == undefined) {
			width = '1400';
			ranking = 10;
			useColors = false;
			setBoxes = false;
			commentPages = false;
			lastRankingUpdate = 'default';
			blockUsers = false;

			chrome.storage.sync.set({
				'ranking': ranking,
				'width': width,
				'colors': useColors,
				'switchBoxes': setBoxes,
				'commentPages': commentPages,
				'lastRankingUpdate': lastRankingUpdate,
				'blockUsers': blockUsers
			});
		}

		determineLayout(ranking, width, useColors, setBoxes, commentPages, lastRankingUpdate, blockUsers);
	  });
}

function determineLayout(ranking, width, useColors, setBoxes, commentPages, lastRankingUpdate, blockUsers) {
	injectCSS(width);

	window.addEventListener("DOMContentLoaded", function() {
		if (commentPages) {
			pageComments();
		}

		insertUsernameIntoNavbar();
		foldComments();
		var url = document.URL;
		
		// update the ranking
		let rankingTimestamp = document.getElementsByClassName('col-box-con')[1].nextElementSibling.children[2].innerText;
		if (lastRankingUpdate != rankingTimestamp) {		
			getRanking(ranking);

			chrome.storage.sync.set({
				'lastRankingUpdate': rankingTimestamp
			});
		}
		else {
			displayRanking(ranking);
		}

		if (useColors) {
			useColorsOnMatches();
		}

		if (url == 'https://www.hltv.org/') {
			if (setBoxes)
				switchReplaysAndStreams();

			var logo = document.getElementsByClassName('event-coverage-logo')[0];
			var buttons = document.getElementsByClassName('event-coverage-hub-link');
			if (logo != undefined && buttons != undefined)
				adjustCoverageHub(width, logo, buttons);
		}

		if (commentPages) {
			var replyBox = document.getElementsByClassName('newreply-con')[0];
			replyBox.style.top = '40px';
			replyBox.style.paddingBottom = '40px';

			let regex = /(#r[0-9])\w+/g
			if (url.match(regex)) {
				document.getElementsByClassName('forumthread')[0].style.paddingTop = '37px';
			}
		}

		if (blockUsers) {
			// insert block buttons
			var reportButtons = document.getElementsByClassName('report-button');
			for (var i = 0; i < reportButtons.length; i++) {
				reportButtons[i].insertAdjacentHTML('afterend',
					'<div class="block-button a-default"><i class="fa fa-block"></i> Block</div>')
			}

			$('.block-button').click(function () {
				blockUser(this);
			})
		}
		
	});
}

function blockUser(blockButton) {
	var userProfile = blockButton.parentElement.parentElement.firstElementChild.lastElementChild.href;
	console.log(userProfile);
}

function displayRanking(ranking) {
	// retrieve the ranking
	chrome.storage.sync.get(null, function (items) {
		teams = items.teams;
		var url = document.URL;
		// display the ranking
		if (!(url.startsWith('https://www.hltv.org/matches') ||
			url.startsWith('https://www.hltv.org/events') ||
			url.startsWith('https://www.hltv.org/ranking/teams') ||
			url.startsWith('https://www.hltv.org/results') ||
			url.startsWith('https://www.hltv.org/stats') ||
			url.startsWith('https://www.hltv.org/galleries'))) {

			editRanking(ranking, teams);
		}
	});
}

function adjustCoverageHub(width, logo, buttons) {
	// more disgusting switch statements ayy lmao
	switch (width) {
		case '1000':
			logo.firstChild.firstChild.style.width = '100px';

			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.fontSize = '14px';
				buttons[i].firstChild.style.padding = '2px 18px';
			}

			break;
		case '1100':
			logo.firstChild.firstChild.style.width = '111px';

			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.fontSize = '15px';
				buttons[i].firstChild.style.padding = '2px 21px';
			}

			break;
		case '1200':
			logo.firstChild.firstChild.style.width = '122px';

			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.fontSize = '16px';
				buttons[i].firstChild.style.padding = '2px 24px';
			}
			
			break;
		case '1300':
			logo.firstChild.firstChild.style.width = '133px';

			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.fontSize = '17px';
				buttons[i].firstChild.style.padding = '2px 27px';
			}
			
			break;
		case '1400':
			logo.firstChild.firstChild.style.width = '144px';

			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.fontSize = '18px';
				buttons[i].firstChild.style.padding = '2px 30px';
			}

			break;
		case '1500':
		case '1600':
		case '1700':
		case '1800':
			logo.firstChild.firstChild.style.width = '155px';

			for (var i = 0; i < buttons.length; i++) {
				buttons[i].style.fontSize = '19px';
				buttons[i].firstChild.style.padding = '2px 33px';
			}

			break;
		default:
			console.log('Error regarding width. Width = ' + width);
	}
}

// This function should only be called once on page load.
function pageComments() {
	var forum = document.getElementsByClassName('forum');

	if (forum.length == 0) return;
	else {
		forum = forum[0];
	}

	for (var i = 0; i < forum.children.length; i+=2) {
		if (forum.children[i].id.startsWith('r')) {
			comments.push({ parent: forum.children[i], children: forum.children[i+1] });
		}
	}

	var htmlToInject = `<div class="page-btns" style="float: right;">
							<div class="page-btn" id="first-page">First Page</div>
							<div class="page-btn" id="previous-page">Previous Page</div>
							<div class="page-btn" id="next-page">Next Page</div>
							<div class="page-btn" id="last-page">Last Page</div>
						</div>`;
	var node = document.getElementsByClassName('newreply-spacer')[0];
	node.insertAdjacentHTML('beforebegin', htmlToInject);

	document.getElementById("first-page").addEventListener("click", firstPage);
	document.getElementById("previous-page").addEventListener("click", previousPage);
	document.getElementById("next-page").addEventListener("click", nextPage);
	document.getElementById("last-page").addEventListener("click", lastPage);

	var hash = window.location.hash;
	var pageNum = 0;
	var reg = /^#r\d+$/;
	var focusElementIndex;

	if (hash.length > 0) {
		if (reg.test(hash)) {
			return;
		}
		else pageNum = hash.substring(6, hash.length) - 1;
	}
	else {
		window.location.hash = 'page-1';
		pageNum = 0;
	}

	currentPageNum = pageNum;

	// show correct comments
	var start = currentPageNum * commentsPerPage;
	var i = 0;
	while (i < start) {
		comments[i].parent.style.display = 'none';
		comments[i].children.style.display = 'none';
		i++;
	}

	for (var j = i; j < commentsPerPage; j++) {
		comments[j].parent.style.display = 'block';
		comments[j].children.style.display = 'block';

		if (j == comments.length) return;
	}

	i = i + commentsPerPage;
	while (i < comments.length) {
		comments[i].parent.style.display = 'none';
		comments[i].children.style.display = 'none';

		i++;
	}
}

function firstPage() {
	if (currentPageNum == 1) return;
	lastComment = false;

	currentPageNum = 1;
	window.history.pushState({ page: "first-page" }, "", "#page-1");
	window.location.hash = 'page-1'
	showCommentsByPage(0);
}

function previousPage() {
	if (currentPageNum == 1) return;
	lastComment = false;

	var newPageNum = currentPageNum - 1;
	window.history.pushState({ page: "page" + newPageNum }, "", "#page-" + newPageNum);
	window.location.hash = 'page-' + newPageNum;
	currentPageNum = newPageNum;
	showCommentsByPage(newPageNum);
}

function nextPage() {
	if (lastComment) return;

	if (currentPageNum == 0) currentPageNum = 1;

	var newPageNum = currentPageNum + 1;
	window.history.pushState({ page: "page" + newPageNum }, "", "#page-" + newPageNum);
	window.location.hash = 'page-' + newPageNum;
	currentPageNum = newPageNum;
	showCommentsByPage(newPageNum);
}

function lastPage() {
	var forum = document.getElementsByClassName('forum')[0];
	var comments = forum.children;
	var numParentComments = 0;
	for (var i = 0; i < comments.length; i++) {
		if (comments[i].className == 'post ') {
			numParentComments++;
		}
	}

	var newPageNum = Math.floor(numParentComments / commentsPerPage) + 1;
	if (newPageNum < 1) newPageNum = 1;
	if (numParentComments % 15 == 0 && numComments > 0) newPageNum -= 1;

	window.history.pushState({ page: "page" + newPageNum }, "", "#page-" + newPageNum);
	window.location.hash = 'page-' + newPageNum;
	currentPageNum = newPageNum;

	showCommentsByPage(newPageNum);
}

function showCommentsByPage(pageNum) {
	var numComments = comments.length;
	var start = (pageNum-1) * commentsPerPage;
	var i = 0, j = 0;

	while (i < start) {
		comments[i].parent.style.display = 'none';
		comments[i].children.style.display = 'none';
		i++;
	}

	comments[i].parent.style.display = 'block';
	comments[i].parent.scrollIntoView();
	for (j = i; j < i + commentsPerPage; j++) {
		if (j == numComments - 1) {
			lastComment = true;
			return;
		}

		comments[j].parent.style.display = 'block';
		comments[j].children.style.display = 'block';
	}

	i = i + commentsPerPage;
	while (i < numComments) {
		comments[i].parent.style.display = 'none';
		comments[i].children.style.display = 'none';
		i++;
	}
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
	switch (width) {
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

function getRanking(number) {
	$.get("https://www.hltv.org/ranking/teams/", function(response) {
		var teams = {};
		var ranking = [];
		teams.ranking = ranking;

	    var list = $(response).find('.ranked-team.standard-box');
		for (var i = 0; i < 30; i++) {
			var elem = list[i].children[0].children[0];
			let name = elem.children[2].innerText;
			let id = elem.children[1].children[0].src.slice(-4);

			let entry = {'id': id, 'name': name}
			teams.ranking.push(entry);
		}

		chrome.storage.sync.set({
			'teams': teams
		},
		function () {
			displayRanking(number);
		});

		return teams;
	});
}

function editRanking(number, teams) {
	var container = $('.col-box-con')[1];
	for (var i = 5; i < number; i++) {
		var rankBox = '<div class="col-box rank"><a href="/ranking/teams" class="rankNum">' + (i + 1) +
			'.</a><img alt="' + teams.ranking[i].name + '" src="https://static.hltv.org/images/team/logo/' + teams.ranking[i].id +
			'" class="teamImg" title="' + teams.ranking[i].name + '"><a href="/team/' + teams.ranking[i].id + '/' + teams.ranking[i].name + '" class="text-ellipsis"> ' + teams.ranking[i].name + '</a></div>';
		$(container).append(rankBox);
	}
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

var commentsPerPage = 15;
var currentPageNum = 1;
var comments = [];
var lastComment = false;

init();