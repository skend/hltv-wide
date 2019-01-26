function init() {
  chrome.storage.sync.get(null, function (items) {
    var ranking = items.ranking;
    var width = items.width;
    var useColors = items.colors;
    var setBoxes = items.switchBoxes;
    var commentPages = items.commentPages;
    var lastRankingUpdate = items.lastRankingUpdate;
    var blockUsers = items.blockUsers;
    var blockedUsers = items.blockedUsers;
    var teams = items.teams
    var hideMales = items.hideMales
    var hideFemales = items.hideFemales
    var hideCasters = items.hideCasters
    var hideOthers = items.hideOthers;

    if (teams == undefined || teams.ranking != null) {
      teams = getRanking(ranking)
    }

    if (width == undefined || ranking == undefined) {
      resetOptions()
    }

    determineLayout({
      ranking: ranking, teams: teams, width: width, useColors: useColors, setBoxes: setBoxes,
      commentPages: commentPages, lastRankingUpdate: lastRankingUpdate, blockUsers: blockUsers,
      blockedUsers: blockedUsers, hideMales: hideMales, hideFemales: hideFemales, hideCasters: hideCasters,
      hideOthers: hideOthers
    });
  });
}

function resetOptions() {
  width = '1400';
  ranking = 10;
  useColors = false;
  setBoxes = false;
  commentPages = false;
  lastRankingUpdate = 'default';
  blockUsers = false;
  hideMales = false
  hideFemales = false
  hideCasters = false
  hideOthers = false
  blockedUsers = [];

  chrome.storage.sync.set({
    'ranking': ranking,
    'teams': teams,
    'width': width,
    'colors': useColors,
    'switchBoxes': setBoxes,
    'commentPages': commentPages,
    'lastRankingUpdate': lastRankingUpdate,
    'blockUsers': blockUsers,
    'blockedUsers': blockedUsers,
    'hideMales': hideMales,
    'hideFemales': hideFemales,
    'hideCasters': hideCasters,
    'hideOthers': hideOthers
  });
}

