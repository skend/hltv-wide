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
	// console.log($(element).find('.minimizeComment').length == 0)
	if ($(element).find('.minimizeComment').length == 0) { 
  		var anchor = document.createElement('a');
		anchor.appendChild(document.createTextNode('[ - ]'));
		anchor.className = "minimizeComment";
		anchor.style = 'padding-right: 6px; cursor: pointer;';
		anchor.addEventListener('click', function() {
			hideUnhide(anchor);
		});

		element.prepend(anchor);
	}
}