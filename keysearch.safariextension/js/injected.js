function handleMessage(msg) {
	if (window !== window.top) 
		return;
	switch (msg.name) {
	case 'showHUD':
		showHUD(msg.message);
		break;
	case 'queryParsed':
		$('#keysearchHudSubText').text(msg.message.subtext);
		break;
	}
}

function showHUD(keyword) {

	// If already shown, either replace first word with new keyword or close HUD if none
	if ($('#keysearchHud').length) {
		if (keyword) {
			var searchField = $('#keysearchHudInput');
			var query = searchField.val().substr(searchField.val().split(' ')[0].length);
			searchField.val(keyword+query);
			searchField.focus();
		} else {
			closeHUD();
	   	}
	} else {
		// Create and append HUD
		if ($('link[href^="safari-extension://com.matt-swain.keysearch"][href$="css/hud.css"]').length == 0) {
			$('<link rel="stylesheet" href="'+ext.baseURI+'css/hud.css">').appendTo('head');
		}
		
		$('body').append('<div id="keysearchHud"><span id="keysearchHudSubText">KeySearch</span><input type="text" id="keysearchHudInput" /></div>');
		$('#keysearchHud').fadeIn(150, function() {
			$('#keysearchHudInput').focus();
		});
		if(keyword) {
			$('#keysearchHudInput').val(keyword+' ');
		}
	}
}

function closeHUD() {
	$('#keysearchHud').fadeOut(150, function() {
		$(this).remove();
	});
}

function handleKeydown(e) {
	k = parseInt(e.keyIdentifier.replace('U+',''), 16);
	
	if (e.srcElement.id == 'keysearchHudInput') {
		if (e.which == 13) {
			safari.self.tab.dispatchMessage('submitHUD', {value:$('#keysearchHudInput').val(), command:e.metaKey});
			closeHUD();	
		}
	}
	
	if (e.which == 27) {
		closeHUD();
	}
}

function handleKeypress(e) {
	shortcut  = k;
	shortcut += e.shiftKey * 1000;
	shortcut += e.ctrlKey  * 10000;
	shortcut += e.altKey   * 100000;
	shortcut += e.metaKey  * 1000000;
	safari.self.tab.dispatchMessage('performKeyboard', shortcut);
}

// Update subtext as you type into the HUD
function handleKeyup(e) {
	if(e.srcElement.id == 'keysearchHudInput') {
		if (e.srcElement.value == '') {
				$('#keysearchHudSubText').text('KeySearch');
		} else {
			safari.self.tab.dispatchMessage('parseQuery', 	e.srcElement.value);
		}
	}
}

function handleContextMenu(e) {
	var clickedField = e.target;
	if (clickedField.nodeName == 'INPUT' && clickedField.type == 'text') {
		if (!clickedField.form)
			return;
		var url = clickedField.form.action,
			fieldValue = clickedField.value;
		clickedField.value = '@@@';
		var queryString = $(clickedField.form).serialize().replace('%40%40%40','@@@');
		clickedField.value = fieldValue;
		url=url+'?'+queryString;
		var buttons = $('button, input[type="submit"]', clickedField.form);
		var buttonNameValues = new Array();
		for ( var i=0; i<buttons.length; i++) {
			var currentButton = $(buttons[i]);
			if( currentButton.attr('name') && currentButton.attr('value')) {
				buttonNameValues.push( {
					name: currentButton.attr('name'),
					value: currentButton.attr('value')
				} );
			}
		}
		var userInfo = {
			keyword: '>temp',
			url: url,
			buttons: buttonNameValues,
			enabled: false,
		};
		safari.self.tab.setContextMenuEventUserInfo(e, userInfo);
	} else {
		safari.self.tab.setContextMenuEventUserInfo(e, {url:'noUrl'});
	}
}

const ext = safari.extension;
window.addEventListener('keydown', handleKeydown, false);
window.addEventListener('keypress', handleKeypress, false);
window.addEventListener('keyup', handleKeyup, false);
window.addEventListener('contextmenu', handleContextMenu, false);
safari.self.addEventListener('message', handleMessage, false);
