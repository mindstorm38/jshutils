/*
 *  +-----------------------------+
 *  |  Javascript HTML Utilities  |
 *  +-----------------------------+
 *  
 *  By Mindstorm38 at :
 *   - https://github.com/mindstorm38/jshutils
 *   - https://github.com/mindstorm38
 *   - https://twitter.com/Mindstorm38
 * 
 */

if ( !Boolean( $ ) )
	throw "JSH Utilities modules needs jQuery to work. Load it first.";

// Polyfill for old browers

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

if ( !Array.prototype.forEach ) {
	
	Array.prototype.forEach = function( callback ) {
		
		var T, k;
		
		if ( this == null ) {
			throw new TypeError('this is null or not defined');
		}
		
		var O = Object( this );
		
		var len = O.length >>> 0;
		
		if ( typeof callback !== 'function' ) {
			throw new TypeError(callback + ' is not a function');
		}
		
		if ( arguments.length > 1 ) {
			T = arguments[1];
		}
		
		k = 0;
		
		while (k < len) {
			
			var kValue;
			
			if (k in O) {
				
				kValue = O[ k ];
				callback.call( T, kValue, k, O );
				
			}
			
			k++;
			
		}
		
	};
	
}

const Utils = (function(){
	
	const TOKAN_CHAR_LIST				= "abcdefghijklmnopqrstuvwxyz1234567890".split("");
	const EMAIL_RE						= /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const DEFAULT_RANDOM_TOKEN_LEN		= 32;
	const DEFAULT_RANDOM_INT_MAX		= 1000000;
	
	function checkParamType( value, type, name ) {
		
		if ( typeof name !== "string" )
			name = "This parameter";
		
		if ( typeof value !== type )
			throw name + " must be " + type;
		
		return value;
		
	}
	
	function checkNumberInteger( value, name ) {

		if ( typeof name !== "string" )
			name = "This number";
		
		if ( !isInt( value ) )
			throw name + " must be a valid integer";
		
		return value;
			
	}
	
	function checkArrayType( value, name ) {
		
		if ( typeof name !== "string" )
			name = "This array";
		
		if ( !Array.isArray( value ) )
			throw name + " must be a valid array";
		
		return value;
		
	}
	
	function isInt( n ) {
		return Number(n) === n && n % 1 === 0;
	}
	
	function randomInt( max ) {
		
		if ( typeof max !== "number" )
			max = DEFAULT_RANDOM_INT_MAX;
		
		return Math.floor( Math.random() * Math.floor( max ) );
			
	}
	
	function randomToken( length ) {
		
		if ( typeof length !== "number" )
			length = DEFAULT_RANDOM_TOKEN_LEN;
		
		let token = "";
		
		for ( let i = 0; i < length; i++ )
			token += TOKAN_CHAR_LIST[ Math.floor( Math.random() * TOKAN_CHAR_LIST.length ) ];
		
		return token;
		
	}
	
	function getLocation() {
		return document.location.href;
	}
	
	function setLocation( url ) {
		document.location.href = checkParamType( url, "string", "URL" );
	}
	
	function setVirtualLocation( url ) {
		history.replaceState( {}, "", checkParamType( url, "string", "URL" ) );
	}
	
	function setLocationPost( url, params ) {
		
		checkParamType( url, "string", "URL" );
		checkParamType( params, "object", "Parameters" );
		
		let html = "";
		
		let value;
		for ( let name in params ) {
			
			value = params[ name ].split('"').join('\\"');
			html += '<input type="hidden" name="' + name + '" value="' + value + '" />';
			
		}

		const form = document.createElement("form");
		form.setAttribute( 'action', url );
		form.setAttribute( 'method', post );
		form.style["display"] = "none";
		document.body.appendChild( form );
		form.submit();
		
	}
	
	function reloadLocation() {
		document.location.reload();
	}
	
	function validateEmail( email ) {
		return EMAIL_RE.test( checkParamType( email, "string", "Email" ) );
	}
	
	function currentDate() {
		return new Date();
	}
	
	function currentTimeMillis() {
		return currentDate().getTime();
	}
	
	function currentTimeSeconds() {
		return currentDate().getTime() / 1000;
	}
	
	function urlGetParam( url, param ) {
		
		let results = new RegExp('[\?&]' + param + '=([^&#]*)').exec( url );
		return results == null ? null : ( decodeURIComponent( results[1] ) || 0 );
		
	}
	
	function urlRemoveParam( url, param ) {
		
		let urlparts = url.split("?");
		
		if ( urlparts.length >= 2 ) {
			
			let urlBase = urlparts.shift();
			let queryString = urlparts.join("?");
			let prefix = encodeURIComponent( param ) + "=";
			let pars = queryString.split( /[&;]/g );
			
			for ( let i = pars.length; i-- > 0; )
				if ( pars[ i ].lastIndexOf( prefix, 0 ) !== -1 )
					pars.splice( i, 1 );
			
			url = pars.length == 0 ? urlBase : ( urlBase + '?' + pars.join('&') );
			
		}
		
		return url;
		
	}
	
	function urlSetParam( url, param, value ) {
		
		let pattern = new RegExp( '(' + param + '=).*?(&|$)' );
		let newUrl = url.replace( pattern, '$1' + value + '$2' );
		let n = url.indexOf( param );
		
		if ( n == -1 ) {
			newUrl = newUrl + ( newUrl.indexOf('?') > 0 ? '&' : '?' ) + param + '=' + value;
		}
		
		return newUrl;
		
	}
	
	function each( array, callback ) {
		
		checkParamType( array, "object", "Invalid array object, must be an object" );
		checkParamType( array.length, "number", "Invalid array object, must implement a number length property" );
		checkParamType( callback, "function", "Callback must be a valid function" );
		
		for ( let i = 0; i < array.length; i++ ) {
			callback( array[ i ], i );
		}
		
		
	}
	
	return {
		checkParamType: checkParamType,
		checkNumberInteger: checkNumberInteger,
		checkArrayType: checkArrayType,
		isInt: isInt,
		randomInt: randomInt,
		randomToken: randomToken,
		getLocation: getLocation,
		setLocation: setLocation,
		setVirtualLocation: setVirtualLocation,
		setLocationPost: setLocationPost,
		reloadLocation: reloadLocation,
		validateEmail: validateEmail,
		currentDate: currentDate,
		currentTimeMillis: currentTimeMillis,
		currentTimeSeconds: currentTimeSeconds,
		randomInt: randomInt,
		urlGetParam: urlGetParam,
		urlRemoveParam: urlRemoveParam,
		urlSetParam: urlSetParam,
		each: each
	};
	
}());

