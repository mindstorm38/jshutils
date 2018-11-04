// Global Utilities Script ~ By Mindstorm38

if ( !Boolean($) ) throw new Exception("Global Utilities Javascript need jQuery to work");

const MSTR = {};

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
MSTR.randomToken = function( length ) {

	if ( typeof( length ) !== "number" ) length = 32;
	abc = "abcdefghijklmnopqrstuvwxyz1234567890".split("");
	var token = "";
	for ( i = 0; i < length; i++ ) {
		token += abc[ Math.floor( Math.random() * abc.length ) ];
	}
	return token;

};

// Utils
MSTR.changeUrl = function( newUrl, title ) {
	if ( typeof( title ) !== "string" ) title = "";
	window.history.pushState( "", title, newUrl );
};

MSTR.getLocation = function() {
	return document.location.href;
};

MSTR.setLocation = function( url ) {
	document.location.href = url;
};

MSTR.setLocationPost = function( url, args ) {
	let formContent = "";
    $.each( args, function( key, value ) {
        value = value.split("\"").join("\\\"");
		formContent += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + value + "\" />";
    } );
    let form = $( "<form action=\"" + url + "\" method=\"POST\">" + formContent + "</form>" );
	form.css( "display", "none" );
	form.appendTo( $( document.body ) ).submit();
};

MSTR.reloadLocation = function() {
	document.location.reload();
};

MSTR.validateEmail = function( email ) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test( email );
};

MSTR.getCurrentTimeMillis = function() {
	return new Date().getTime();
};

MSTR.getCurrentTimeSeconds = function() {
	return new Date().getTime() / 1000;
};

// URL Manipulation
MSTR.url = {};

MSTR.url.getParam = function( url, param ) {
	let results = new RegExp('[\?&]' + param + '=([^&#]*)').exec( url );
	if ( results == null ) {
		return null;
	} else {
		return decodeURIComponent( results[1] ) || 0;
	}
};

