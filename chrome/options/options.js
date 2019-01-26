// Saves options to chrome.storage
function save_options() {
  var ranking = document.getElementById('ranking').value;
  var width = document.getElementById('width').value;
  var colors = document.getElementById('star').checked;
  var switchBoxes = document.getElementById('switch').checked;
  var commentPages = document.getElementById('pages').checked;
  var blockUsers = document.getElementById('block').checked;
  var hideMales = document.getElementById('stream_males').checked;
  var hideFemales = document.getElementById('stream_females').checked;
  var hideCasters = document.getElementById('stream_casters').checked;
  var hideOthers = document.getElementById('stream_others').checked;

  chrome.storage.sync.set({
    'ranking': ranking,
    'width': width,
    'colors': colors,
    'switchBoxes': switchBoxes,
    'commentPages': commentPages,
    'blockUsers': blockUsers,
    'hideMales': hideMales,
    'hideFemales': hideFemales,
    'hideCasters': hideCasters,
    'hideOthers': hideOthers
  }, 
  function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.style.color = '#d3d3d3';
    setTimeout(function() {
      status.style.color = '#ffffff';
    }, 1000);
  });
}

function reset_options() {
  setRanking(10);
  setWidth('1400');
  setColors(false);
  setBoxes(false);
  setCommentPages(false);
  setBlockUsers(false);
  setHideMales(false)
  setHideFemales(false)
  setHideCasters(false)
  setHideOthers(false)

  chrome.storage.sync.set({
    'ranking': 10,
    'width': '1400',
    'colors': false,
    'switchBoxes': false,
    'commentPages': false,
    'blockUsers': false,
    'hideMales': false,
    'hideFemales': false,
    'hideCasters': false,
    'hideOthers': false
  });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get('ranking', function(response) {
    if (response.ranking == undefined) {
      setRanking(10);
      setWidth('1400');
      setColors(false);
      setBoxes(false);
      setCommentPages(false);
      setBlockUsers(false);
      setHideMales(false)
      setHideFemales(false)
      setHideCasters(false)
      setHideOthers(false)
      save_options();
    }
    else setRanking(response.ranking);
  });

  chrome.storage.sync.get('width', function(response) {
    setWidth(response.width);
  });

  chrome.storage.sync.get('colors', function(response) {
    setColors(response.colors);
  });

  chrome.storage.sync.get('switchBoxes', function(response) {
    setBoxes(response.switchBoxes);
  });

  chrome.storage.sync.get('commentPages', function (response) {
    setCommentPages(response.commentPages);
  });

  chrome.storage.sync.get('blockUsers', function (response) {
    setBlockUsers(response.blockUsers);
  });

  chrome.storage.sync.get('hideMales', function (response) {
    setHideMales(response.hideMales);
  });

  chrome.storage.sync.get('hideFemales', function (response) {
    setHideFemales(response.hideFemales);
  });

  chrome.storage.sync.get('hideCasters', function (response) {
    setHideCasters(response.hideCasters);
  });

  chrome.storage.sync.get('hideOthers', function (response) {
    setHideOthers(response.hideOthers);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementsByClassName('btn')[0].addEventListener('click', save_options);
document.getElementsByClassName('reset')[0].addEventListener('click', reset_options);

document.getElementById('ranking').addEventListener('change', function() {
  document.getElementById('rankingNumber').value = this.value; 
});
document.getElementById('width').addEventListener('change', function() {
  document.getElementById('widthNumber').value = this.value;
});

function setRanking(num) {
  document.getElementById('ranking').value = num;
  document.getElementById('rankingNumber').value = num;
}

function setWidth(num) {
  if (num == undefined) {
    document.getElementById('width').value = 1400;
    document.getElementById('widthNumber').value = 1400;
  }
  else {
    document.getElementById('width').value = num;
    document.getElementById('widthNumber').value = num;
  }
}

function setColors(bool) {
  document.getElementById('star').checked = bool;
}

function setBoxes(bool) {
  document.getElementById('switch').checked = bool;
}

function setCommentPages(bool) {
  document.getElementById('pages').checked = bool;
}

function setBlockUsers(bool) {
  document.getElementById('block').checked = bool;
}

function setHideMales(bool) {
  document.getElementById('stream_males').checked = bool;
}

function setHideFemales(bool) {
  document.getElementById('stream_females').checked = bool;
}

function setHideCasters(bool) {
  document.getElementById('stream_casters').checked = bool;
}

function setHideOthers(bool) {
  document.getElementById('stream_others').checked = bool;
}