const Query = (function(){
	
	let path = "/query/{0}";
	
	function post( name, params, fn ) {
		
		let queryPath = path.format( name );

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
			url: queryPath,
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
		
	}
	
	function setPath( newPath ) {
		path = newPath;
	}
	
	return {
		post: post,
		setPath: setPath
	}
	
}());

const Lang = (function(){
	
	let content = {};
	
	function get( key, vars ) {
		
		let raw = content[ key ];
		if ( raw === undefined ) return key;
		return raw.format( vars );
		
	}
	
	function setContent( newContent ) {
		content = Utils.checkParamType( newContent, "object", "Language content" );
	}
	
	return {
		get: get,
		setContent: setContent
	};
	
}());

const Event = (function(){
	
	/*
	const timeouts = {};
	
	function newTimeoutId() {
		
		let id;
		
		do {
			
			id = Utils.randomInt();
			
		} while ( id in timeouts );
		
		return id;
		
	}
	
	function timeShiftedEvent( event, delay ) {
		
		let id = newTimeoutId();
		
		if ( typeof delay !== 'number' )
			delay = 300;
		
		return function() {
			
			if ( timeouts[ id ] !== undefined ) {
				
				clearTimeout( timeouts[ id ] );
				delete timeouts[ id ];
				
			}
			
			let args = arguments;
			let self = this;
			
			timeouts[ id ] = setTimeout( () => {
				
				delete timeouts[ id ];
				event.apply( self, args );
				
			}, delay );
				
		};
		
	}
	*/
	
	function TimeoutSystem() {
		
		this.timeouts = {};
		this.delay = 300; // Default delay
		
	}
	
	TimeoutSystem.prototype.newTimeoutId = function() {
		
		let id;
		
		do {
			id = Utils.randomInt();
		} while ( id in this.timeouts );
		
		return id;
		
	};
	
	TimeoutSystem.prototype.triggerEvent = function( id, event, self, args, delay ) {
		
		if ( typeof delay !== 'number' )
			delay = this.delay;
		
		if ( this.timeouts[ id ] != null ) {
			
			clearTimeout( this.timeouts[ id ] );
			delete this.timeouts[ id ];
			
		}
		
		this.timeouts[ id ] = setTimeout( function() {
			
			delete this.system.timeouts[ id ];
			this.event.apply( this.self, this.args );
			
		}.bind( {
			system: this,
			id: id,
			event: event,
			self: self,
			args: args
		} ), delay );
		
	};
	
	function newTimeoutSystem() {
		return new TimeoutSystem();
	}
	
	const internal = newTimeoutSystem();
	
	function timeoutEvent( event, delay ) {
		
		let id = internal.newTimeoutId();
		
		return function() {
			internal.triggerEvent( id, event, this, arguments, delay );
		};
		
	}
	
	return {
		newTimeoutSystem: newTimeoutSystem,
		timeoutEvent: timeoutEvent
	};
	
}());

