// Global Utilities Script ~ By Mindstorm38

if ( !Boolean($) ) throw new Exception("Global Utilities Javascript need jQuery to work");

const JSH = {};

// Polyfill for olds browsers
if ( !String.prototype.format ) {
	String.prototype.format = function() {
		var a = arguments;
		return this.replace( /(?:\{?\{(\d)\}\}?)/g, function ( b, p1 ) {
			p1 = parseInt( p1 );
			if ( p1 === NaN ) return b;
			return a.length > ( p1 - 1 ) ? a[ p1 ] : b;
		} );
	};
}

if( !Array.isArray ) {
	Array.isArray = function( arg ) {
		return Object.prototype.toString.call( arg ) === '[object Array]';
	};
}

// Random token generation
JSH.randomToken = function( length ) {

	if ( typeof( length ) !== "number" ) length = 32;
	abc = "abcdefghijklmnopqrstuvwxyz1234567890".split("");
	var token = "";
	for ( i = 0; i < length; i++ ) {
		token += abc[ Math.floor( Math.random() * abc.length ) ];
	}
	return token;

};

// Utils
JSH.changeUrl = function( newUrl, title ) {
	if ( typeof title !== "string" ) title = "";
	window.history.pushState( "", title, newUrl );
};

JSH.getLocation = function() {
	return document.location.href;
};

JSH.setLocation = function( url ) {
	document.location.href = url;
};

JSH.setLocationPost = function( url, args ) {
	let formContent = "";
    $.each( args, function( key, value ) {
        value = value.split("\"").join("\\\"");
		formContent += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + value + "\" />";
    } );
    let form = $( "<form action=\"" + url + "\" method=\"POST\">" + formContent + "</form>" );
	form.css( "display", "none" );
	form.appendTo( $( document.body ) ).submit();
};

JSH.reloadLocation = function() {
	document.location.reload();
};

JSH.validateEmail = function( email ) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test( email );
};

JSH.getCurrentTimeMillis = function() {
	return new Date().getTime();
};

JSH.getCurrentTimeSeconds = function() {
	return new Date().getTime() / 1000;
};

JSH.getRandomInt = function( max ) {
	if ( typeof max !== "number" ) max = 1000000;
	return Math.floor( Math.random() * Math.floor( max ) );
};

// URL Manipulation
JSH.url = {};

JSH.url.getParam = function( url, param ) {
	let results = new RegExp('[\?&]' + param + '=([^&#]*)').exec( url );
	if ( results == null ) {
		return null;
	} else {
		return decodeURIComponent( results[1] ) || 0;
	}
};

JSH.url.removeParam = function( url, param ) {
	let urlparts = url.split("?");
	if ( urlparts.length >= 2 ) {
		let urlBase = urlparts.shift();
		let queryString = urlparts.join("?");
		let prefix = encodeURIComponent( param ) + "=";
		let pars = queryString.split( /[&;]/g );
		for ( let i = pars.length; i-->0; )
			if ( pars[i].lastIndexOf( prefix, 0 ) !== -1 )
				pars.splice( i, 1 );
		url = pars.length == 0 ? urlBase : ( urlBase + '?' + pars.join('&') );
	}
	return url;
};

JSH.url.setParam = function( url, param, value ) {
	var pattern = new RegExp( '(' + param + '=).*?(&|$)' );
	var newUrl = url.replace( pattern, '$1' + value + '$2' );
	var n = url.indexOf( param );
	if ( n == -1 ) {
		newUrl = newUrl + ( newUrl.indexOf('?') > 0 ? '&' : '?' ) + param + '=' + value;
	}
	return newUrl;
};

JSH.url.addParam = function( url, param, value ) {
	param = encodeURIComponent( param );
	var r = "([&?]|&amp;)" + param + "\\b(?:=(?:[^&#]*))*";
	var a = document.createElement('a');
	var regex = new RegExp( r );
	var str = param + ( value ? "=" + encodeURIComponent( value ) : "" );
	a.href = url;
	var q = a.search.replace( regex, "$1" + str );
	if ( q === a.search ) {
		a.search += ( a.search ? "&" : "" ) + str;
	} else {
		a.search = q;
	}
	return a.href;
};