MSTR.url.removeParam = function( url, param ) {
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

MSTR.url.setParam = function( url, param, value ) {
	var pattern = new RegExp( '(' + param + '=).*?(&|$)' );
	var newUrl = url.replace( pattern, '$1' + value + '$2' );
	var n = url.indexOf( param );
	if ( n == -1 ) {
		newUrl = newUrl + ( newUrl.indexOf('?') > 0 ? '&' : '?' ) + param + '=' + value;
	}
	return newUrl;
};

MSTR.url.addParam = function( url, param, value ) {
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
MSTR.form = {};

MSTR.form.list = {};
MSTR.form.customFields = {};

MSTR.form.registerCustomField = function( identifier, selector, valueFunction ) {

	if ( typeof selector !== "string" ) throw "Invalid selector";
	if ( typeof valueFunction !== "function" ) throw "Invalid value function";

	MSTR.form.customFields[ identifier ] = {
		"selector": selector,
		"value_function": valueFunction
	};

};

MSTR.form.registerCustomField( "std-input", "input", function( elt ) {
	let $elt = $( elt );
	return $elt.is("[type='checkbox'], [type='radio']") ? $elt.prop("checked") : elt.value;
} );

MSTR.form.registerCustomField( "std-textarea", "textarea", function( elt ) {
	return elt.value;
} );

MSTR.form.registerCustomField( "std-select", "select", function( elt ) {
	return elt.value;
} );

MSTR.form.getElementValue = function( elt ) {

	$elt = $( elt );

	for ( let identifier in MSTR.form.customFields ) {

		let customFieldData = MSTR.form.customFields[ identifier ];

		if ( $elt.is( customFieldData["selector"] ) ) {
			return customFieldData["value_function"]( elt );
		}

	}

	return $elt.val();

};

MSTR.form.collect = function( form ) {

	let rawFormNamespace = form + ":";

	// let selector = "input[name^='" + rawFormNamespace + "'], input[data-form='" + form + "']";
	let selector = "";

	let i = true;
	for ( let identifier in MSTR.form.customFields ) {

		let customFieldData = MSTR.form.customFields[ identifier ];

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

		values[ name ] = MSTR.form.getElementValue( this );

	} );

	return values;

};

MSTR.form.postQuery = function( form, queryname, fn ) {

	let params = MSTR.form.collect( form );

	MSTR.query.post( queryname, params, fn );

};

MSTR.form.getFormData = function( form ) {

	let formData = MSTR.form.list[ form ];

	if ( formData === undefined ) {

		MSTR.form.list[ form ] = formData = {
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

MSTR.form.getFieldData = function( form, field ) {

	// let selector = "input[name='" + form + ":" + field + "'], input[data-form='" + form + "'][data-field='" + field + "']";
	let selector = "";

	let i = true;
	for ( let identifier in MSTR.form.customFields ) {

		let customFieldData = MSTR.form.customFields[ identifier ];

		selector +=
			( i ? "" : "," ) + customFieldData["selector"] + "[name='" + form + ":" + field + "']" +
			", " + customFieldData["selector"] + "[data-form='" + form + "'][data-field='" + field + "']";

		i = false;

	}

	let elt = document.querySelector( selector );
	if ( elt === null ) return null;

	let formData = MSTR.form.getFormData( form );

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

MSTR.form.getField = function( form, field ) {
	let data = MSTR.form.getFieldData( form, field );
	return data === null ? null : data["element"];
};

MSTR.form.getFormSubmits = function( form ) {
	return document.querySelectorAll("[data-form-submit='" + form + "']");
};

MSTR.form.setFormSubmitAction = function( form, cb ) {

	let formData = MSTR.form.getFormData( form );

	if ( formData["submit_elements"].length !== 0 ) {

		formData["submit_elements"].forEach( e => e.removeEventListener( 'click', formData["submit_action"] ) );

	}

	formData["submit_action"] = cb;
	formData["submit_elements"] = MSTR.form.getFormSubmits( form );

	formData["submit_elements"].forEach( e => e.addEventListener( 'click', cb ) );

};

MSTR.form.addEnterKeyListener = function( form, fields ) {

	if ( !Array.isArray( fields ) ) {
		fields = [ fields ];
	}

	let formData = MSTR.form.getFormData( form );

	$.each( fields, function( idx, field ) {

		let fieldData = formData["fields"][ field ];
		if ( fieldData === undefined ) return;

		if ( fieldData["enter_event"] ) return;

		fieldData["element"].addEventListener( 'keyup', formData["field_enter_event"] );

	} );

};

MSTR.form.removeEnterKeyListener = function( form, fields ) {

	if ( !Array.isArray( fields ) ) {
		fields = [ fields ];
	}

	let formData = MSTR.form.getFormData( form );

	$.each( fields, function( idx, field ) {

		let fieldData = formData["fields"][ field ];
		if ( fieldData === undefined ) return;

		if ( !fieldData["enter_event"] ) return;

		fieldData["element"].removeEventListener( 'keyup', formData["field_enter_event"] );

	} );

};

MSTR.form.clearEnterKeyListeners = function( form ) {

	let formData = MSTR.form.getFormData( form );

	$.each( formData["fields"], function( fieldName, fieldData ) {

		if ( fieldData["enter_event"] ) {

			fieldData["element"].removeEventListener( 'keyup', formData["field_enter_event"] );

		}

	} );

};

MSTR.form.addChecker = function( form, field, checker, index ) {

	if ( typeof checker !== "function" )
		throw "Invalid checker function";

	let fieldData = MSTR.form.getFieldData( form, field );
	if ( fieldData === null ) return;

	if ( Array.isArray( checker.subfields ) ) {

		let fieldSubfields = fieldData["subfields"];

		$.each( checker.subfields, function( idx, subfield ) {

			if ( fieldSubfields[ subfield ] === undefined ) {

				let fieldElt = MSTR.form.getField( form, subfield );

				fieldSubfields[ subfield ] = function() {
					MSTR.form.processCheck( form, field );
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
			MSTR.form.processCheck( form, field );
		};

		fieldData["element"].addEventListener( 'keyup', fieldData["event"] );

	}

	MSTR.form.processCheck( form, field );

};

MSTR.form.clearCheckers = function( form, field ) {

	let fieldData = MSTR.form.getFieldData( form, field );
	if ( fieldData === null ) return;

	fieldData["element"].removeEventListener( "keyup", fieldData["event"] );
	fieldData["event"] = null;
	fieldData["valid"] = true;

	let subfields = fieldData["subfields"];

	$.each( subfields, function( subfield, listener ) {

		MSTR.form.getFieldData( form, subfield )["element"].removeEventListener( "keyup", listener );

	} );

	fieldData["subfields"] = {};
	fieldData["checkers"] = [];

	MSTR.form.processCheck( form, field );

};

MSTR.form.processCheck = function( form, field ) {

	let formData = MSTR.form.list[ form ];
	if ( formData === undefined ) return;

	let formFields = formData["fields"];

	function fieldCheck( fieldName, fieldObj ) {

		fieldObj["valid"] = true;
		let fieldCheckers = fieldObj["checkers"];

		let fieldElt = fieldObj["element"];
		let fieldValue = MSTR.form.getElementValue( fieldElt );

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

	$( MSTR.form.getFormSubmits( form ) ).each( function() {
		$( this ).prop( "disabled", !formData["valid"] );
	} );

};

MSTR.form.addCheckerSubFields = function( fn, subfields ) {
	fn.subfields = subfields;
	return fn;
};

MSTR.form.VALID_EMAIL_CHECKER = function( elt, val ) {
	return MSTR.validateEmail( val ) ? false : "invalid_email";
};

MSTR.form.NOT_EMPTY_CHECKER = function( elt, val ) {
	return val.length === 0 ? "empty" : false;
};

MSTR.form.createRegexChecker = function( regex ) {
	if ( regex === undefined ) return null;
	return function( elt, val ) {
		return regex.test( val ) ? false : "regex_not_correspond";
	};
};

MSTR.form.createLengthChecker = function( min, max ) {
	if ( min === undefined && max === undefined ) return null;
	return function( elt, val ) {
		if ( typeof val !== "string" ) return false;
		let length = val.length;
		if ( min !== undefined && length < min ) return "too_short";
		if ( max !== undefined && length > max ) return "too_long";
		return false;
	};
};

MSTR.form.createConfirmPasswordChecker = function( referencePasswordField ) {
	if ( referencePasswordField === undefined ) return null;
	return MSTR.form.addCheckerSubFields( function( elt, val, form, field ) {

		if ( typeof val !== "string" ) return false;
		if ( field === referencePasswordField ) return false;
		let referenceField = MSTR.form.getField( form, referencePasswordField );
		return val === MSTR.form.getElementValue( referenceField ) ? false : "invalid_confirm_password";

	}, [ referencePasswordField ] );
};

// Query
MSTR.query = {};

MSTR.query.path = "/query/{0}";

MSTR.query.post = function( name, params, fn ) {

	let path = MSTR.query.path.format( name );

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
MSTR.lang = {};
MSTR.lang.content = {};

MSTR.lang.get = function( key, vars ) {

	let raw = MSTR.lang.content[ key ];
	if ( raw === undefined ) return key;
	return raw.format( vars );

};