function determineLayout(options) {
  injectCSS(options.width);

  if (options.blockedUsers == undefined) options.blockedUsers = [];

  window.addEventListener("DOMContentLoaded", function () {
    if (options.commentPages) {
      pageComments();
    }

    insertUsernameIntoNavbar();
    foldComments();
    var url = document.URL;

    // update the ranking
    if (url == "https://www.hltv.org/" || url.startsWith("https://www.hltv.org/forums")) {
      let rankingTimestamp = document.getElementsByClassName('col-box-con')[1].nextElementSibling.children[2].innerText;
      if (options.lastRankingUpdate != rankingTimestamp) {
        var teams = getRanking(options.ranking);

        chrome.storage.sync.set({
          'lastRankingUpdate': rankingTimestamp,
          'teams': teams
        });

        displayRanking(options.ranking)
      }
      else {
        displayRanking(options.ranking);
      }
    }

    if (options.useColors) {
      useColorsOnMatches();
    }

    if (url == 'https://www.hltv.org/') {
      if (options.setBoxes)
        switchReplaysAndStreams();
    }

    if (options.commentPages) {
      var replyBox = document.getElementsByClassName('newreply-con')[0];
      replyBox.style.top = '40px';
      replyBox.style.paddingBottom = '40px';

      let regex = /(#r[0-9])\w+/g
      if (url.match(regex)) {
        document.getElementsByClassName('forumthread')[0].style.paddingTop = '37px';
      }
    }

    if (options.blockUsers) {
      // insert block buttons
      var reportButtons = document.getElementsByClassName('report-button');
      for (var i = 0; i < reportButtons.length; i++) {
        var poster = reportButtons[i].parentElement.parentElement.firstElementChild.lastElementChild.href;
        if (options.blockedUsers.includes(poster)) {
          reportButtons[i].insertAdjacentHTML('afterend',
            '<div class="unblock-button a-default"><i class="fa fa-unblock"></i> Unblock</div>')
        }
        else {
          reportButtons[i].insertAdjacentHTML('afterend',
            '<div class="block-button a-default"><i class="fa fa-block"></i> Block</div>')
        }
      }

      $('.block-button').click(function () {
        block(this);
      })

      $('.unblock-button').click(function () {
        block(this);
      })

      var authors = document.getElementsByClassName('authorAnchor')
      for (var i = 1; i < authors.length; i++) {
        if (options.blockedUsers.includes(authors[i].href)) {
          authors[i].parentElement.firstElementChild.click()
        }
      }
    }

    var streamerOptions = {
      hideMales: options.hideMales, hideFemales: options.hideFemales,
      hideCasters: options.hideCasters, hideOthers: options.hideOthers
    }
    hideStreamers(streamerOptions)

    var nightMode = document.getElementsByClassName("right slider")[0]
    nightMode.addEventListener("click", function () {
      if (options.useColors) {
        useColorsOnMatches();
      }
    })
  });
}

function block(button) {
  if (button.innerText == ' Block') {
    blockUser(button);
  }
  else {
    unblockUser(button);
  }
}

function changeBlockButton(button) {
  button.className = 'unblock-button a-default';
  button.innerHTML = '<i class="fa fa-unblock"></i> Unblock';
}

function blockUser(blockButton) {
  var userProfile = blockButton.parentElement.parentElement.firstElementChild.lastElementChild.href;

  console.log('block ' + userProfile)

  var authors = document.getElementsByClassName('authorAnchor')
  for (var i = 1; i < authors.length; i++) {
    if (authors[i].href == userProfile) {
      changeBlockButton(authors[i].parentElement.parentElement.lastElementChild.children[2]);
      authors[i].parentElement.firstElementChild.click()
    }
  }

  chrome.storage.sync.get(null, function (items) {
    var blockedUsers = items.blockedUsers;

    if (blockedUsers == undefined)
      blockedUsers = [];

    if (blockedUsers.includes(userProfile)) return;

    blockedUsers.push(userProfile);

    chrome.storage.sync.set({
      'blockedUsers': blockedUsers
    });

    console.log(blockedUsers)
  });
}

function changeUnblockButton(button) {
  button.className = 'block-button a-default';
  button.innerHTML = '<i class="fa fa-block"></i> Block';
}

function unblockUser(unblockButton) {
  var userProfile = unblockButton.parentElement.parentElement.firstElementChild.lastElementChild.href;

  console.log('unblock ' + userProfile)

  var authors = document.getElementsByClassName('authorAnchor')
  for (var i = 1; i < authors.length; i++) {
    if (authors[i].href == userProfile) {
      changeUnblockButton(authors[i].parentElement.parentElement.lastElementChild.children[2]);
      authors[i].parentElement.firstElementChild.click()
    }
  }

  chrome.storage.sync.get(null, function (items) {
    var blockedUsers = items.blockedUsers;

    if (blockedUsers == undefined) {
      console.log('no block list found?');
      return;
    }

    if (blockedUsers.includes(userProfile)) {
      var index = blockedUsers.indexOf(userProfile);
      if (index > -1) {
        blockedUsers.splice(index, 1);
      }

      chrome.storage.sync.set({
        'blockedUsers': blockedUsers
      });

      console.log(blockedUsers)
    }
    else {
      console.log('user not found on block list')
      return;
    }
  });
}

// streamerOptions {caster : true, player : false, etc}
function hideStreamers(streamerOptions) {
  var streamers = document.getElementsByClassName('streamer')
  for (var i = 0; i < streamers.length; i++) {
    var current = undefined
    if (i % 2 == 0) {
      current = streamers[i].firstChild.firstChild.src
    }
    else {
      current = streamers[i].firstChild.src
    }

    if (current.indexOf("caster") > 0 && streamerOptions.hideCasters) {
      streamers[i].style.cssText += "display: none"
    }
    else if (current.indexOf("player") > 0 && streamerOptions.hideMales) {
      streamers[i].style.cssText += "display: none"
    }
    else if (current.indexOf("female") > 0 && streamerOptions.hideFemales) {
      streamers[i].style.cssText += "display: none"
    }
    else if (current.indexOf("mod_csgo.png") > 0 && streamerOptions.hideOthers) {
      streamers[i].style.cssText += "display: none"
    }
  }
}

function displayRanking(ranking) {
  // retrieve the ranking
  chrome.storage.sync.get(null, function (items) {
    var teams = items.teams

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

// This function should only be called once on page load.
function pageComments() {
  var forum = document.getElementsByClassName('forum');

  if (forum.length == 0) return;
  else {
    forum = forum[0];
  }

  for (var i = 0; i < forum.children.length; i += 2) {
    if (forum.children[i].id.startsWith('r')) {
      comments.push({ parent: forum.children[i], children: forum.children[i + 1] });
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
  var start = (pageNum - 1) * commentsPerPage;
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
    var sub1 = str.substring(0, str.lastIndexOf('</span>') + 7)
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
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="stylesheet" type="text/css" href="' +
    chrome.runtime.getURL("styles/style" + width + ".css") + '">'
  );
}

function getRanking(number) {
  console.log("Grab team ranking")
  var teams = new Array()
  $.get("https://www.hltv.org/ranking/teams/", function (response) {
    var list = $(response).find('.ranked-team.standard-box');
    for (var i = 0; i < 30; i++) {
      var elem = list[i].children[0].children[0];
      let name = elem.children[2].innerText;
      let id = elem.children[1].children[0].src.slice(-4);
      name = name.substring(25, name.indexOf('('))

      let entry = { 'id': id, 'name': name }
      teams.push(entry);
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
  if (teams == undefined) return

  var container = $('.col-box-con')[1];
  for (var i = 5; i < number; i++) {
    var rankBox = '<div class="col-box rank"><a href="/ranking/teams" class="rankNum">' + (i + 1) +
      '.</a><img alt="' + teams[i].name + '" src="https://static.hltv.org/images/team/logo/' + teams[i].id +
      '" class="teamImg" title="' + teams[i].name + '"><a href="/team/' + teams[i].id + '/' + teams[i].name + '" class="text-ellipsis"> ' + teams[i].name + '</a></div>';
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

  $('.threading').each(function () {
    if (!($(this).hasClass('newReplyBox'))) {
      if ((this.parentElement).className == 'threading') {
        var box = this.parentElement.children[0].children[0].children;
        addMinus(box[0]);

        box = this.firstElementChild.firstElementChild.children;
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
    anchor.addEventListener('click', function () {
      hideUnhide(anchor);
    });

    element.prepend(anchor);
  }
}

// Edit matches column to colour ones with X number of stars
function useColorsOnMatches() {
  var nightmode = document.getElementById("popupsettings").children[3].children[1].firstChild.classList.contains("selected")

  if (nightmode) {
    var colors = getNightmodeMatchColors()
    changeMatchBoxColor(colors, nightmode)
  }
  else {
    var colors = getLightmodeMatchColors()
    changeMatchBoxColor(colors, nightmode)
  }
}

function changeMatchBoxColor(colors, nightmode) {
  var topColors = colors.topColors
  var bottomColors = colors.bottomColors
  var textColors = colors.textColors
  var hoverColors = colors.hoverColors

  for (i = 0; i < 5; i++) {
    var className = 'star' + (i + 1)
    $('.' + className).each(function () {
      setBackgroundColor($(this)[0], topColors[i], bottomColors[i]);
    });
    if (nightmode) changeMatchTextColor(className, textColors[i], hoverColors[i])
  }
}

function changeMatchTextColor(className, color, hoverColor) {
  $('.' + className + ' .teamrow').each(function () {
    $(this)[0].style.cssText += "color: " + color + "!important"
  })
  $('.' + className + ' .middleExtra').each(function () {
    $(this)[0].style.cssText += "color: " + color + "!important"
  })
  pseudoStyle(className + "-filter", "before", "color", color)
  pseudoStyle(className + " .teamrow", "hover", "color", hoverColor)
}

function pseudoStyle(_class, element, prop, value) {
  var _sheetId = "pseudoStyles";
  var _head = document.head || document.getElementsByTagName('head')[0];
  var _sheet = document.getElementById(_sheetId) || document.createElement('style');
  _sheet.id = _sheetId;
  _sheet.innerHTML += " ." + _class + ":" + element + "{" + prop + ":" + value + "}";
  _head.appendChild(_sheet);
  return this;
};

function setBackgroundColor(element, topColor, bottomColor) {
  element.parentElement.style.backgroundImage = "linear-gradient(to bottom right, " + topColor + ", " + bottomColor + ")"
}

function getLightmodeMatchColors() {
  return {
    topColors: ['#f0f8ff', '#eef9ef', '#eae8fd', '#f9e3d4', '#fffbdf'],
    bottomColors: ['#e0f0ff', '#dcf4dd', '#d9d6fc', '#f1c9af', '#efe081'],
  }
}

function getNightmodeMatchColors() {
  return {
    topColors: ['#17538c', '#0d8261', '#601aad', '#ff733d', '#eac820'],
    bottomColors: ['#144573', '#0b6f53', '#4e138e', '#af4820', '#b19716'],
    textColors: ['#87a3bf', '#b5c2d0', '#87a3bf', '#b5c2d0', '#383333'],
    hoverColors: ['#9fb9d4', '', '#9fb9d4', '', '#676767']
  }
}

var commentsPerPage = 15;
var currentPageNum = 1;
var comments = [];
var lastComment = false;

init();