// Virtual Form
JSH.form = {};

JSH.form.list = {};
JSH.form.customFields = {};

JSH.form.registerCustomField = function( identifier, selector, valueFunction ) {

	if ( typeof selector !== "string" ) throw "Invalid selector";
	if ( typeof valueFunction !== "function" ) throw "Invalid value function";

	JSH.form.customFields[ identifier ] = {
		"selector": selector,
		"value_function": valueFunction
	};

};

JSH.form.registerCustomField( "std-input", "input", function( elt ) {
	let $elt = $( elt );
	return $elt.is("[type='checkbox'], [type='radio']") ? $elt.prop("checked") : elt.value;
} );

JSH.form.registerCustomField( "std-textarea", "textarea", function( elt ) {
	return elt.value;
} );

JSH.form.registerCustomField( "std-select", "select", function( elt ) {
	return elt.value;
} );

JSH.form.getElementValue = function( elt ) {

	$elt = $( elt );

	for ( let identifier in JSH.form.customFields ) {

		let customFieldData = JSH.form.customFields[ identifier ];

		if ( $elt.is( customFieldData["selector"] ) ) {
			return customFieldData["value_function"]( elt );
		}

	}

	return $elt.val();

};

JSH.form.collect = function( form ) {

	let rawFormNamespace = form + ":";

	// let selector = "input[name^='" + rawFormNamespace + "'], input[data-form='" + form + "']";
	let selector = "";

	let i = true;
	for ( let identifier in JSH.form.customFields ) {

		let customFieldData = JSH.form.customFields[ identifier ];

		selector +=
			( i ? "" : "," ) + customFieldData["selector"] + "[name^='" + rawFormNamespace + "']" +
			", " + customFieldData["selector"] + "[data-form='" + form + "']";

		i = false;

	}

	let values = {};

	$( selector ).each( function() {

		let input = $( this );

		let name = input.attr("name");

		if ( name === undefined ) {

			name = input.attr("data-field");

		} else {

			name = name.substring( rawFormNamespace.length );

		}

		if ( name === undefined || name == "" ) return;

		values[ name ] = JSH.form.getElementValue( this );

	} );

	return values;

};

JSH.form.postQuery = function( form, queryname, fn ) {

	let params = JSH.form.collect( form );

	JSH.query.post( queryname, params, fn );

};

JSH.form.getFormData = function( form ) {

	let formData = JSH.form.list[ form ];

	if ( formData === undefined ) {

		JSH.form.list[ form ] = formData = {
			"valid": false,
			"fields": {},
			"submit_action": null,
			"submit_elements": []
		};

		formData["field_enter_event"] = function( e ) {
			if ( e.key === "Enter" || e.keyCode === 13 || e.which === 13 ) {
				if ( this["valid"] && typeof this["submit_action"] === "function" ) {
					this["submit_action"]();
				}
			}
		}.bind( formData );

	}

	return formData;

};

JSH.form.getFieldData = function( form, field ) {

	// let selector = "input[name='" + form + ":" + field + "'], input[data-form='" + form + "'][data-field='" + field + "']";
	let selector = "";

	let i = true;
	for ( let identifier in JSH.form.customFields ) {

		let customFieldData = JSH.form.customFields[ identifier ];

		selector +=
			( i ? "" : "," ) + customFieldData["selector"] + "[name='" + form + ":" + field + "']" +
			", " + customFieldData["selector"] + "[data-form='" + form + "'][data-field='" + field + "']";

		i = false;

	}

	let elt = document.querySelector( selector );
	if ( elt === null ) return null;

	let formData = JSH.form.getFormData( form );

	let formFields = formData["fields"];

	let fieldData = formFields[ field ];
	if ( fieldData === undefined ) {

		formFields[ field ] = fieldData = {
			"valid": true,
			"checkers": [],
			"element": elt,
			"event": null,
			"subfields": {},
			"enter_event": false
		};

	}

	return fieldData;

};

