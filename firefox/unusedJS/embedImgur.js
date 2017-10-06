/* 
	no longer needed since hltv pro does this all way better than me :D 
	keeping it just incase hltv.pro ever dies [*]
*/


var forumMiddle = $('.forum-middle');

for (var i = 0; i < forumMiddle.length; i++) {
	var id, anchor;

	$(forumMiddle[i]).find('a[href*="imgur.com"]').each(function() {
		if (this.href.indexOf('imgur.com/a/') == -1) {
			anchor = this;
			id = this.href.substr(19, this.href.length);
			var singleImage = false;

			var iframe = document.createElement('iframe');
			// one image
			var checkForExtension = id.indexOf('.');
			if (checkForExtension != -1) {
				id = id.substr(0, checkForExtension);
				iframe.src = 'https://imgur.com/' + id + '/embed';
				singleImage = true;
			}
			if (id.charAt(0) == '/') {
				id = id.substr(1, id.length);
			}
			
			if (!singleImage) {
				console.log('album spotted :^)');
				// can be /a/fdfds or /gallery/fdfds
				// embed code is the same i believe
				return;
			}

			iframe.frameBorder = 0;
			iframe.scrolling = "no";
			iframe.style = 'display: block;';
			iframe.id = id;
			anchor.parentElement.appendChild(iframe);
			anchor.remove();

			var url = 'https://api.imgur.com/3/image/' + id;
			$(iframe).on('load', function() {
				var resp = fetch(url, { 
					method: 'get', 
					headers: { 'Authorization': 'Client-ID 6bde5f4f9612a11' }
				}).then(function(response) {
				  return response.json();
				})
				console.log(resp);
			});

			

			// var url = 'https://api.imgur.com/3/image/' + id;
			// var json;
			// var success = false;

			// fetch(url, { 
			// 	method: 'get', 
			// 	headers: { 'Authorization': 'Client-ID 6bde5f4f9612a11' }
			// }).then(function(response) {
			//   return response.json();
			// }).then(function(data) {
			// 	getImageDetails(data, iframe);
			// }).catch(function() {
			// 	console.log("Imgur API request failed or timed out.");
			// });		
		}
	});
}

function getImageDetails(json, iframe) {
	var parsed = json['data'];
	var height = parsed['height'];
	var width = parsed['width'];
	var maxWidth = 500;
	var originalRatio = width / height;

	console.log('scrapped width/height: ' + width + "/" + height)

	var displayRatio = width/height;
	console.log(displayRatio);

	if (width != height) {
		width = maxWidth;
		height = width / displayRatio;
	}
	// else if (height > width) {
	// 	width = maxWidth;
	// 	height = width * displayRatio;
	// }
	else {
		// square image
		width = maxWidth;
		height = maxWidth;
	}

	check();
	console.log('new resolution: ' + width + "/" + height)
	
	iframe.style.cssText  += 'height: ' + height + 'px; width: ' + width + 'px';
}

// function checkWidthHeight(id) {
// 	console.log($('#' + id));
// }

/*
:thinking emoji:

1600 / 2500 -> 0.625

1920 / 1080 -> 1.777

270 / 480  -> 0.5625
*/