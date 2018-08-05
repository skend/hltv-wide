function init() {
	var ranking;
	// var width;
	var useColors;
	var setBoxes;
	var commentPages;

	var results = browser.storage.sync.get();
	results.then(function(item) {
		ranking = item.ranking;
		// width = item.width;
    	useColors = item.colors;
		setBoxes = item.switchBoxes;
		commentPages = item.commentPages;
	}, function() {
	    ranking = 10;
	    // width = '1400';
	    useColors = false;
		setBoxes = false;
		commentPages = false;
	});

    if (ranking == undefined) {
    	// width = '1400';
		ranking = 10;
		useColors = false;
		setBoxes = false;
		commentPages = false;
	}

	if (commentPages) {
		pageComments();
	}

	insertUsernameIntoNavbar();

	foldComments();
	var url = document.URL;

	// *vomits*
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

	// injectCSS(width);
	injectCSS();
	
	// var logo_big = document.getElementsByClassName('teamlogo');

	// if (logo_big.length > 0) {
	// 	if (logo_big.src == "https://static.hltv.org/images/team/logo/1043" ||
	// 		logo_big.src == "/img/static/event/logo/noLogo.png") {
	// 		logo_big = logo_big[0];
	// 		logo_big.style.cssText += "display: none;";
	// 	}
	// }

	// var logos = document.getElementsByClassName('team-logo');
	// if (logos.length > 0) {
	// 	for (let logo of logos) {
	// 		if (logo.src == "https://static.hltv.org/images/team/logo/1043" ||
	// 			logo.src == "/img/static/event/logo/noLogo.png") {
	// 			logo.style.cssText += "display: none;";
	// 		}
	// 	}
	// }
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
	}
}

function swapNodes(a, b) {
    var aparent = a.parentNode;
    var asibling = a.nextSibling === b ? a : a.nextSibling;
    b.parentNode.insertBefore(a, b);
    aparent.insertBefore(b, asibling);
}

function injectCSS() {
	var cookie = browser.cookies.get({
		name: "nightmode"
	});

	var body = document.getElementsByTagName('body')[0];

	cookie.then(function (value) {
		if (value == 'on') {
			body.style.background = "#1b1f23 !important"
		}
	});
}

function editRankingShort(number) {
	var container = $('.col-box-con')[1];

	for (var i = 0; i < number - 5; i++) {
		$(container).append(ranks[i]);
	}
}

// This function should only be called once on page load.
function pageComments() {
	var forum = document.getElementsByClassName('forum');
	var comments;

	if (forum.length == 0) return;
	else {
		forum = forum[0];
		comments = [].slice.call(forum.children);
		comments = comments.slice(0, comments.length - 4);
	}

	var numComments = comments.length;

	var safeHTML = Sanitizer.createSafeHTML`<div class="page-btns" style="float: right;">
												<div class="page-btn" id="first-page" onclick="firstPage()" style="width: 75px; height:30px;display: inline-block;border: 1px solid #cccccc;background-color: #f6f6f9;text-align: center;line-height: 30px;font-size: 12px;">First Page</div>
												<div class="page-btn" id="previous-page" onclick="previousPage()" style="width: 100px; height:30px;display: inline-block;border: 1px solid #cccccc;background-color: #f6f6f9;text-align: center;line-height: 30px;font-size: 12px;">Previous Page</div>
												<div class="page-btn" id="next-page" onclick="nextPage()" style="width: 75px; height:30px;display: inline-block;border: 1px solid #cccccc;background-color: #f6f6f9;text-align: center;line-height: 30px;font-size: 12px;">Next Page</div>
												<div class="page-btn" id="last-page" onclick="lastPage()" style="width: 75px; height:30px;display: inline-block;border: 1px solid #cccccc;background-color: #f6f6f9;text-align: center;line-height: 30px;font-size: 12px;">Last Page</div>
											</div>`;
	var node = document.getElementsByClassName('newreply-spacer')[0];
	node.insertAdjacentHTML('beforebegin', Sanitizer.unwrapSafeHTML(safeHTML));

	// insert onClick methods?
	safeHTML = Sanitizer.createSafeHTML`<script>
											var forum = document.getElementsByClassName('forum')[0];
											var numComments = forum.children.length - 4;
											var commentsPerPage = 20;
											var hash = window.location.hash;
											var currentPageNum = 0;

											if (hash.length > 0) {
												currentPageNum = hash.substring(6, hash.length) - 1;
											}
											else {
												window.location.hash = 'page-1';
												currentPageNum = 0;
											}

											function firstPage() {
												window.history.pushState({ page: "first-page" }, "", "#page-1");
												showComments(0);
											}

											function previousPage() {
												var newPageNum = currentPageNum - 1;
												window.history.pushState({ page: "page"+newPageNum }, "", "#page-"+newPageNum);
												showComments(newPageNum);
											}

											function nextPage() {
												var newPageNum = currentPageNum + 1;
												window.history.pushState({ page: "page" + newPageNum }, "", "#page-" + newPageNum);
												showComments(newPageNum);
											}

											function lastPage() {
												var newPageNum = int(numComments / commentsPerPage) + 1;
												window.history.pushState({ page: "page" + newPageNum }, "", "#page-" + newPageNum);
												showLastNComments(numComments % commentsPerPage);
											}

											function showLastNComments(N) {
												var i = 0;
												while (i < numComments - N) {
													forum.children[i].style.display = 'none';
													i++;
												}

												var j = i;
												while (j < N) {
													forum.children[j].style.display = 'block';
													j++;
												}
											}

											function showCommentsByPage(pageNum) {
												commentsPerPage *= 2;
												var start = pageNum * commentsPerPage;
												var i = 0;
												while (i < start) {
													forum.children[i].style.display = 'none';
													i++;
												}

												for (var j = i; j < commentsPerPage; j++) {
													forum.children[j].style.display = 'block';

													if (j == numComments) return;
												}

												i = i + commentsPerPage;
												while (i < numComments) {
													forum.children[i].style.display = 'none';
													i++;
												}
											}
										</script>`;
	node = document.getElementsByClassName('contentCol')[0];
	node.insertAdjacentHTML('beforebegin', Sanitizer.unwrapSafeHTML(safeHTML));

	var hash = window.location.hash;
	var pageNum = 0;

	if (hash.length > 0) {
		pageNum = hash.substring(6, hash.length) - 1;
	}
	else {
		window.location.hash = 'page-1';
		pageNum = 0;
	}
	
	// show correct comments
	var commentsPerPage = 20;
	var start = pageNum * commentsPerPage;
	var i = 0;
	while (i < start) {
		forum.children[i].style.display = 'none';
		i++;
	}

	for (var j = i; j < commentsPerPage; j++) {
		forum.children[j].style.display = 'block';

		if (j == numComments) return;
	}

	i = i + commentsPerPage;
	while (i < numComments) {
		forum.children[i].style.display = 'none';
		i++;
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

var page = 0;
init();