JSH.form.getField = function( form, field ) {
	let data = JSH.form.getFieldData( form, field );
	return data === null ? null : data["element"];
};

JSH.form.getFormSubmits = function( form ) {
	return document.querySelectorAll("[data-form-submit='" + form + "']");
};

JSH.form.setFormSubmitAction = function( form, cb ) {

	let formData = JSH.form.getFormData( form );

	if ( formData["submit_elements"].length !== 0 ) {

		formData["submit_elements"].forEach( e => e.removeEventListener( 'click', formData["submit_action"] ) );

	}

	formData["submit_action"] = cb;
	formData["submit_elements"] = JSH.form.getFormSubmits( form );

	formData["submit_elements"].forEach( e => e.addEventListener( 'click', cb ) );

};

JSH.form.addEnterKeyListener = function( form, fields ) {

	if ( !Array.isArray( fields ) ) {
		fields = [ fields ];
	}

	let formData = JSH.form.getFormData( form );

	$.each( fields, function( idx, field ) {

		let fieldData = formData["fields"][ field ];
		if ( fieldData === undefined ) return;

		if ( fieldData["enter_event"] ) return;

		fieldData["element"].addEventListener( 'keyup', formData["field_enter_event"] );

	} );

};

JSH.form.removeEnterKeyListener = function( form, fields ) {

	if ( !Array.isArray( fields ) ) {
		fields = [ fields ];
	}

	let formData = JSH.form.getFormData( form );

	$.each( fields, function( idx, field ) {

		let fieldData = formData["fields"][ field ];
		if ( fieldData === undefined ) return;

		if ( !fieldData["enter_event"] ) return;

		fieldData["element"].removeEventListener( 'keyup', formData["field_enter_event"] );

	} );

};

JSH.form.clearEnterKeyListeners = function( form ) {

	let formData = JSH.form.getFormData( form );

	$.each( formData["fields"], function( fieldName, fieldData ) {

		if ( fieldData["enter_event"] ) {

			fieldData["element"].removeEventListener( 'keyup', formData["field_enter_event"] );

		}

	} );

};

JSH.form.addChecker = function( form, field, checker, index ) {

	if ( typeof checker !== "function" )
		throw "Invalid checker function";

	let fieldData = JSH.form.getFieldData( form, field );
	if ( fieldData === null ) return;

	if ( Array.isArray( checker.subfields ) ) {

		let fieldSubfields = fieldData["subfields"];

		$.each( checker.subfields, function( idx, subfield ) {

			if ( fieldSubfields[ subfield ] === undefined ) {

				let fieldElt = JSH.form.getField( form, subfield );

				fieldSubfields[ subfield ] = function() {
					JSH.form.processCheck( form, field );
				};

				fieldElt.addEventListener( 'keyup', fieldSubfields[ subfield ] );

			}

		} );

	}

	let checkers = fieldData["checkers"];

	if ( index === undefined ) {

		checkers.push( checker );

	} else {

		if ( index < 0 || index > checkers.length )
			throw "Invalid index";

		checkers.splice( index, 0, checker );

	}

	if ( checkers.length === 1 ) {

		fieldData["event"] = function() {
			JSH.form.processCheck( form, field );
		};

		fieldData["element"].addEventListener( 'keyup', fieldData["event"] );

	}

	JSH.form.processCheck( form, field );

};

JSH.form.clearCheckers = function( form, field ) {

	let fieldData = JSH.form.getFieldData( form, field );
	if ( fieldData === null ) return;

	fieldData["element"].removeEventListener( "keyup", fieldData["event"] );
	fieldData["event"] = null;
	fieldData["valid"] = true;

	let subfields = fieldData["subfields"];

	$.each( subfields, function( subfield, listener ) {

		JSH.form.getFieldData( form, subfield )["element"].removeEventListener( "keyup", listener );

	} );

	fieldData["subfields"] = {};
	fieldData["checkers"] = [];

	JSH.form.processCheck( form, field );

};

