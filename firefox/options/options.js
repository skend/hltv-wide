// Saves options to chrome.storage
function save_options() {
  var ranking = document.getElementById('ranking').value;
  var width = document.getElementById('width').value;
  var colors = document.getElementById('star').checked;
  var switchBoxes = document.getElementById('switch').checked;
  var set = browser.storage.sync.set({
    'ranking': ranking,
    'width': width,
    'colors': colors,
    'switchBoxes': switchBoxes
  });

  set.then(function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  }, null);
}

function reset_options() {
  setRanking(10);
  setWidth('1400');
  setColors(false);
  setBoxes(false);

  browser.storage.sync.set({
    'ranking': 10,
    'width': '1400',
    'colors': false,
    'switchBoxes': false
  });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  var ranking = browser.storage.sync.get();
  ranking.then(function(item) {
    setRanking(item.ranking);
    setWidth(item.width);
    setColors(item.colors);
    setBoxes(item.switchBoxes);
  }, function() {
    setRanking(10);
    setWidth('1400');
    setColors(false);
    setBoxes(false);
  })
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
