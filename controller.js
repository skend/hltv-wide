function init() {
	var ranking;
	var width;
	var useColors;

	chrome.storage.sync.get(null, function(items) {
    	ranking = items.ranking;
    	width = items.width;
    	useColors = items.colors;

    	determineLayout(ranking, width, useColors);
  	});
}

function determineLayout(ranking, width, useColors) {
	injectCSS(width);

	window.addEventListener("DOMContentLoaded", function() {
		insertUsernameIntoNavbar();
		foldComments();
		editRanking(ranking);

		if (useColors) {
			useColorsOnMatches();
		}
	});
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
	}
}

// Change the number of teams displayed on the rankings
function editRanking(number) {
	var teamList = [];
	var teamIdList = [];
	var ranking = $('.leftCol')[0].children[3];
	var container = $('.col-box-con')[1];

	$.get("https://www.hltv.org/ranking/teams/", function(response) {
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
		'#f2dddc',
		'#efe8d0'
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

init();