JSH.form.processCheck = function( form, field ) {

	let formData = JSH.form.list[ form ];
	if ( formData === undefined ) return;

	let formFields = formData["fields"];

	function fieldCheck( fieldName, fieldObj ) {

		fieldObj["valid"] = true;
		let fieldCheckers = fieldObj["checkers"];

		let fieldElt = fieldObj["element"];
		let fieldValue = JSH.form.getElementValue( fieldElt );

		$.each( fieldCheckers, function( idx, checker ) {

			if ( !fieldObj["valid"] ) return;

			let msg = checker( fieldElt, fieldValue, form, fieldName );

			if ( msg !== false ) {
				fieldObj["valid"] = false;
			}

		} );

		if ( ( typeof fieldValue === "string" && fieldValue.length === 0 ) || fieldObj["valid"] ) {
			fieldElt.classList.remove("invalid");
		} else {
			fieldElt.classList.add("invalid");
		}

	}

	formData["valid"] = true;

	if ( field === undefined ) {

		$.each( formFields, function( fieldName, fieldObj ) {

			fieldCheck( fieldName, fieldObj );

			if ( !fieldObj["valid"] )
				formData["valid"] = false;

		} );

	} else {

		let fieldObj = formFields[ field ];
		if ( fieldObj === undefined ) return;
		fieldCheck( field, fieldObj );

		$.each( formFields, function( fieldName, fieldObj ) {

			if ( !fieldObj["valid"] )
				formData["valid"] = false;

		} );

	}

	$( JSH.form.getFormSubmits( form ) ).each( function() {
		$( this ).prop( "disabled", !formData["valid"] );
	} );

};

JSH.form.addCheckerSubFields = function( fn, subfields ) {
	fn.subfields = subfields;
	return fn;
};

JSH.form.VALID_EMAIL_CHECKER = function( elt, val ) {
	return JSH.validateEmail( val ) ? false : "invalid_email";
};

JSH.form.NOT_EMPTY_CHECKER = function( elt, val ) {
	return val.length === 0 ? "empty" : false;
};

JSH.form.createRegexChecker = function( regex ) {
	if ( regex === undefined ) return null;
	return function( elt, val ) {
		return regex.test( val ) ? false : "regex_not_correspond";
	};
};

JSH.form.createLengthChecker = function( min, max ) {
	if ( min === undefined && max === undefined ) return null;
	return function( elt, val ) {
		if ( typeof val !== "string" ) return false;
		let length = val.length;
		if ( min !== undefined && length < min ) return "too_short";
		if ( max !== undefined && length > max ) return "too_long";
		return false;
	};
};

JSH.form.createConfirmPasswordChecker = function( referencePasswordField ) {
	if ( referencePasswordField === undefined ) return null;
	return JSH.form.addCheckerSubFields( function( elt, val, form, field ) {

		if ( typeof val !== "string" ) return false;
		if ( field === referencePasswordField ) return false;
		let referenceField = JSH.form.getField( form, referencePasswordField );
		return val === JSH.form.getElementValue( referenceField ) ? false : "invalid_confirm_password";

	}, [ referencePasswordField ] );
};

// Events utilities
JSH.event = {
	timeouts: {}
};

JSH.event.timeShiftedEvent = function( event, delay ) {
	
	let id = JSH.getRandomInt();
	if ( typeof delay !== 'number' ) delay = 300;
	
	return function() {
		
		if ( JSH.event.timeouts[ id ] !== undefined ) {
			
			clearTimeout( JSH.event.timeouts[ id ] );
			delete JSH.event.timeouts[ id ];
			
		}
		
		let args = arguments;
		let self = this;
		
		JSH.event.timeouts[ id ] = setTimeout( () => {
			
			delete JSH.event.timeouts[ id ];
			event.apply( self, arguments );
			
		}, delay );
			
	};
	
};

// Pagination utilities
JSH.pagination = {
	systems: {}
};