const Pagination = (function(){
	
	const systems = {};
	
	function PaginationSystem( id, container ) {
		
		this.id = id;
		this.container = container;
		this.listeners = [];
		this.buttons = {};
		this.page = 0;
		this.minPage = 0;
		this.maxPage = 0;
		
	}
	
	PaginationSystem.prototype.addListener = function( callback ) {
		
		Utils.checkParamType( callback, "function", "Pagination callback" );
		this.listeners.push( callback );
		
	};
	
	PaginationSystem.prototype.triggerListeners = function( page ) {
		
		if ( typeof page !== "number" )
			page = this.page;
		
		let valid = true;
		
		Utils.each( this.listeners, function( listener ) {
			
			if ( !listener( page ) )
				valid = false;
			
		} );
		
		return valid;
		
	};
	
	PaginationSystem.prototype.updateRenderers = function() {

		for ( let buttonId in this.buttons ) {
			this.buttons[ buttonId ].updateRenderer();
		}
		
	};
	
	PaginationSystem.prototype.setMinPage = function( minPage ) {
		
		Utils.checkNumberInteger( minPage, "Minimum page" );
		
		if ( minPage > this.maxPage )
			throw "Minimum page can't be greater than current maximum page.";
		
		this.minPage = minPage;
		this.updateRenderers();
		
	};
	
	PaginationSystem.prototype.setMaxPage = function( maxPage ) {
		
		Utils.checkNumberInteger( maxPage, "Maximum page" );
		
		if ( maxPage < this.minPage )
			throw "Maximum page can't be smaller than current minimum page.";
		
		this.maxPage = maxPage;
		this.updateRenderers();
		
	};
	
	PaginationSystem.prototype.setPage = function( page ) {
		
		Utils.checkNumberInteger( page, "Page" );
		
		if ( page < this.minPage ) {
			page = this.minPage;
		} else if ( page > this.maxPage ) {
			page = this.maxPage;
		}
		
		this.page = page;
		this.updateRenderers();
		
	};
	
	PaginationSystem.prototype.addButton = function( buttonId, action, renderer ) {
		
		let elt = this.container.querySelector("[data-pagid='" + buttonId + "']");
		
		if ( elt == null )
			throw "Invalid pagination button identifier '" + buttonId + "' or not found in container.";
		
		let button = new PaginationButton( this, elt );
		
		button.setAction( action );
		button.setRenderer( renderer );
		
		this.buttons[ buttonId ] = button;
		
		return button;
		
	};
	
	PaginationSystem.prototype.addFirstButton = function( buttonId ) {
		return this.addButton( buttonId, function( sys ) { return 0 }, function( sys ) {
			return {
				disabled: ( sys.page === 0 ),
				text: "1"
			};
		} );
	};
	
	PaginationSystem.prototype.addLastButton = function( buttonId ) {
		return this.addButton( buttonId, function( sys ) { return sys.maxPage; }, function( sys ) {
			return {
				disabled: ( sys.page === sys.maxPage ),
				text: ( sys.maxPage + 1 ).toString()
			};
		} );
	};
	
	PaginationSystem.prototype.addCurrentPageButton = function( buttonId ) {
		return this.addButton( buttonId, null, function( sys ) {
			return {
				disabled: true,
				text: ( sys.page + 1 ).toString()
			};
		} );
	};
	
	PaginationSystem.prototype.addPreviousButton = function( buttonId ) {
		return this.addButton( buttonId, function( sys ) { return sys.page - 1; }, function( sys ) {
			return {
				disabled: ( sys.page === 0 )
			};
		} );
	};
	
	PaginationSystem.prototype.addNextButton = function( buttonId ) {
		return this.addButton( buttonId, function( sys ) { return sys.page + 1; }, function( sys ) {
			return {
				disabled: ( sys.page === sys.maxPage )
			};
		} );
	};
	
	function PaginationButton( system, element ) {
		
		this.system = system;
		this.element = element;
		this.action = null;
		this.clickHandler = null;
		this.renderer = null;
		this.disabled = false;
		
	}
	
	PaginationButton.prototype.setAction = function( action ) {
		
		if ( action != null ) {
			
			Utils.checkParamType( action, "function", "Button action" )
			
			if ( this.action == null ) {
				
				this.clickHandler = buttonClickedHandler.bind( this );
				this.element.addEventListener( "click", this.clickHandler );
				
			}
			
			this.action = action;
			
		} else if ( this.action != null ) {
			
			this.element.removeEventListener( "click", this.clickHandler );
			this.clickHandler = null;
			this.action = null;
			
		}
		
	};
	
	PaginationButton.prototype.updateRenderer = function() {
		
		if ( this.renderer != null ) {
			
			let res = this.renderer( this.system );
			
			this.element.classList.toggle( "disabled", this.disabled = res.disabled );
			
			if ( res.text != null )
				this.element.textContent = res.text;
			
		}
		
	};
	
	PaginationButton.prototype.setRenderer = function( renderer ) {

		this.renderer = renderer == null ? null : Utils.checkParamType( renderer, "function", "Button renderer" );
		this.updateRenderer();
		
	};
	
	function buttonClickedHandler() {
		
		if ( this.disabled )
			return;
		
		let page = this.action( this.system );
		
		if ( this.system.triggerListeners( page ) )
			this.system.setPage( page );
		
	}
	
	function newSystem( containerSelector ) {
		
		Utils.checkParamType( containerSelector, "string", "Pagination container selector" );
		
		let container = document.querySelector( containerSelector );
		
		if ( container == null )
			throw "Invalid pagination container selector.";
		
		let id;
		
		do {
			
			id = Utils.randomInt();
			
		} while ( id in systems );
		
		return systems[ id ] = new PaginationSystem( id, container );
		
	}
	
	return {
		newSystem: newSystem
	};
	
}());