JSH.pagination.newSystem = function( paginationContainer, initialPage ) {
	
	let id = JSH.getRandomInt();
	if ( JSH.pagination.systems[ id ] ) return null;
	
	let system = JSH.pagination.systems[ id ] = {
		id: id,
		container: paginationContainer,
		listeners: [],
		buttons: {},
		page: 0,
		minPage: 0,
		maxPage: 0,
		addListener: function( callback ) {
			
			if ( typeof callback !== "function" )
				throw "Invalid callback, must be a function";
			
			this.listeners.push( callback );
			
		},
		triggerListeners: function( page ) {
			
			if ( typeof page !== "number" ) page = system.page;
			
			let valid = true;
			
			this.listeners.forEach( function( listener ) {
				
				if( !listener( page ) )
					valid = false;
				
			} );
			
			return valid;
			
		},
		updateRenderers: function() {
			
			$.each( this.buttons, function( buttonId, button ) {
				button.updateRenderer();
			} );
			
		},
		setMinPage: function( minPage ) {
			
			if ( minPage > this.maxPage )
				throw "Minimum page can't be greater than current maximum page";
			
			this.minPage = minPage;
			this.updateRenderers();
			
		},
		setMaxPage: function( maxPage ) {
			
			if ( maxPage < this.minPage )
				throw "Maximum page can't be smaller than current minimum page";
			
			this.maxPage = maxPage;
			this.updateRenderers();
			
		},
		setPage: function( page ) {
			
			if ( page < this.minPage ) {
				page = this.minPage;
			} else if ( page > this.maxPage ) {
				page = this.maxPage;
			}
			
			this.page = page;
			
			this.updateRenderers();
			
		},
		addButton: function( buttonId, action, renderer ) {
			
			let elt = this.container.querySelector( "span[data-pagid='" + buttonId + "']" );
			
			if ( elt === null )
				throw "Invalid button identifier '" + buttonId + "', not found in container";
			
			let button = this.buttons[ buttonId ] = {
				system: this,
				element: elt,
				action: null,
				renderer: renderer,
				setAction: function( action ) {
					
					if ( this.action !== null ) {
						this.element.removeEventListener( 'click', JSH.pagination.buttonClickedListener );
					}
					
					if ( typeof action === "function" ) {
						
						this.action = action;
						this.element.addEventListener( 'click', JSH.pagination.buttonClickedListener );
						
					} else if ( action !== null )
						throw "Invalid action, must be null or function";
					
				},
				updateRenderer: function() {
					
					let ret = this.renderer( this.system );
					
					if ( ret.disabled ) this.element.classList.add("disabled");
					else this.element.classList.remove("disabled");
					
					this.element.jsh_pag_disabled = ret.disabled;
					
					if ( ret.text !== undefined )
						this.element.textContent = ret.text;
					
				},
				setRenderer: function( renderer ) {
					
					this.renderer = renderer;
					this.updateRenderer();
					
				}
			};

			button.setAction( action );
			
			elt.jsh_pag_system = this;
			elt.jsh_pag_button = button;
			elt.jsh_pag_disabled = false;
			
			return button;
			
		},
		addFirstButton: function( buttonId ) {
			return this.addButton( buttonId, ( sys ) => 0, ( sys ) => {
				return {
					disabled: ( sys.page === 0 ),
					text: "1"
				};
			} );
		},
		addLastButton: function( buttonId ) {
			return this.addButton( buttonId, ( sys ) => sys.maxPage, ( sys ) => {
				return {
					disabled: ( sys.page === sys.maxPage ),
					text: ( sys.maxPage + 1 ).toString()
				};
			} );
		},
		addCurrentPageButton: function( buttonId ) {
			return this.addButton( buttonId, null, ( sys ) => {
				return {
					disabled: true,
					text: ( sys.page + 1 ).toString()
				};
			} );
		},
		addPreviousButton: function( buttonId ) {
			return this.addButton( buttonId, ( sys ) => sys.page - 1, ( sys ) => {
				return {
					disabled: ( sys.page === 0 )
				};
			} );
		},
		addNextButton: function( buttonId ) {
			return this.addButton( buttonId, ( sys ) => sys.page + 1, ( sys ) => {
				return {
					disabled: ( sys.page === sys.maxPage )
				};
			} );
		}
	};
	
	return system;
	
};