const Table = (function(){
	
	const VALID_CONTAINER_TAGS = [ "TABLE", "THEAD", "TBODY", "TFOOT" ];
	const CELL_ID_ATTR = "data-cell-id";
	
	const SAMPLE_ROW_CONSTRUCTOR = function( index, row, item ) {};
	
	function build( tableContainerSelector, items, constructors, destructors ) {
		
		let container = document.querySelector( tableContainerSelector );
		
		if ( container == null || VALID_CONTAINER_TAGS.indexOf( container.tagName ) == -1 )
			throw "Invalid table container element.";
		
		if ( container.tagName === "TABLE" ) {
			
			let tbody = container.querySelector("tbody");
			
			if ( tbody == null ) {
				
				tbody = document.createElement("tbody");
				container.appendChild( tbody );
				
			}
			
			container = tbody;
			
		}
		
		Utils.checkParamType( tableContainerSelector, "string", "Table container selector" );
		Utils.checkArrayType( items, "Table items" );
		Utils.checkArrayType( constructors, "Table constructors" );
		
		if ( typeof destructors !== "object" )
			destructors = {};
		
		let itemsCount = items.length;
		
		let childRows = container.querySelectorAll("tr");
		let childRowsCount = childRows.length;
		
		let rowElt;
		
		let rowChildCells;
		let rowChildCell;
		let rowChildCellId;
		
		let constructor;
		let destructor;
		
		let i = 0, j;
		
		for ( ; i < Math.max( itemsCount, childRowsCount ); i++ ) {
			
			if ( i < childRowsCount ) {
				
				rowElt = childRows[ i ];
				rowChildCells = rowElt.querySelectorAll("td");
				
				for ( let j = 0; j < rowChildCells.length; j++ ) {
					
					rowChildCell = rowChildCells[ j ];
					rowChildCellId = rowChildCell.getAttribute( CELL_ID_ATTR );
					
					if ( rowChildCellId != null ) {
						
						destructor = destructors[ rowChildCellId ];
						
						if ( destructor != null )
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
				
				for ( j = 0; j < constructors.length; j++ ) {
					
					constructor = constructors[ j ];
					
					if ( typeof constructor.id !== "string" || typeof constructor.func !== "function" )
						return;
					
					let cell = document.createElement("td");
					rowElt.appendChild( cell );
					cell.setAttribute( CELL_ID_ATTR, constructor.id );
					
					cells[ constructor.id ] = cell;
					
					constructor.func( cell, items[i], cells );
					
				}
				
			} else if ( rowElt !== null ) {
				container.removeChild( rowElt );
			}
			
		}
		
		/*
		for ( ; i < childRowsCount; i++ ) {
			
			
			
		}
		*/
		
	}
	
	function buildNew( containerSelector, items, constructors, destructors ) {
		
		Utils.checkParamType( container, "string", "Table container selector" );
		Utils.checkArrayType( items, "Table items" );
		Utils.checkArrayType( constructors, "Table constructors" );
		
		if ( typeof destructors !== "object" )
			destructors = {};
		
		let container = document.querySelector( containerSelector );
		
		if ( container == null || VALID_CONTAINER_TAGS.indexOf( container.tagName ) == -1 )
			throw "Invalid table container element.";
		
		if ( container.tagName === "TABLE" ) {
			
			let tbody = container.querySelector("tbody");
			
			if ( tbody == null ) {
				
				tbody = document.createElement("tbody");
				container.appendChild( tbody );
				
			}
			
			container = tbody;
			
		}
		
		let itemsCount = items.length;
		let itemsRowsCount = itemsCount * constructors.length;
		let item;
		
		let childRows = container.querySelectorAll("tr");
		let childRowsCount = childRows.length;
		
		let rowElt;
		
		let childCells;
		let childCellsCount;
		let childCell;
		
		let rowConstructors;
		let constructor;
		
		let i = 0, j, k;
		
		for ( ; i < Math.max( itemsRowsCount, childRowsCount ); i++ ) {
			
			item = items[ i ];
			
			for ( j = 0; j < constructors.length; j++ ) {
				
				rowConstructors = constructors[ j ];
				
				for ( k = 0; k < rowConstructors.length; k++ ) {
					
					constructor = rowConstructors[ k ];
					
					
					
				}
				
				/*
				rowIdx = constructor.row;
				
				if ( typeof rowIdx === "function" ) {
					rowIdx = rowIdx( item );
				}
				
				if ( !Utils.isInt( rowIdx ) ) {
					
					console.warning( "Invalid row index given when building table '" + containerSelector + "'." );
					rowIdx = 0;
					
				}
				
				maxRowIdx = Math.max( maxRowIdx, rowIdx );
				rowIdx += firstRowIdx;
				
				rowElt = childRows[ rowIdx ];
				
				if ( rowElt == null ) {
					
					let missingRowCount = childRowsCount - rowIdx + 1;
					
					for ( k = 0; k < missingRowCount; k++ ) {
						
						rowElt = document.createElement("tr");
						
						if ( typeof rowConstructor === "function" )
							rowConstructor( childRowsCount + k, rowElt, item );
						
						container.appendChild( rowElt );
						
					}
					
					childRows = container.querySelectorAll("tr");
					childRowsCount = childRows.length;
					
				}
				
				childCells = rowElt.querySelectorAll("td");
				childCellsCount = childCells.
				*/
				
			}
			
			// firstRowIdx += maxRowIdx + 1;
			
		}
		
	}
	
	return {
		build: build
	};
	
}());

const Form = (function(){
	
	const fieldHandlers = {};
	const forms = {};
	
	function registerFieldHandler( identifier, handler ) {
		
		Utils.checkParamType( identifier, "string", "Field handler identifier" );
		Utils.checkParamType( handler, "function", "Field handler" );
		
		if ( identifier in fieldHandlers )
			throw "This field handler identifier is already used.";
		
		fieldHandlers[ identifier ] = handler;
		
	}
	
	function getFieldValue( field ) {
		
		let handler, value;
		for ( let identifier in fieldHandlers ) {
			
			handler = fieldHandlers[ identifier ];
			value = handler( field );
			
			if ( value != null )
				return value;
			
		}
		
		return null;
		
	}
	
	function getFormValues( form ) {
		
		Utils.checkParamType( form, "string", "Form identifier" );
		
		let selector = "[name^='" + form + ":'], [data-form='" + form + "']";
		let values = {};
		let fnlen = form.length + 1; // Used to remove 
		
		let fields = document.querySelectorAll( selector );
		let field, name;
		
		for ( let i = 0; i < fields.length; i++ ) {
			
			field = fields[ i ];
			
			if ( field.hasAttribute("name") ) {
				name = field.getAttribute("name").substring( fnlen );
			} else {
				name = field.getAttribute("data-field");
			}
			
			if ( name == null || name == "" )
				continue;
			
			values[ name ] = getFieldValue( field );
			
		}
		
		return values;
		
	}
	
	function postFormQuery( form, queryName, fn ) {
		Query.post( queryName, collectForm( form ), fn );
	}
	
	function getFormData( form ) {
		
		Utils.checkParamType( form, "string", "Form identifier" );
		
		let formData = forms[ form ];
		
		if ( formData == null ) {
			
			formData = forms[ form ] = {
				valid: false,
				fields: {},
				submitAction: null,
				submitElements: []
			};
			
			formData.fieldEnterEvent = function( e ) {
				if ( e.key === "Enter" || e.keyCode === 13 || e.which === 13 ) {
					if ( this.valid ) this.submitAction();
				}
			}.bind( formData );
			
		}
		
		return formData;
		
	}
	
	function getFieldData( form, field ) {
		
		Utils.checkParamType( form, "string", "Form identifier" );
		Utils.checkParamType( field, "string", "Field identifier" );
		
		let selector = "[name='" + form + ":" + field + "'], [data-form='" + form + "'][data-field='" + field + "']";
		let fieldElement = document.querySelector( selector );
		
		if ( fieldElement == null )
			return null;
		
		let formData = getFormData( form );
		let formFields = formData.fields;
		
		let fieldData = formFields[ field ];
		
		if ( fieldData == null ) {
			
			fieldData = formFields[ field ] = {
				valid: true,
				checkers: [],
				element: fieldElement,
				event: null,
				subfields: {},
				enterEvent: false
			};
			
		}
		
		return fieldData;
		
	}
	
	function getField( form, field ) {
		
		let data = getFieldData( form, field );
		return data == null ? null : data.element;
		
	}
	
	function getFormSubmits( form ) {
		return document.querySelectorAll("[data-form-submit='" + form + "']");
	}
	
	function setFormSubmitAction( form, callback ) {

		Utils.checkParamType( form, "string", "Form identifier" );
		
		let formData = getFormData( form );
		
		if ( formData.submitElements.length !== 0 && formData.submitAction != null ) {
			
			Utils.each( formData.submitElements, function( e ) {
				e.removeEventListener( "click", formData.submitAction );
			} );
			
		}
		
		formData.submitAction = callback;
		formData.submitElements = getFormSubmits( form );
		
		if ( callback != null ) {
			
			Utils.each( formData.submitElements, function( e ) {
				e.addEventListener( "click", callback );
			} );
			
		}
		
	}
	
	function addEnterKeyListener( form, fields ) {

		Utils.checkParamType( form, "string", "Form identifier" );
		
		if ( !Array.isArray( fields ) )
			fields = [ fields ];
		
		let formData = getFormData( form );
		
		Utils.each( fields, function( field ) {
			
			let fieldData = getFieldData( form, field );
			if ( fieldData == null ) return;
			if ( fieldData.enterEvent ) return;
			
			fieldData.element.addEventListener( "keyup", formData.fieldEnterEvent );
			
		} );
		
	}
	
	function removeEnterKeyListener( form, fields ) {

		Utils.checkParamType( form, "string", "Form identifier" );
		
		if ( !Array.isArray( fields ) )
			fields = [ fields ];
		
		let formData = getFormData( form );
		
		Utils.each( fields, function( field ) {
			
			let fieldData = getFieldData( form, field );
			if ( fieldData == null ) return;
			if ( !fieldData.enterEvent ) return;
			
			fieldData.element.removeEventListener( "keyup", formData.fieldEnterEvent );
			
		} );
		
	}
	
	function clearEnterKeyListeners( form ) {
		
		Utils.checkParamType( form, "string", "Form identifier" );
		
		let formData = getFormData( form );
		
		Utils.each( formData.fields, function( fieldData ) {
			
			if ( fieldData.enterEvent )
				fieldData.element.removeEventListener( "keyup", formData.fieldEnterEvent );
			
		} );
		
	}
	
	function addChecker( form, field, checker, index ) {

		Utils.checkParamType( form, "string", "Form identifier" );
		Utils.checkParamType( field, "string", "Field identifier" );
		Utils.checkParamType( checker, "function", "Checker function" );
		
		let fieldData = getFieldData( form, field );
		
		if ( fieldData == null )
			return;
		
		if ( Array.isArray( checker.subfields ) ) {
			
			let fieldSubfields = fieldData.subfields;
			
			Utils.each( checker.subfields, function( subfield ) {
				
				if ( fieldSubfields[ subfield ] == null ) {
					
					let fieldElement = getField( form, subfield );
					
					fieldSubfields[ subfield ] = function() {
						processCheck( form, field );
					};
					
					fieldElement.addEventListener( "keyup", fieldSubfields[ subfield ] );
					
				}
				
			} );
			
		}
		
		let checkers = fieldData.checkers;
		
		if ( index == null ) {
			checker.push( checker );
		} else {
			
			if ( index < 0 || index > checkers.length )
				throw "Invalid checker index";
			
			checkers.splice( index, 0, checker );
			
		}
		
		if ( checkers.length === 1 ) {
			
			fieldData.event = function() {
				processCheck( form, field );
			};
			
			fieldData.element.addEventListener( "keyup", fieldData.event );
			
		}
		
		processCheck( form, field );
		
	}
	
	function clearCheckers( form, field ) {
		
		Utils.checkParamType( form, "string", "Form identifier" );
		Utils.checkParamType( field, "string", "Field identifier" );
		
		let fieldData = getFieldData( form, field );
		
		if ( fieldData == null )
			return;
		
		fieldData.element.removeEventListener( "keyup", fieldData.event );
		fieldData.event = null;
		fieldData.valid = true;
		
		let subfields = fieldData.subfields;
		let listener;
		
		for ( let subfield in subfields )
			getFieldData( form, subfield ).removeEventListener( "keyup", subfields[ subfield ] );
		
		fieldData.subfields = {};
		fieldData.checkers = [];
		
		processCheck( form, field );
		
	}
	
	function processCheck( form, field ) {
		
		Utils.checkParamType( form, "string", "Form identifier" );
		
		let formData = forms[ form ];
		
		if ( formData == null )
			return;
		
		let formFields = formData.fields;
		
		function fieldCheck( fieldName, fieldData ) {
			
			fieldData.valid = false;
			let fieldCheckers = fieldData.checkers;
			
			let fieldElement = fieldData.element;
			let fieldValue = getElementValue( fieldElement );
			
			Utils.each( fieldCheckers, function( checker ) {
				
				if ( !fieldData.valid )
					return;
				
				let msg = checker( fieldElement, fieldValue, form, fieldName );
				
				if ( msg !== false )
					fieldData.valid = false;
				
			} );
			
			// TODO : Vérifier s'il n'y a pas moyen de rendre plus universel ceci :
			const valid = ( typeof fieldValue === "string" && fieldValue.length === 0 ) || fieldData.valid;
			fieldElement.classList.toggle( "invalid", !valid );
			
		}
		
		formData.valid = true;
		
		if ( field != null ) {
			
			let fieldData = formFields[ field ];
			
			if ( fieldData == null )
				return;
			
			fieldCheck( field, fieldData );
			
		}
		
		let fieldData;
		for ( let fieldName in formFields ) {
			
			fieldData = formFields[ fieldName ];
			
			if ( field == null )
				fieldCheck( fieldName, fieldData );
			
			if ( !fieldData.valid )
				formData.valid = false;
			
		}
		
		Utils.each( getFormSubmits( form ), function( elt ) {
			elt.disabled = !formData.valid;
		} );
		
	}
	
	function addCheckerSubfields( callback, subfields ) {

		Utils.checkParamType( callback, "function", "Checker callback function" );
		callback.subfields = subfields;
		return callback;
		
	}
	
	function validEmailChecker( field, val ) {
		return Utils.validateEmail( val ) ? false : "invalid_email";
	}
	
	function notEmptyChecker( field, val ) {
		return val.length === 0 ? "empty" : false;
	}
	
	function createRegexChecker( regex ) {
		
		if ( regex == null )
			throw "Null regex";
		
		return function( field, val ) {
			return this.regex.test( val ) ? false : "regex_not_correspond";
		}.bind( { regex: regex } );
		
	}
	
	function createLengthChecker( min, max ) {
		
		if ( min == null && max == null )
			throw "Both min and max are nulls";
		
		return function( field, val ) {
			
			if ( typeof val !== "string" )
				return false;
			
			let length = val.length;
			
			if ( min != null && length < min )
				return "too_short";
			
			if ( max != null && length > max )
				return "too_long";
			
			return false;
			
		}.bind( { min: min, max: max } );
		
	}
	
	function createConfirmPasswordChecker( referencePasswordField ) {
		
		Utils.checkParamType( referencePasswordField, "string", "Reference password field" );
		
		return addCheckerSubfields( function( field, val, form, field ) {
			
			if ( typeof val !== "string" )
				return false;
			
			if ( field === this.referencePasswordField )
				return false;
			
			let referenceField = getField( form, this.referencePasswordField );
			
			return val === getElementValue( referenceField ) ? false : "invalid_confirm_password";
			
		}.bind( { referencePasswordField: referencePasswordField } ), [ referencePasswordField ] );
		
	}
	
	return {
		registerFieldHandler: registerFieldHandler,
		getFormValues: getFormValues,
		postFormQuery: postFormQuery,
		getFormData: getFormData,
		getFieldData: getFieldData,
		getField: getField,
		getFormSubmits: getFormSubmits,
		getFormSubmits: getFormSubmits,
		setFormSubmitAction: setFormSubmitAction,
		addEnterKeyListener: addEnterKeyListener,
		removeEnterKeyListener: removeEnterKeyListener,
		clearEnterKeyListeners: clearEnterKeyListeners,
		addChecker: addChecker,
		clearCheckers: clearCheckers,
		processCheck: processCheck,
		addCheckerSubfields: addCheckerSubfields,
		VALID_EMAIL_CHECKER: validEmailChecker,
		NOT_EMPTY_CHECKER: notEmptyChecker,
		createRegexChecker: createRegexChecker,
		createLengthChecker: createLengthChecker
	};
	
}());

// Registering Standard defaults fields handlers.

Form.registerFieldHandler( "std-input", function( field ) {
	
	if ( field.tagName !== "INPUT" )
		return null;
	
	const CHECKABLE_TYPES = [ "checkbox", "radio" ];
	return CHECKABLE_TYPES.indexOf( field.type ) === -1 ? field.value : field.checked;
	
} );

Form.registerFieldHandler( "std-textarea", function( field ) {
	return field.tagName === "TEXTAREA" ? field.value : null;
} );

Form.registerFieldHandler( "std-select", function( field ) {
	
	if ( field.tagName !== "SELECT" )
		return null;
	
	if ( field.multiple ) {
		
		let vals = [];
		let options = field.options;
		let opt;
		
		for ( let i = 0; i < options.length; i++ ) {
			
			opt = options[ i ]
			
			if ( opt.selected )
				val.push( opt.value );
			
		}
		
		return vals;
		
	} else return field.value;
	
} );