JSH.pagination.buttonClickedListener = function() {
	
	if ( this.jsh_pag_disabled ) return;
	
	let page = this.jsh_pag_button.action( this.jsh_pag_system );
	
	if ( this.jsh_pag_system.triggerListeners( page ) ) {
		this.jsh_pag_system.setPage( page );
	}
	
};

JSH.table = {};

JSH.table.build = function( tableContainerSelector, items, constructors, descructors ) {
	
	let container = document.querySelector( tableContainerSelector );
	
	if ( container === null || typeof container !== "object" || [ "TABLE", "THEAD", "TBODY", "TFOOT" ].indexOf( container.tagName ) === -1 )
		throw "Invalid selected element";
	
	if ( !Array.isArray( items ) )
		throw "Invalid items array";
	
	if ( !Array.isArray( constructors ) )
		throw "Constructors must be an array";
	
	if ( typeof descructor !== "object" ) descructor = {};
	
	let itemsCount = items.length;
	
	let childRows = container.querySelectorAll("tr");
	let childRowsCount = childRows.length;
	
	let rowElt;
	
	let rowChildCells;
	let rowChildCell;
	let rowChildCellId;
	
	let constructor;
	let destructor;
	
	let i = 0
	
	for ( ; i < Math.max( itemsCount, childRowsCount ); i++ ) {
		
		if ( i < childRowsCount ) {
			
			rowElt = childRows[ i ];
			rowChildCells = rowElt.querySelectorAll("td");
			
			for ( let j = 0; j < rowChildCells.length; j++ ) {
				
				rowChildCell = rowChildCells[ j ];
				rowChildCellId = rowChildCell.jsh_id;
				
				if ( rowChildCellId !== undefined ) {
					
					destructor = descructors[ rowChildCellId ];
					
					if ( destructor !== undefined )
						destructor( rowChildCell );
					
				}
				
				rowElt.removeChild( rowChildCell );
				
			}
			
		} else {
			rowElt = null;
		}
		
		if ( i < itemsCount ) {
			
			if ( rowElt === null ) {
				
				rowElt = document.createElement("tr");
				container.appendChild( rowElt );
				
			}
			
			let cells = {};
			
			$.each( constructors, function( idx, constructor ) {
				
				if ( typeof constructor.id !== "string" || typeof constructor.func !== "function" )
					return;
				
				let cell = document.createElement("td");
				rowElt.appendChild( cell );
				cell.jsh_id = constructor.id;
				
				cells[ constructor.id ] = cell;
				
				constructor.func( cell, items[i], cells );
				
			} );
			
		} else if ( rowElt !== null ) {
			container.removeChild( rowElt );
		}
		
	}
	
	for ( ; i < childRowsCount; i++ ) {
		
		
		
	}
	
};

// Query
JSH.query = {};

JSH.query.path = "/query/{0}";

JSH.query.post = function( name, params, fn ) {

	let path = JSH.query.path.format( name );

	let formdata = new FormData();
	let val;
	for ( let key in params ) {
		val = params[ key ];
		if ( typeof val === "boolean" ) val = val ? "1" : "0";
		formdata.append( key, val );
	}

	$.ajax( {
		type: "POST",
		xhr: function() {

			let xhr = new XMLHttpRequest();

			return xhr;

		},
		url: path,
		data: formdata,
		processData: false,
		contentType: false,
		dataType: 'json',
		success: function( data ) {

			if ( typeof fn === "function" )
				fn( data.error, data.data, data.message );

		},
		error: function( xhr, status, error ) {

			console.error("Query failed :");
			console.error( error );

		}
	} );

};

// Language
JSH.lang = {};
JSH.lang.content = {};

JSH.lang.get = function( key, vars ) {

	let raw = JSH.lang.content[ key ];
	if ( raw === undefined ) return key;
	return raw.format( vars );

};
