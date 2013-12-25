/*
 _       __                          __                                 _     
| |     / /__        _________  ____/ /__        ____ ___  ____ _____ _(_)____
| | /| / / _ \______/ ___/ __ \/ __  / _ \______/ __ `__ \/ __ `/ __ `/ / ___/
| |/ |/ /  __/_____/ /__/ /_/ / /_/ /  __/_____/ / / / / / /_/ / /_/ / / /__  
|__/|__/\___/      \___/\____/\__,_/\___/     /_/ /_/ /_/\__,_/\__, /_/\___/  
                                                              /____/          
jQuery.isAlive(1.7.1)
Written by George Cheteles (george@we-code-magic.com).
Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
Please attribute the author if you use it.
Find me at:
	http://www.we-code-magic.com 
	george@we-code-magic.com
Last modification on this file: 25 December 2013 (Merry Christmas)
*/

(function(jQuery) {
	
	/*THIS IS THE MAIN ARRAY THAT KEEPS ALL THE OBJECTS*/
	var isAliveObjects = [];
	var isReady = false;
	var browserObj = null;
	var vPTransition = null;
	var indexOf = null;
	
	var resizeTimer;
	var windowWidth;
	var windowHeight;
	
	/*FIXES CSS3 TRANSITION DURATION BUG*/
	function breakCSS3(property,value){
		var success = false;
		var fix = function(value,format){
			if(value.indexOf(' ')!=-1){
				value = value.split(' ');
				for(var key in value)
					value[key] = fix(value[key],format);
				return value.join(' ');
			}
			if(value.indexOf('(')!=-1){
				format = value.substr(0,value.indexOf('('));
				if(format=='url')
					return value;
				value = value.substr(value.indexOf('(')+1,value.indexOf(')')-value.indexOf('(')-1);
				return format + '(' + fix(value,format) + ')';
			}
			if(value.indexOf(',')!=-1){
				value = value.split(',');
				for(var key in value)
					value[key] = fix(value[key],format);
				return value.join(',');
			}
			if(success)
				return value;
			if(value.indexOf('px')!=-1 || value.indexOf('%')!=-1 || value.indexOf('em')!=-1 || value.indexOf('deg')!=-1){
				var fNumber = value.match(/[-]?[0-9]*\.?[0-9]+/)[0];
				if(fNumber!=null){
					success = true;
					return value.replace(fNumber,parseFloat(fNumber)+0.01);
				}
			}
			if(format!=null){
				if(format=='rgb' || format=='rgba'){
					success = true;
					if(value<255)
						return parseInt(value) + 1;
					else
						return parseInt(value) - 1;
				}
				if(property==vP('transform')){
					if(format.indexOf('matrix')==0 || format.indexOf('scale')==0){
						success = true;
						return parseFloat(value) + 0.001;
					}
				}
				if(property=='-webkit-filter'){
					if(format=='grayscale' || format=='sepia' || format=='invert' || format=='opacity'){
						if(value<=0.5)
							value = parseFloat(value) + 0.001;
						else
							value = parseFloat(value) - 0.001;
						success = true;
						return value;
					}
					if(format=='brightness' || format=='contrast' || format=='saturate'){
						success = true;
						return parseFloat(value) + 0.001;
					}
				}
			}
			return value;
		}
		if(property=='opacity'){
			if(value<=0.5)
				value = parseFloat(value) + 0.001;
			else
				value = parseFloat(value) - 0.001;
		} else if(isNumber(value))
			value = parseFloat(value) + 0.01;
		else
			value = fix(value,null);
		return value;
	}
	
	/*EASING TO BEZIER*/
	function convertEasing(value){
		var easings = {'swing':'0.02,0.01,0.47,1','easeInSine':'0.47,0,0.745,0.715','easeOutSine':'0.39,0.575,0.565,1','easeInOutSine':'0.445,0.05,0.55,0.95','easeInQuad':'0.55,0.085,0.68,0.53','easeOutQuad':'0.25,0.46,0.45,0.94','easeInOutQuad':'0.455,0.03,0.515,0.955','easeInCubic':'0.55,0.055,0.675,0.19','easeOutCubic':'0.215,0.61,0.355,1','easeInOutCubic':'0.645,0.045,0.355,1','easeInQuart':'0.895,0.03,0.685,0.22','easeOutQuart':'0.165,0.84,0.44,1','easeInOutQuart':'0.77,0,0.175,1','easeInQuint':'0.755,0.05,0.855,0.06','easeOutQuint':'0.23,1,0.32,1','easeInOutQuint':'0.86,0,0.07,1','easeInExpo':'0.95,0.05,0.795,0.035','easeOutExpo':'0.19,1,0.22,1','easeInOutExpo':'1,0,0,1','easeInCirc':'0.6,0.04,0.98,0.335','easeOutCirc':'0.075,0.82,0.165,1','easeInOutCirc':'0.785,0.135,0.15,0.86','easeInBack':'0.6,-0.28,0.735,0.045','easeOutBack':'0.175,0.885,0.32,1.275','easeInOutBack':'0.68,-0.55,0.265,1.55'};
		if(typeof(easings[value])!='undefined')
			return 'cubic-bezier('+easings[value]+')';
		return value;
	}
	
	/*FIX SPACES FOR CSS VALUES*/
	function fixSpaces(params){
		if(params.indexOf(' ')==-1)
			return params;
		params = jQuery.trim(params).split(' ');
		var ret = [];
		for(var key in params)
			if(params[key]!="")
				ret.push(params[key]);
		params = ret.join(' ');
		if(params.indexOf('(')!=-1){
			var bracketCount = 0;
			ret = "";
			for(var c=0;c<params.length;c++){
				if(params.charAt(c)=='(')
					bracketCount++;
				else if(params.charAt(c)==')')
					bracketCount--;
				if(params.charAt(c)!=' ' || (params.charAt(c)==' ' && bracketCount==0))
					ret = ret + params.charAt(c);
			}
			params = ret;
		}
		return params;
	}
	
	/*CHECK IF FUNCTION IS COMPATIBLE WITH JQUERY*/
	function canJQueryAnimate(property){
		var allowed = ('borderWidth,borderBottomWidth,borderLeftWidth,borderRightWidth,borderTopWidth,borderSpacing,margin,marginBottom,marginLeft,marginRight,marginTop,outlineWidth,padding,paddingBottom,paddingLeft,paddingRight,paddingTop,height,width,maxHeight,maxWidth,minHeight,minWidth,fontSize,bottom,left,right,top,letterSpacing,wordSpacing,lineHeight,textIndent,opacity,scrollLeft,scrollTop').split(',');
		if(property.indexOf('-')!=-1){
			property = property.toLowerCase().split('-');
			for(var key in property)
				if(key>0)
					property[key] = property[key].charAt(0).toUpperCase()+property[key].substr(1);
			property = property.join('');
		}
		return (indexOf(allowed,property)!=-1); 
	}
	
	/*GET TEXT BETWEEN BRACKETS*/
	function getBetweenBrackets(text,doEval){
		var lastBracket;
		for(lastBracket=text.length;lastBracket>=0;lastBracket--)
			if(text.charAt(lastBracket)==')')
				break;
		if(typeof(doEval)=='undefined')
			return text.substr(text.indexOf('(')+1,lastBracket-text.indexOf('(')-1);
		var evalExp = text.substr(text.indexOf('(')+1,lastBracket-text.indexOf('(')-1);
		try{
			eval("evalExp = "+evalExp+';');
		}catch(err){}
		return evalExp + text.substr(lastBracket+1,text.length-lastBracket-1);
	}
	
	/*CONVERT COLORS TO CODE*/
	function nameToRgb(name){
		var colors={"aliceblue":"240,248,255","antiquewhite":"250,235,215","aqua":"0,255,255","aquamarine":"127,255,212","azure":"240,255,255","beige":"245,245,220","bisque":"255,228,196","black":"0,0,0","blanchedalmond":"255,235,205","blue":"0,0,255","blueviolet":"138,43,226","brown":"165,42,42","burlywood":"222,184,135","cadetblue":"95,158,160","chartreuse":"127,255,0","chocolate":"210,105,30","coral":"255,127,80","cornflowerblue":"100,149,237","cornsilk":"255,248,220","crimson":"220,20,60","cyan":"0,255,255","darkblue":"0,0,139","darkcyan":"0,139,139","darkgoldenrod":"184,134,11","darkgray":"169,169,169","darkgreen":"0,100,0","darkkhaki":"189,183,107","darkmagenta":"139,0,139","darkolivegreen":"85,107,47","darkorange":"255,140,0","darkorchid":"153,50,204","darkred":"139,0,0","darksalmon":"233,150,122","darkseagreen":"143,188,143","darkslateblue":"72,61,139","darkslategray":"47,79,79","darkturquoise":"0,206,209","darkviolet":"148,0,211","deeppink":"255,20,147","deepskyblue":"0,191,255","dimgray":"105,105,105","dodgerblue":"30,144,255","firebrick":"178,34,34","floralwhite":"255,250,240","forestgreen":"34,139,34","fuchsia":"255,0,255","gainsboro":"220,220,220","ghostwhite":"248,248,255","gold":"255,215,0","goldenrod":"218,165,32","gray":"128,128,128","green":"0,128,0","greenyellow":"173,255,47","honeydew":"240,255,240","hotpink":"255,105,180","indianred ":"205,92,92","indigo ":"75,0,130","ivory":"255,255,240","khaki":"240,230,140","lavender":"230,230,250","lavenderblush":"255,240,245","lawngreen":"124,252,0","lemonchiffon":"255,250,205","lightblue":"173,216,230","lightcoral":"240,128,128","lightcyan":"224,255,255","lightgoldenrodyellow":"250,250,210","lightgrey":"211,211,211","lightgreen":"144,238,144","lightpink":"255,182,193","lightsalmon":"255,160,122","lightseagreen":"32,178,170","lightskyblue":"135,206,250","lightslategray":"119,136,153","lightsteelblue":"176,196,222","lightyellow":"255,255,224","lime":"0,255,0","limegreen":"50,205,50","linen":"250,240,230","magenta":"255,0,255","maroon":"128,0,0","mediumaquamarine":"102,205,170","mediumblue":"0,0,205","mediumorchid":"186,85,211","mediumpurple":"147,112,216","mediumseagreen":"60,179,113","mediumslateblue":"123,104,238","mediumspringgreen":"0,250,154","mediumturquoise":"72,209,204","mediumvioletred":"199,21,133","midnightblue":"25,25,112","mintcream":"245,255,250","mistyrose":"255,228,225","moccasin":"255,228,181","navajowhite":"255,222,173","navy":"0,0,128","oldlace":"253,245,230","olive":"128,128,0","olivedrab":"107,142,35","orange":"255,165,0","orangered":"255,69,0","orchid":"218,112,214","palegoldenrod":"238,232,170","palegreen":"152,251,152","paleturquoise":"175,238,238","palevioletred":"216,112,147","papayawhip":"255,239,213","peachpuff":"255,218,185","peru":"205,133,63","pink":"255,192,203","plum":"221,160,221","powderblue":"176,224,230","purple":"128,0,128","red":"255,0,0","rosybrown":"188,143,143","royalblue":"65,105,225","saddlebrown":"139,69,19","salmon":"250,128,114","sandybrown":"244,164,96","seagreen":"46,139,87","seashell":"255,245,238","sienna":"160,82,45","silver":"192,192,192","skyblue":"135,206,235","slateblue":"106,90,205","slategray":"112,128,144","snow":"255,250,250","springgreen":"0,255,127","steelblue":"70,130,180","tan":"210,180,140","teal":"0,128,128","thistle":"216,191,216","tomato":"255,99,71","turquoise":"64,224,208","violet":"238,130,238","wheat":"245,222,179","white":"255,255,255","whitesmoke":"245,245,245","yellow":"255,255,0","yellowgreen":"154,205,50"};
		if(typeof(colors[name.toLowerCase()])!="undefined"){
			if(!browserObj.msie || (browserObj.msie && parseInt(browserObj.version)>=9))
				return "rgba("+colors[name.toLowerCase()]+",1)";
			else
				return "rgb("+colors[name.toLowerCase()]+")";
		}
		return false;
	}
	
	/*CONVERTING HEX TO RGB*/
	function hexToRgb(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if(result){
			if(!browserObj.msie || (browserObj.msie && parseInt(browserObj.version)>=9))
				return "rgba("+parseInt(result[1],16)+","+parseInt(result[2],16)+","+parseInt(result[3], 16)+",1)";
			else
				return "rgb("+parseInt(result[1],16)+","+parseInt(result[2],16)+","+parseInt(result[3], 16)+")";
		}
		return false;
	}	
	/*ACTION ON RESIZE*/
	function onResizeAction(e){
		var key;
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function(){
			if(windowWidth!=jQuery(window).width() || windowHeight!=jQuery(window).height()){
				windowWidth = jQuery(window).width();
				windowHeight = jQuery(window).height();
				for(key in isAliveObjects)
					if(isAliveObjects[key].settings.rebuildOnResize)
						isAliveObjects[key].rebuildLayout();
			}
				
		},250);
	}
	
	/*VALIDATES BROWSERS*/
	function validateBrowsers(exp){
		var isValid = function(browser){
			var validBrowser = false;
			if(browserObj[browser]) validBrowser = true;
			if(browser=="msie7-" && browserObj.msie && parseInt(browserObj.version)<7) validBrowser = true;
			if(browser=="msie7" && browserObj.msie && parseInt(browserObj.version)==7) validBrowser = true;
			if(browser=="msie8" && browserObj.msie && parseInt(browserObj.version)==8) validBrowser = true;
			if(browser=="msie9" && browserObj.msie && parseInt(browserObj.version)==9) validBrowser = true;
			if(browser=="msie10" && browserObj.msie && parseInt(browserObj.version)==10) validBrowser = true;
			if(browser=="msie11" && browserObj.msie && parseInt(browserObj.version)==11) validBrowser = true;
			if(browser=="msie11+" && browserObj.msie && parseInt(browserObj.version)>11) validBrowser = true;
			if(browser=="unknown" && typeof(browserObj.webkit)=="undefined" && typeof(browserObj.mozilla)=="undefined" && typeof(browserObj.opera)=="undefined" && typeof(browserObj.msie)=="undefined") validBrowser = true;
			return validBrowser;
		}
		var valid = false;
		exp = exp.split("|");
		for(var key in exp){
			if(exp[key].indexOf("&")!=-1){
				var temp = exp[key].split("&");
				if(temp.length==2 && isValid(temp[0]) && isValid(temp[1]))
					valid = true;
			} else if(exp[key].indexOf("!")!=-1){
				var temp = exp[key].split("!");
				if(temp.length==2 && isValid(temp[0]) && !isValid(temp[2]))
					valid = true;
			} else if(isValid(exp[key]))
				valid = true;
		}
		return valid;
	}

	/*CONVERT TO STRING*/
	function toString(value){
		if(typeof(value)=='function')
			return sdbmCode(value.toString()).toString();
		return value.toString();
	}
	
	/*MAKES UNIQUE HASH FOR A STRING*/
	function sdbmCode(str){
		var hash = 0;
		for (var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			hash = c + (hash << 6) + (hash << 16) - hash;
		}
		return hash;
	}
	
	/*CHECKS IF NUMBER*/
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	/* DETECTS BROWSER / ENGINE / VERSION */
	function getBrowser(){
		/* DEPRECATED FUNCTION COPIED FROM "jQuery JavaScript Library v1.8.2"*/ 
		var matched, browser;
		var userAgent = (navigator.userAgent||navigator.vendor||window.opera);
		jQuery.uaMatch = function(ua) {
			ua = ua.toLowerCase();
			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];
			return {
				browser: match[1] || "",
				version: match[2] || "0"
			};
		};
		matched = jQuery.uaMatch( navigator.userAgent );
		browser = {};
		var mobile = (/(android|bb\d+|meego).+mobile|webos|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0,4)));
		if(mobile)
			browser.mobile = true;
		if(matched.browser) {
			browser[ matched.browser ] = true;
			browser.version = matched.version;
		}
		if(browser.chrome) {
			browser.webkit = true;
		} else if(browser.webkit) {
			browser.safari = true;
		}
		if(browser.mozilla) {
			if((/Trident\/7\./).test(navigator.userAgent)){
				delete browser.mozilla;
				browser.msie = true;
			}
		}
		return browser;
	}
	
	/* CHECKS PROPERTY IS CSS3 */
	function isCSS3(property){
		var CSS3 = ['transform','trasition','border-radius','background-size','box-shadow','text-shadow'];
		return (indexOf(CSS3,property)!=-1);
	}
	
	/* CHECKS IF PARAMS ARE DETECTED */
	function isDinamic(params){
		if(typeof(params) == "function")
			return true;
		if(params.toString().indexOf('eval(')!==-1)
			return true;
		return false;
	}

	/*MAKES THE CSS CHANGES FOR EACH BROWSER*/
	function vP(property){
		if(indexOf(['transform','trasition','transition-property','transition-duration','transition-timing-function','transition-delay'],property)!=-1){
			if(browserObj.webkit)
				return "-webkit-"+property;
			if(browserObj.mozilla)
				return "-moz-"+property;
			if(browserObj.msie && parseInt(browserObj.version)>=9)
				return "-ms-"+property;
			if(browserObj.opera)
				return "-o-"+property;
		}
		return property;
	}
	
	/*CALCULATE THE CSS PROPERTY AT A POSITION*/
	function getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd){
		valStart = valStart.toString(); 
		valEnd = valEnd.toString();
		var doRecursive = function(valStart,valEnd,colorFound){
			if(valStart==valEnd)
				return valStart;
			if(valStart.indexOf(' ')!=-1){
				var value = [];
				valStart = valStart.split(' '); 
				valEnd = valEnd.split(' ');
				for(var key in valStart)
					value.push(doRecursive(valStart[key],valEnd[key]));
				return value.join(' '); 
			}
			if(valStart.indexOf('(')!=-1){
				var format = valStart.substr(0,valStart.indexOf('('));
				valStart = valStart.substr(valStart.indexOf('(')+1,valStart.indexOf(')')-valStart.indexOf('(')-1);
				valEnd = valEnd.substr(valEnd.indexOf('(')+1,valEnd.indexOf(')')-valEnd.indexOf('(')-1);
				return format + '(' + doRecursive(valStart,valEnd,(format=='rgb' || format=='rgba')) + ')';
			}
			if(valStart.indexOf(',')!=-1){
				var value = [];
				valStart = valStart.split(','); 
				valEnd = valEnd.split(',');
				for(var key in valStart)
					value.push(doRecursive(valStart[key],valEnd[key],(colorFound && key<3)));
				return value.join(','); 
			}
			if(isNumber(valStart))
				var format = false;
			else{
				var format = valStart.replace(valStart.match(/[-]?[0-9]*\.?[0-9]+/)[0],'$');
				valStart = valStart.match(/[-]?[0-9]*\.?[0-9]+/)[0];
				valEnd = valEnd.match(/[-]?[0-9]*\.?[0-9]+/)[0];
			}
			valStart = parseFloat(valStart);
			valEnd = parseFloat(valEnd);
			var value = parseFloat(valStart+((valEnd-valStart)*((pos-stepStart)/(stepEnd-stepStart))));
			if(colorFound)
				return Math.round(Math.min(255,Math.max(0,value)));
			if(format!==false){
				return format.replace('$',value);
			}
			return value;
		}
		return doRecursive(valStart,valEnd);
	}
	
/*ISALIVE MAIN OBJECT:BEGIN*/	
	
	function isAlive(selector,options){
		
		this.mySelector = selector;
		this.TimeLine;
		this.step=0;
		this.lastStep=0;
		this.animating = false;
		this.forceAnimation = false;
		this.wheelTimer;
		this.animPositions = [];
		this.animateDuration;
		this.wipePosition;
		this.jumpPosition;
		this.animationType='none';
		this.allowWheel = true;
		this.allowTouch = true;
		this.scrollbarActive = null;
		this.waitWheellEnd = false;
		this.cssDinamicElements = [];
		this.params = {};
		this.onComplete = null;
		this.uniqId = Math.round(Math.random()*1000)+1;
		this.functionsArray = {};
		this.haveStepPoints;
		this.rebuildOnStop = false;
		this.dragHorizontal = null;
		this.scrollBarPosition = 0;
		this.CSS3DefaultTransitionArray = {};
		this.CSS3TransitionArray = {};
		this.CSS3ValuesArray = {};
		this.JSValuesArray = {};
		/* MY CLASS/SET ARRAYS */
		this.setArray = {};
		this.onOffClassArray = {};
		
		this.settings = jQuery.extend({}, {
			elements:{},
			elementsType:"linear", /*linear|tree*/
			duration: 1000,
			durationTweaks:{}, /*obj: {wheel|touch|scrollBar:duration|durationType|minStepDuration}*/
			enableWheel:true,
			wheelType:"scroll", /*scroll|jump*/
			jumpPoints:[],
			max:null,
			min:0,
			maxScroll:1000000,
			maxDrag:1000000,
			debug:false,
			easing:'linear',
			JSEasing:null,
			CSS3Easing:null,
			start:0,
			loop:false,
			preventWheel:true,
			stepPoints:[],
			stepPointsSelector:null,
			stepPointsActiveClass:null,
			enableTouch:false,
			touchType:'drag',/*drag|wipe*/
			touchActions:{up:1,down:-1,right:0,left:0},
			dragXFrom:10,
			dragYFrom:10,
			wipeXFrom:20,
			wipeYFrom:20,
			wipePoints:[],
			preventTouch:true,
			animateClass:'isalive-'+this.uniqId,
			rebuildOnResize:true,
			playPoints:[],
			stepsOnScroll:1,
			stepsOnDrag:1,
			stepsOnScrollbar:1,
			minStepDuration:0,
			initCSS:false,
			useCSS3:false,
			scrollbarType:'scroll',/*scroll|jump*/
			scrollbarPoints:[],
			scrollbarActiveClass:null,
			enableScrollbarTouch:false,
			wheelDelay:250, /*number or false*/
			enableGPU:false, /*false|true|webkit|chrome|safari|mobile*/
			useIdAttribute:false,
			onStep:null,
			onLoadingComplete:null,
			onRebuild:null
		},options);
		
		/*MAKES THE PLUGIN INITIOALIZATION*/
		this.initAnimations();

		/*CALL ONLOADINGCOMPLETE FUNCTION*/
		if(this.settings.onLoadingComplete!=null)
			this.settings.onLoadingComplete(selector);
		
	}

	/* LOGS IN DEBUGER */
	isAlive.prototype.log = function(value){
		if(this.settings.debug)
			jQuery('#isalive-'+this.uniqId+'-debuger').append('<br/>'+value);
	}

	/* GETS LOOP INCREMENTING POSITION */
	isAlive.prototype.l = function(val){
		return Math.floor(val/this.settings.max)*this.settings.max;
	}
	
	/* CONVERTS REAL POSITION TO RANGE POSITION */ 
	isAlive.prototype.getPos = function(val){
		if(val%this.settings.max<0)
			return this.settings.max+(val%this.settings.max);
		else
			return val%this.settings.max;
	}

	/*ANIMATE FUNCTION THAT WORKS FOR NON JQUERY ANIMATED PROPERTIES*/
	isAlive.prototype.animateCSS3 = function(selector,property,value,duration,easing){
		var thisObj = this;
		thisObj.CSS3TransitionArray[selector][property] = property+' '+duration+'ms '+easing;
		jQuery(selector).css(vPTransition,thisObj.getTransitionArray(selector));
		if(typeof(thisObj.CSS3ValuesArray[selector][property])!="undefined" && thisObj.CSS3ValuesArray[selector][property]==value)
			value = breakCSS3(property,value)
		thisObj.CSS3ValuesArray[selector][property] = value;
		jQuery(selector).css(property,value);
	}
	
	/*ANIMATE FUNCTION THAT WORKS FOR NON JQUERY ANIMATED PROPERTIES*/
	isAlive.prototype.animateJS = function(startPos,selector,property,value,duration,easing){
		var thisObj = this;
		if(typeof(thisObj.JSValuesArray[selector][property])=="undefined")
			thisObj.JSValuesArray[selector][property] = thisObj.animPositions[Math.round(thisObj.getPos(startPos))][selector][property].toString();
		var start = thisObj.JSValuesArray[selector][property];
		var end = value.toString();
		var tempObj = {};
		tempObj[property.replace(/-/g,"")+'Timer']="+=100";
		jQuery(selector).animate(tempObj,{duration:duration,easing:easing,queue:false,
			step: function(step,fx){
				var pos = step-fx.start;
				var value = getAtPosValue(pos,start,end,0,100);
				thisObj.setCSS(selector,property,value);
			}
		});
	}

	/*SET CSS VALUES*/
	isAlive.prototype.setCSS = function(selector,property,value){
		var thisObj = this;
		if(typeof(thisObj.functionsArray[property])!="undefined"){
			thisObj.JSValuesArray[selector][property] = value;
			thisObj.functionsArray[property](selector,value);
			return;
		}
		if(property=="scrollTop"){
			jQuery(selector).scrollTop(value);
			return;
		}
		if(property=="scrollLeft"){
			jQuery(selector).scrollLeft(value);
			return;
		}
		if(property==vPTransition){
			jQuery(selector).css(property,thisObj.getTransitionArray(selector,value));
			return;
		}
		if(typeof(thisObj.CSS3TransitionArray[selector])!="undefined" && typeof(thisObj.CSS3TransitionArray[selector][property])!="undefined"){
			delete thisObj.CSS3TransitionArray[selector][property];
			delete thisObj.CSS3ValuesArray[selector][property];
			jQuery(selector).css(vPTransition,thisObj.getTransitionArray(selector));
		}
		else if(typeof(thisObj.JSValuesArray[selector])!="undefined" && typeof(thisObj.JSValuesArray[selector][property])!="undefined")
			thisObj.JSValuesArray[selector][property] = value;
		
		jQuery(selector).css(property,value);
	}
	
	/* REPLACES PARAMS */
	isAlive.prototype.convertParams = function(params,format){
		var thisObj = this;
		var stringPositions = {top:"0%",center:"50%",bottom:"100%",left:"0%",right:"100%"};
		
		if(typeof(params)!="function"){
			params = params.toString();
			params = params.replace(/elementTop/g,thisObj.params.elementTop.toString());
			params = params.replace(/elementLeft/g,thisObj.params.elementLeft.toString());
			params = params.replace(/elementHeight/g,thisObj.params.elementHeight.toString());
			params = params.replace(/elementWidth/g,thisObj.params.elementWidth.toString());
			params = params.replace(/documentHeight/g,thisObj.params.documentHeight.toString());
			params = params.replace(/documentWidth/g,thisObj.params.documentWidth.toString());
			params = params.replace(/windowHeight/g,thisObj.params.windowHeight.toString());
			params = params.replace(/windowWidth/g,thisObj.params.windowWidth.toString());
		}
		else	
			params = params(thisObj.mySelector,thisObj.params).toString();
		
		var doRecursive = function(params){
			if(params.indexOf(' ')!=-1){
				params = params.split(' ');
				for(var key in params)
					params[key] = doRecursive(params[key]);
				return params.join(' ');
			}
			if(params.indexOf('(')!=-1 && params.substr(0,params.indexOf('('))!='eval'){
				var format = params.substr(0,params.indexOf('('));
				if(format=="url")
					return params;
				if(format=='rgb' && (!browserObj.msie || (browserObj.msie && parseInt(browserObj.version)>=9)))
					return 'rgba(' + doRecursive(getBetweenBrackets(params)) + ',1)';
				return format + '(' + doRecursive(getBetweenBrackets(params)) + ')';
			}
			if(params.indexOf(',')!=-1){
				params = params.split(',');
				for(var key in params)
					params[key] = doRecursive(params[key]);
				return params.join(',');
			}
			if(params.indexOf('(')!=-1 && params.substr(0,params.indexOf('('))=='eval')
				return getBetweenBrackets(params,true);
				
			if(typeof(stringPositions[params])!="undefined")	
				return stringPositions[params];

			if(params.charAt(0)=="#"){
				var convertValue = hexToRgb(params);
				if(convertValue!=false)
					return convertValue;
			}

			var convertValue = nameToRgb(params);
			if(convertValue!=false)
				return convertValue;
			
			return params;
		}
		
		params = doRecursive(fixSpaces(params));
		
		if(typeof(format)!='undefined')
			params = format.replace('(X)','('+params+')').replace('Xpx',params+'px').replace('X%',params+'%').replace('Xdeg',params+'deg').replace('Xem',params+'em');
		if(isNumber(params))
			return parseFloat(params);
			
		return params;
	}
	
	/* CREATES AND GETS CSS3 ARRAY */
	isAlive.prototype.getTransitionArray = function(selector,value){
		var thisObj = this;
		if(typeof(value)!="undefined"){
			thisObj.CSS3DefaultTransitionArray[selector] = {};
			if(value.indexOf('cubic-bezier')==-1)
				var tempArray = value.split(',');
			else{
				var tempArray = value.split('(');
				for (var key in tempArray){
					if(tempArray[key].indexOf(')')!=-1){
						tempArray[key] = tempArray[key].split(')');
						tempArray[key][0] = tempArray[key][0].replace(/,/g,'*char*');
						tempArray[key] = tempArray[key].join(')'); 
					}
				}
				tempArray = tempArray.join('(').split(',');
			}
			for(key in tempArray){
				var temp = tempArray[key].split(' ');
				var fix = vP(temp[0]);
				thisObj.CSS3DefaultTransitionArray[selector][fix] = tempArray[key].replace(temp[0],fix).replace(/\*char\*/g,","); 
			}
		}

		var tempObj = {};
		if(typeof(thisObj.CSS3DefaultTransitionArray[selector])!="undefined")
			tempObj = jQuery.extend(tempObj, thisObj.CSS3DefaultTransitionArray[selector]);
		if(typeof(thisObj.CSS3TransitionArray[selector])!="undefined")
			tempObj = jQuery.extend(tempObj, thisObj.CSS3TransitionArray[selector]);
			
		var rt = "";
		for(var key in tempObj){
			if(rt=="")
				rt = tempObj[key];
			else
				rt = rt + "," + tempObj[key];
		}
		if(rt=="")
			rt = "all 0s";
		return rt;
	}
	
	/*REMAKES PAGE LAYOUT*/
	isAlive.prototype.rebuildLayout = function(){
		var thisObj = this;
		var key,selector,property,valStart,valEnd,stepStart,stepEnd,value,pos,valUnder,valAbove,stepFrom,oldValue;
		var changedElements = [];
		
		if(!thisObj.animating){
			thisObj.params.windowWidth = jQuery(window).width();
			thisObj.params.windowHeight = jQuery(window).height();
			thisObj.params.documentWidth = jQuery(document).width();
			thisObj.params.documentHeight = jQuery(document).height();
			thisObj.params.elementHeight = jQuery(thisObj.mySelector).height();
			thisObj.params.elementWidth = jQuery(thisObj.mySelector).width();
			thisObj.params.elementTop = jQuery(thisObj.mySelector).offset().top;
			thisObj.params.elementLeft = jQuery(thisObj.mySelector).offset().left;
			
			/* RESET ALL DINAMIC ELEMENTS*/
			for(key in thisObj.cssDinamicElements){
				if(thisObj.cssDinamicElements[key]['method']=="static"){
					/*REPOSITION STATIC ELEMNTS*/
					selector = thisObj.cssDinamicElements[key]['selector'];
					property = thisObj.cssDinamicElements[key]['property'];
					value = thisObj.convertParams(thisObj.cssDinamicElements[key]['value'],thisObj.cssDinamicElements[key]['format']);
					thisObj.setCSS(selector,property,value);
				}
				else if(thisObj.cssDinamicElements[key]['method']=="animate"){
					/*REPOSITION ANIMATE*/	
					selector = thisObj.cssDinamicElements[key]['selector'];
					property = thisObj.cssDinamicElements[key]['property'];
					valStart = thisObj.convertParams(thisObj.cssDinamicElements[key]['value-start'],thisObj.cssDinamicElements[key]['format']);
					valEnd = thisObj.convertParams(thisObj.cssDinamicElements[key]['value-end'],thisObj.cssDinamicElements[key]['format']);
					if(thisObj.cssDinamicElements[key]['scrollbar']==true){
						thisObj.settings.elements[thisObj.cssDinamicElements[key]['key']]['value-start']=valStart;
						thisObj.settings.elements[thisObj.cssDinamicElements[key]['key']]['value-end']=valEnd;
					}
					stepStart = thisObj.cssDinamicElements[key]['step-start']
					stepEnd = thisObj.cssDinamicElements[key]['step-end']
					for(pos=stepStart;pos<=stepEnd;pos++){
						value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd);
						thisObj.animPositions[pos][selector][property]=value;
					}
					if(typeof(changedElements[selector])=="undefined")
						changedElements[selector] = [];
					if(indexOf(changedElements[selector],property)==-1)
						changedElements[selector].push(property);
				}
				else if(thisObj.cssDinamicElements[key]['method']=="set"){
					/*REPOSITION SET*/
					selector = thisObj.cssDinamicElements[key]['selector'];
					property = thisObj.cssDinamicElements[key]['property'];
					stepFrom = thisObj.cssDinamicElements[key]['step-from'];
					valAbove = thisObj.cssDinamicElements[key]['value-above'];
					if(isDinamic(valAbove)){
						valAbove = thisObj.convertParams(valAbove,thisObj.cssDinamicElements[key]['format']);
						thisObj.setArray['forward'][stepFrom][selector][property] = valAbove;
					}
					valUnder = thisObj.cssDinamicElements[key]['value-under'];
					if(isDinamic(valUnder)){
						valUnder = thisObj.convertParams(valUnder,thisObj.cssDinamicElements[key]['format']);
						thisObj.setArray['backward'][stepFrom][selector][property] = valUnder;
					}
					if(typeof(changedElements[selector])=="undefined")
						changedElements[selector] = [];
					if(indexOf(changedElements[selector],property)==-1)
						changedElements[selector].push(property);
				}
				else if(thisObj.cssDinamicElements[key]['method']=="animate-set"){
					/*REPOSITION ANIMATE-SET*/
					selector = thisObj.cssDinamicElements[key]['selector'];
					property = thisObj.cssDinamicElements[key]['property'];
					valStart = thisObj.convertParams(thisObj.cssDinamicElements[key]['value-start'],thisObj.cssDinamicElements[key]['format']);
					valEnd = thisObj.convertParams(thisObj.cssDinamicElements[key]['value-end'],thisObj.cssDinamicElements[key]['format']);
					stepStart = thisObj.cssDinamicElements[key]['step-start'];
					stepEnd = thisObj.cssDinamicElements[key]['step-end'];
					moveOn = thisObj.cssDinamicElements[key]['move-on'];
					for(pos=stepStart;pos<=stepEnd;pos++){
						if((pos-stepStart)%moveOn==0){
							value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd);
							if(pos>stepStart){
								thisObj.setArray['forward'][pos][selector][property] = value;
								thisObj.setArray['backward'][pos][selector][property] = oldValue;
							}
							oldValue = value;
						}
					}
					if(typeof(changedElements[selector])=="undefined")
						changedElements[selector] = [];
					if(indexOf(changedElements[selector],property)==-1)
						changedElements[selector].push(property);
				}
			}
			
			/* REMAKE THE PAGE LAYOUT */
			for(selector in changedElements){
				for(key in changedElements[selector]){
					property = changedElements[selector][key];
					value = null;
					for(pos=thisObj.getPos(Math.round(thisObj.lastStep));pos>=0;pos--){
						if(typeof(thisObj.setArray['forward'][pos])!="undefined" && typeof(thisObj.setArray['forward'][pos][selector])!="undefined" && typeof(thisObj.setArray['forward'][pos][selector][property])!="undefined")
							value = thisObj.setArray['forward'][pos][selector][property];
						else if(typeof(thisObj.animPositions[pos])!="undefined" && typeof(thisObj.animPositions[pos][selector])!="undefined" && typeof(thisObj.animPositions[pos][selector][changedElements[selector][key]])!="undefined")
							value = thisObj.animPositions[pos][selector][changedElements[selector][key]];
						if(value!=null){
							thisObj.setCSS(selector,changedElements[selector][key],value);
							delete changedElements[selector][key];
							break;
						}
					}
				}
			}
			for(selector in changedElements){
				for(key in changedElements[selector]){
					property = changedElements[selector][key];
					value = null;
					for(pos=thisObj.getPos(Math.round(thisObj.lastStep))+1;pos<=thisObj.getPos(thisObj.settings.max-1);pos++){
						if(typeof(thisObj.setArray['backward'][pos])!="undefined" && typeof(thisObj.setArray['backward'][pos][selector])!="undefined" && typeof(thisObj.setArray['backward'][pos][selector][property])!="undefined")
							value = thisObj.setArray['backward'][pos][selector][property];
						else if(typeof(thisObj.animPositions[pos])!="undefined" && typeof(thisObj.animPositions[pos][selector])!="undefined" && typeof(thisObj.animPositions[pos][selector][changedElements[selector][key]])!="undefined")
							value = thisObj.animPositions[pos][selector][changedElements[selector][key]];
						if(value!=null){
							thisObj.setCSS(selector,changedElements[selector][key],value);
							break;
						}
					}
				}
			}

			/*CALLS THE ONREBUILD EVENT*/
			if(thisObj.settings.onRebuild!=null)
				thisObj.settings.onRebuild(thisObj.params,thisObj.getPos(thisObj.step),Math.floor(thisObj.step/(thisObj.settings.max+1)));
		}
		else
			thisObj.rebuildOnStop = true;
	}
	
	
	/*GETS START VALUES*/
	isAlive.prototype.getStartCssValue = function(index){
		var key,pos,posFrom;
		var thisObj = this;
		if(thisObj.settings.elements[index]['method']=='animate' || thisObj.settings.elements[index]['method']=='animate-set')
			posFrom = parseInt(thisObj.settings.elements[index]['step-start']);
		else if(thisObj.settings.elements[index]['method']=='set')
			posFrom = parseInt(thisObj.settings.elements[index]['step-from']);
		
		for(pos=posFrom;pos>=0;pos--){
			for(key in thisObj.settings.elements){
				if(key!=index && thisObj.settings.elements[key]['selector']==thisObj.settings.elements[index]['selector'] && thisObj.settings.elements[key]['property']==thisObj.settings.elements[index]['property'] && thisObj.settings.elements[key]['method']=="set" && thisObj.settings.elements[key]['step-from']==pos)
					return thisObj.settings.elements[key]['value-above'];
				else if(key!=index && thisObj.settings.elements[key]['selector']==thisObj.settings.elements[index]['selector'] && thisObj.settings.elements[key]['property']==thisObj.settings.elements[index]['property'] && (thisObj.settings.elements[key]['method']=="animate" || thisObj.settings.elements[key]['method']=="animate-set") && thisObj.settings.elements[key]['step-end']==pos)
					return thisObj.settings.elements[key]['value-end'];
				else if(key!=index && thisObj.settings.elements[key]['selector']==thisObj.settings.elements[index]['selector'] && thisObj.settings.elements[key]['property']==thisObj.settings.elements[index]['property'] && thisObj.settings.elements[key]['method']=="set@start" && pos==thisObj.settings.start)
					return thisObj.settings.elements[key]['value'];
			}
		}
		
		if(thisObj.settings.elements[index]['property']=="scrollTop")
			return jQuery(thisObj.settings.elements[index]['selector']).scrollTop();
			
		if(thisObj.settings.elements[index]['property']=="scrollLeft")
			return jQuery(thisObj.settings.elements[index]['selector']).scrollLeft();

		if(typeof(thisObj.functionsArray[thisObj.settings.elements[index]['property']])!="undefined")
			return 0;

		return jQuery(thisObj.settings.elements[index]['selector']).css(thisObj.settings.elements[index]['property']);
	}
	
	/*FUNCTION FOR BIND MOUSE AND SCROLL EVENTS*/
	isAlive.prototype.bindScrollTouchEvents = function(){
		
		var thisObj = this;
		
		/* BIND TOUCH EVENTS */
		if(thisObj.settings.enableTouch){

			var startX;
			var startY;
			var isMoving = false;
			var ie10 = false;

			jQuery(thisObj.mySelector).each(function(){
				
				function onTouchStart(e){
					if(!ie10){
						if(e.touches.length != 1) 
							return;
						startX = e.touches[0].clientX;
						startY = e.touches[0].clientY;
						isMoving = true;
						this.addEventListener('touchmove', onTouchMove, false);
						this.addEventListener('touchend', cancelTouch, false);
					}
					else{
						if(e.pointerType==e.MSPOINTER_TYPE_MOUSE)
							return;
						startX = e.clientX;
						startY = e.clientY;
						isMoving = true;
						document.addEventListener('MSPointerMove', onTouchMove, false);
						document.addEventListener('MSPointerUp', cancelTouch, false);
					}
				}
	
				function cancelTouch(e){
					if(!ie10){
						this.removeEventListener('touchmove', onTouchMove);
						this.removeEventListener('touchend', cancelTouch);
					}
					else{
						document.removeEventListener('MSPointerMove', onTouchMove);
						document.removeEventListener('MSPointerUp', cancelTouch);
					}
					isMoving = false;
					thisObj.dragHorizontal = null;
				}	
				
				if(thisObj.settings.touchType=='wipe'){
					var onTouchMove = function(e){
						if(!ie10 && thisObj.settings.preventTouch){
							e.preventDefault();
						}
						if(isMoving){
							if(!ie10){
								var x = e.touches[0].clientX;
								var y = e.touches[0].clientY;
							}
							else{
								var x = e.clientX;
								var y = e.clientY;
							}
							var dx = startX - x;
							var dy = startY - y;
							if(Math.abs(dx)>=thisObj.settings.wipeXFrom){
								if(thisObj.settings.touchActions.left!=0 && dx>0){
									cancelTouch();
									thisObj.doWipe(thisObj.settings.touchActions.left);
									return;
								}
								else if(thisObj.settings.touchActions.right!=0 && dx<0){
									cancelTouch();
									thisObj.doWipe(thisObj.settings.touchActions.right);
									return;
								}
							}
							if(Math.abs(dy)>=thisObj.settings.wipeYFrom){
								if(thisObj.settings.touchActions.up!=0 && dy>0){
									cancelTouch();
									thisObj.doWipe(thisObj.settings.touchActions.up);
									return;
								}
								else if(thisObj.settings.touchActions.down!=0 && dy<0 ){
									cancelTouch();
									thisObj.doWipe(thisObj.settings.touchActions.down);
									return;
								}
							}
						}
					}
				}
				else{
					var onTouchMove = function (e){
						if(!ie10 && thisObj.settings.preventTouch){
							e.preventDefault();
						}
						if(isMoving){
							if(!ie10){
								var x = e.touches[0].clientX;
								var y = e.touches[0].clientY;
							}
							else{
								var x = e.clientX;
								var y = e.clientY;
							}
							var dx = startX - x;
							var dy = startY - y;
							if(Math.abs(dx)>=thisObj.settings.dragXFrom){
								if(thisObj.settings.touchActions.left!=0 && dx>0 && (thisObj.dragHorizontal==null || thisObj.dragHorizontal==true)){
									thisObj.dragHorizontal = true;
									thisObj.doDrag(thisObj.settings.touchActions.left);
									startX = x;
								}
								else if(thisObj.settings.touchActions.right!=0 && dx<0 && (thisObj.dragHorizontal==null || thisObj.dragHorizontal==true)){
									thisObj.dragHorizontal = true;
									thisObj.doDrag(thisObj.settings.touchActions.right);
									startX = x;
								}
							 }
							 if(Math.abs(dy)>=thisObj.settings.dragYFrom){
								if(thisObj.settings.touchActions.up!=0 && dy>0 && (thisObj.dragHorizontal==null || thisObj.dragHorizontal==false)){
									thisObj.dragHorizontal = false;
									thisObj.doDrag(thisObj.settings.touchActions.up);
									startY = y;
								}
								else if(thisObj.settings.touchActions.down!=0 && dy<0 && (thisObj.dragHorizontal==null || thisObj.dragHorizontal==false)){
									thisObj.dragHorizontal = false;
									thisObj.doDrag(thisObj.settings.touchActions.down);
									startY = y;
								}
							}
						}
					}
				}
		    	 
				if('ontouchstart' in document.documentElement){
					this.addEventListener('touchstart', onTouchStart, false);
				}
				else if(window.navigator.msPointerEnabled){
					ie10 = true;
					this.addEventListener('MSPointerDown', onTouchStart, false);
					/*PREVENT SCROLL FOR IE10*/
					if(thisObj.settings.preventTouch)
						jQuery(this).css('-ms-touch-action','none');			
				}
			});
		}
		
		/* BIND SCROLL EVENTS */
		if(thisObj.settings.enableWheel){
			if(thisObj.settings.wheelType=="scroll"){
				/*FOR NON FIREFOX*/
				jQuery(thisObj.mySelector).bind('DOMMouseScroll', function(e){
					(e.originalEvent.detail > 0)?thisObj.doScroll(true):thisObj.doScroll(false);
					if(thisObj.settings.preventWheel)
						return false;
				});
				/*FOR FIREFOX*/
				jQuery(thisObj.mySelector).bind('mousewheel', function(e){
					(e.originalEvent.wheelDelta < 0)?thisObj.doScroll(true):thisObj.doScroll(false);
					if(thisObj.settings.preventWheel)
						return false;
				});
			}
			else{
				/*FOR FIREFOX*/
				jQuery(thisObj.mySelector).bind('DOMMouseScroll', function(e){
					(e.originalEvent.detail > 0)?thisObj.doJump(true):thisObj.doJump(false);
					if(thisObj.settings.preventWheel)
						return false;
				});
				/*FOR NON FIREFOX*/
				jQuery(thisObj.mySelector).bind('mousewheel', function(e){
					(e.originalEvent.wheelDelta < 0)?thisObj.doJump(true):thisObj.doJump(false);
					if(thisObj.settings.preventWheel)
						return false;
				});
			}
		}
	}
	
	/*THIS FUNCTION CREATES ANIMATION, SET AND CLASS ARRAYS*/
	isAlive.prototype.createElementsArray = function(){
		var thisObj = this;
		var myElements = jQuery.extend({},thisObj.settings.elements);
		var pos,key,selector,property,className,valStart,valEnd,stepStart,stepEnd,value;
		var oldValue = {};
		
		thisObj.setArray['forward'] = {};
		thisObj.setArray['backward'] = {};
		
		thisObj.onOffClassArray['forward'] = {};
		thisObj.onOffClassArray['backward'] = {};
		
		/*CREATES ARRAYS FOR ADDCLASS, REMOVECLASS, SET, ANIMATION PROPERTY*/
		for(pos=0;pos<=thisObj.settings.max;pos++){
			for(key in myElements){
				if((myElements[key]['method']=='animate' && pos>myElements[key]['step-end']) || (myElements[key]['method']=='animate-set' && pos>myElements[key]['step-end']) || (myElements[key]['method']=='set' && pos>myElements[key]['step-from']) || (myElements[key]['method']=='add-class' && pos>myElements[key]['step-from']) || (myElements[key]['method']=='remove-class' && pos>myElements[key]['step-from'])){
					delete myElements[key];
					continue;
				}
				if(myElements[key]['method']=='animate'){
					if(pos>=myElements[key]['step-start'] && pos<=myElements[key]['step-end']){
						selector = myElements[key]['selector'];
						property = myElements[key]['property'];
						valStart = myElements[key]['value-start']; 
						valEnd = myElements[key]['value-end'];
						stepStart = myElements[key]['step-start']; 
						stepEnd = myElements[key]['step-end'];
						value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd);
						if(typeof(thisObj.animPositions[pos])=="undefined")
							thisObj.animPositions[pos]=[];
						if(typeof(thisObj.animPositions[pos][selector])=="undefined")
							thisObj.animPositions[pos][selector]=[];
						thisObj.animPositions[pos][selector][property]=value;
					}
				}
				else if(myElements[key]['method']=="animate-set"){
					if(pos>=myElements[key]['step-start'] && pos<=myElements[key]['step-end'] && (pos-myElements[key]['step-start'])%myElements[key]['move-on']==0){
						selector = myElements[key]['selector']; 
						property = myElements[key]['property']; 
						valStart = myElements[key]['value-start']; 
						valEnd = myElements[key]['value-end'];
						stepStart = myElements[key]['step-start']; 
						stepEnd = myElements[key]['step-end'];
						value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd);
						if(pos>stepStart){
							if(typeof(thisObj.setArray['forward'][pos])=="undefined")
								thisObj.setArray['forward'][pos] = {};
							if(typeof(thisObj.setArray['forward'][pos][selector])=="undefined")
								thisObj.setArray['forward'][pos][selector] = {};
							thisObj.setArray['forward'][pos][selector][property] = value;
							if(typeof(thisObj.setArray['backward'][pos])=="undefined")
								thisObj.setArray['backward'][pos] = {};
							if(typeof(thisObj.setArray['backward'][pos][selector])=="undefined")
								thisObj.setArray['backward'][pos][selector] = {};
							thisObj.setArray['backward'][pos][selector][property] = oldValue[selector+'-'+property];
						}
						oldValue[selector+'-'+property] = value;
					}
				}
				else if(myElements[key]['method']=="set"){
					if(pos==myElements[key]['step-from']){
						selector = myElements[key]['selector']; 
						property = myElements[key]['property']; 
						if(typeof(thisObj.setArray['forward'][pos])=="undefined")
							thisObj.setArray['forward'][pos] = {};
						if(typeof(thisObj.setArray['forward'][pos][selector])=="undefined")
							thisObj.setArray['forward'][pos][selector] = {};
						thisObj.setArray['forward'][pos][selector][property] = myElements[key]['value-above'];
						if(typeof(thisObj.setArray['backward'][pos])=="undefined")
							thisObj.setArray['backward'][pos] = {};
						if(typeof(thisObj.setArray['backward'][pos][selector])=="undefined")
							thisObj.setArray['backward'][pos][selector] = {};
						thisObj.setArray['backward'][pos][selector][property] = myElements[key]['value-under'];
					}
				}else if(myElements[key]['method']=="add-class"){
					if(pos==myElements[key]['step-from']){
						selector = myElements[key]['selector']; 
						className = myElements[key]['class-name']; 
						if(typeof(thisObj.onOffClassArray['forward'][pos])=="undefined")
							thisObj.onOffClassArray['forward'][pos] = {};
						if(typeof(thisObj.onOffClassArray['forward'][pos][selector])=="undefined")
							thisObj.onOffClassArray['forward'][pos][selector] = {};
						thisObj.onOffClassArray['forward'][pos][selector][className] = true;
						if(typeof(thisObj.onOffClassArray['backward'][pos])=="undefined")
							thisObj.onOffClassArray['backward'][pos] = {};
						if(typeof(thisObj.onOffClassArray['backward'][pos][selector])=="undefined")
							thisObj.onOffClassArray['backward'][pos][selector] = {};
						thisObj.onOffClassArray['backward'][pos][selector][className] = false;
					}
				}else if(myElements[key]['method']=="remove-class"){
					if(pos==myElements[key]['step-from']){
						selector = myElements[key]['selector']; 
						className = myElements[key]['class-name']; 
						if(typeof(thisObj.onOffClassArray['forward'][pos])=="undefined")
							thisObj.onOffClassArray['forward'][pos] = {};
						if(typeof(thisObj.onOffClassArray['forward'][pos][selector])=="undefined")
							thisObj.onOffClassArray['forward'][pos][selector] = {};
						thisObj.onOffClassArray['forward'][pos][selector][className] = false;
						if(typeof(thisObj.onOffClassArray['backward'][pos])=="undefined")
							thisObj.onOffClassArray['backward'][pos] = {};
						if(typeof(thisObj.onOffClassArray['backward'][pos][selector])=="undefined")
							thisObj.onOffClassArray['backward'][pos][selector] = {};
						thisObj.onOffClassArray['backward'][pos][selector][className] = true;
					}
				}			
			}
		}
	}
	
	/*INITS THE STARTING POINTS*/
	isAlive.prototype.initCSS = function(){
		var thisObj = this;
		var CSSArray = {};
		var classesArray = {};
		var pos,selector,property,className;
		var pointFoundSelector = -1;
		
		for(pos=thisObj.settings.start;pos>=0;pos--){

			if(thisObj.haveStepPoints && pointFoundSelector==-1)
				pointFoundSelector=indexOf(thisObj.settings.stepPoints,pos);
		
			if(typeof(thisObj.setArray['forward'][pos])!="undefined"){
				for(selector in thisObj.setArray['forward'][pos]){
					if(typeof(CSSArray[selector])=="undefined")
						CSSArray[selector] = {};
					for(property in thisObj.setArray['forward'][pos][selector]){
						if(typeof(CSSArray[selector][property])=="undefined")
							CSSArray[selector][property] = thisObj.setArray['forward'][pos][selector][property];
					}
				}
			}
			if(typeof(thisObj.onOffClassArray['forward'][pos])!="undefined"){
				for(selector in thisObj.onOffClassArray['forward'][pos]){
					if(typeof(classesArray[selector])=="undefined")
						classesArray[selector] = {};
					for(className in thisObj.onOffClassArray['forward'][pos][selector]){
						if(typeof(classesArray[selector][className])=="undefined")
							classesArray[selector][className] = thisObj.onOffClassArray['forward'][pos][selector][className]; 
					}
				}
			}
			if(typeof(thisObj.animPositions[pos])!="undefined"){
				for(selector in thisObj.animPositions[pos]){
					if(typeof(CSSArray[selector])=="undefined")
						CSSArray[selector] = {};
					for(property in thisObj.animPositions[pos][selector])
						if(typeof(CSSArray[selector][property]) == "undefined")
							CSSArray[selector][property] = thisObj.animPositions[pos][selector][property];
				}
			}
		}
		
		for(pos=thisObj.settings.start+1;pos<=thisObj.settings.max;pos++){
			if(typeof(thisObj.setArray['backward'][pos])!="undefined"){
				for(selector in thisObj.setArray['backward'][pos]){
					if(typeof(CSSArray[selector])=="undefined")
						CSSArray[selector] = {};
					for(property in thisObj.setArray['backward'][pos][selector]){
						if(typeof(CSSArray[selector][property])=="undefined")
							CSSArray[selector][property] = thisObj.setArray['backward'][pos][selector][property];
					}
				}
			}
			if(typeof(thisObj.onOffClassArray['backward'][pos])!="undefined"){
				for(selector in thisObj.onOffClassArray['backward'][pos]){
					if(typeof(classesArray[selector])=="undefined")
						classesArray[selector] = {};
					for(className in thisObj.onOffClassArray['backward'][pos][selector]){
						if(typeof(classesArray[selector][className])=="undefined")
							classesArray[selector][className] = thisObj.onOffClassArray['backward'][pos][selector][className]; 
					}
				}
			}
			if(typeof(thisObj.animPositions[pos])!="undefined"){
				for(selector in thisObj.animPositions[pos]){
					if(typeof(CSSArray[selector])=="undefined")
						CSSArray[selector] = {};
					for(property in thisObj.animPositions[pos][selector])
						if(typeof(CSSArray[selector][property]) == "undefined")
							CSSArray[selector][property] = thisObj.animPositions[pos][selector][property];
				}
			}
		}
		
		for(selector in CSSArray)
			for(property in CSSArray[selector])
				thisObj.setCSS(selector,property,CSSArray[selector][property]);
		
		for(selector in classesArray){
			for(className in classesArray[selector]){
				if(classesArray[selector][className]==true)
					jQuery(selector).addClass(className);
				else 
					jQuery(selector).removeClass(className);
			}
		}
					
		if(pointFoundSelector!=-1){
			jQuery(thisObj.settings.stepPointsSelector).removeClass(thisObj.settings.stepPointsActiveClass);
			jQuery(thisObj.settings.stepPointsSelector).eq(pointFoundSelector).addClass(thisObj.settings.stepPointsActiveClass);
		}

		for(pos=0;pos<=thisObj.settings.start;pos++)
			if(thisObj.settings.onStep!=null)
				thisObj.settings.onStep(pos,Math.floor(pos/(thisObj.settings.max+1)),'init');
	};
	
	/*THIS FUNCTION MAKES ALL THE INITIALIZATIONS FOR ANIMATIONS*/
	isAlive.prototype.initAnimations = function(){
		var pos,key,key2;
		
		var thisObj = this;
		
		/*GET IE VERSION AND BIND RESIZE*/
		if(!isReady){
			
			isReady = true;
			browserObj = getBrowser();
			
			/* ARRAY SEARCH FOR IE7&IE8 FIX*/
			if(!browserObj.msie || (browserObj.msie && parseInt(browserObj.version)>=9)){
				indexOf = function (myArray,myValue){
					return myArray.indexOf(myValue);
				}
			}else{
				indexOf = function (myArray,myValue){
					for(var key in myArray)
						if(myArray[key]==myValue)
							return parseInt(key);
					return -1;	
				}
			}
			
			/*BINDS RESIZE EVENT*/
			windowWidth = jQuery(window).width();
			windowHeight = jQuery(window).height();
			jQuery(window).bind('resize',onResizeAction);
			
			/*SET TRASITION WITH PREFIX VENTOR*/ 
			vPTransition = vP('transition');
		}
		
		/*TIMELINE WRAPPER*/
		thisObj.TimeLine = document.createElement('wrapper');
		
		/*SHOW SCROLL POSITION*/
		if(thisObj.settings.debug)
			jQuery(thisObj.mySelector).append('<div style="position:absolute;padding:5px;border:1px solid gray; color: red; top:10px;left:10px;display:inline-block;background:white;z-index:9999;" id="isalive-'+thisObj.uniqId+'-debuger" class="isalive-debuger"><span>'+thisObj.settings.start+'</span></div>');
		
		/*GET WIDTH AND HEIGHT OF THE PARENT ELEMENT*/
		thisObj.params.windowWidth = jQuery(window).width();
		thisObj.params.windowHeight = jQuery(window).height();
		thisObj.params.documentWidth = jQuery(document).width();
		thisObj.params.documentHeight = jQuery(document).height();
		thisObj.params.elementHeight = jQuery(thisObj.mySelector).height();
		thisObj.params.elementWidth = jQuery(thisObj.mySelector).width();
		thisObj.params.elementTop = jQuery(thisObj.mySelector).offset().top;
		thisObj.params.elementLeft = jQuery(thisObj.mySelector).offset().left;
		
		/*FIX JQUERY/CSS3 EASING*/
		if(thisObj.settings.JSEasing==null)
			thisObj.settings.JSEasing = thisObj.settings.easing;
		if(thisObj.settings.CSS3Easing==null)
			thisObj.settings.CSS3Easing = thisObj.settings.easing;
		
		/*MAKE SURE THAT MAXSCROLL AND MAXTOUCH IS NO BIGGER THEN SCROLLJUMP AND TOUCHJUMP*/
		if(thisObj.settings.maxScroll<thisObj.settings.stepsOnScroll)
			thisObj.settings.maxScroll = thisObj.settings.stepsOnScroll;
		if(thisObj.settings.maxDrag<thisObj.settings.stepsOnDrag)
			thisObj.settings.maxDrag = thisObj.settings.stepsOnDrag;
		
		/*CHECK FOR TOUCH*/
		if(thisObj.settings.enableTouch && thisObj.settings.touchType=="wipe" && thisObj.settings.wipePoints.length<=1)
			thisObj.settings.enableTouch = false;

		/*CHECK FOR SCROLL*/
		if(thisObj.settings.enableWheel && thisObj.settings.wheelType=="jump" && thisObj.settings.jumpPoints.length<=1)
			thisObj.settings.enableWheel = false;
			
		/*CHECK IF SCROLLBARPOINTS EXIST*/
		if(thisObj.settings.scrollbarType=="jump" && thisObj.settings.scrollbarPoints.length<=1)
			thisObj.settings.scrollbarType = "scroll";
			
		/*SORT AND INIT STEP POINTS*/	
		thisObj.haveStepPoints = (thisObj.settings.stepPointsSelector!=null && thisObj.settings.stepPointsActiveClass!=null && thisObj.settings.stepPoints.length>0);
			
		/*SORT POINTS ARRAYS*/
		thisObj.settings.wipePoints.sort(function(a,b){return a-b});
		thisObj.settings.jumpPoints.sort(function(a,b){return a-b});
		thisObj.settings.playPoints.sort(function(a,b){return a-b});
		thisObj.settings.scrollbarPoints.sort(function(a,b){return a-b});
		thisObj.settings.stepPoints.sort(function(a,b){return a-b});
		
		/*SETS THE DURATION TWEAKS*/
		if(typeof(thisObj.settings.durationTweaks['wheel'])=="undefined")
			thisObj.settings.durationTweaks['wheel'] = {};
		if(typeof(thisObj.settings.durationTweaks['touch'])=="undefined")
			thisObj.settings.durationTweaks['touch'] = {};
		if(typeof(thisObj.settings.durationTweaks['scrollbar'])=="undefined")
			thisObj.settings.durationTweaks['scrollbar'] = {};
		thisObj.settings.durationTweaks['wheel'] = jQuery.extend({duration:thisObj.settings.duration,durationType:"default",minStepDuration:thisObj.settings.minStepDuration},thisObj.settings.durationTweaks['wheel']);
		thisObj.settings.durationTweaks['touch'] = jQuery.extend({duration:thisObj.settings.duration,durationType:"default",minStepDuration:thisObj.settings.minStepDuration},thisObj.settings.durationTweaks['touch']);
		thisObj.settings.durationTweaks['scrollbar'] = jQuery.extend({duration:thisObj.settings.duration,durationType:"default",minStepDuration:thisObj.settings.minStepDuration},thisObj.settings.durationTweaks['scrollbar']);

		/*SET TOUCH ACTIONS*/
		thisObj.settings.touchActions = jQuery.extend({up:1,down:-1,right:0,left:0},thisObj.settings.touchActions);
			
		/* CONVERT FROM TREE TO LINEAR STRUCTURE */
		if(thisObj.settings.elementsType=="tree"){
			var tempObj = {};
			var i = 0;
			for(key in thisObj.settings.elements){
				for(key2 in thisObj.settings.elements[key]){
					tempObj[i] = {};
					tempObj[i] = jQuery.extend({"selector":key},thisObj.settings.elements[key][key2]);
					i++;
				}
				delete thisObj.settings.elements[key];
			}
			thisObj.settings.elements = jQuery.extend({},tempObj);
		}
		
		var new_elements = [];
		var idIndex = 0;
		var keyIndex = 0;
		var tempArray = [];
		for(key in thisObj.settings.elements){
			/*DELETE ELEMENTS FOR OTHER BROWSERS THEN MINE*/
			if(typeof(thisObj.settings.elements[key]['+browsers'])!="undefined"){
				if(!validateBrowsers(thisObj.settings.elements[key]['+browsers'])){
					delete thisObj.settings.elements[key];
					continue;
				}
			}
			if(typeof(thisObj.settings.elements[key]['-browsers'])!="undefined"){
				if(validateBrowsers(thisObj.settings.elements[key]['-browsers'])){
					delete thisObj.settings.elements[key];
					continue;
				}
			}
			/*DELETE INVALID ELEMENTS*/
			if(typeof(thisObj.settings.elements[key]['selector'])=="undefined" || (typeof(thisObj.settings.elements[key]['method'])=="undefined" && typeof(thisObj.settings.elements[key]['do'])=="undefined")){
				delete thisObj.settings.elements[key];
				continue;
			}
			/*DELETE NON EXISTING DOM ELEMENTS*/
			if(indexOf(tempArray,thisObj.settings.elements[key]['selector'])==-1){
				if(jQuery(thisObj.settings.elements[key]['selector']).length==0){
					delete thisObj.settings.elements[key];
					continue;
				}
				tempArray.push(thisObj.settings.elements[key]['selector']);
			}
			/*UNPACK SHOT ELEMENTS*/
			if(typeof(thisObj.settings.elements[key]['do'])!="undefined"){
				if(thisObj.settings.elements[key]['do'].indexOf('(')!=-1){
					thisObj.settings.elements[key]['property'] = thisObj.settings.elements[key]['do'].substr(0,thisObj.settings.elements[key]['do'].indexOf('('));
					var temp = getBetweenBrackets(thisObj.settings.elements[key]['do']);
					var values = [];
					var s = 0;
					var k = 0;
					for(var i=0;i<=temp.length-1;i++){
						if(temp.charAt(i) == '(')
							s++;
						else if(temp.charAt(i) == ')')
							s--;
						if(temp.charAt(i)==',' && s==0)
							k++;
						else{
							if(typeof(values[k])=="undefined")
								values[k] = "";
							values[k] = values[k] + temp.charAt(i);
						}
					}
					if(values.length==1)
						thisObj.settings.elements[key]['value-end'] = values[0];
					else if(values.length==2){
						thisObj.settings.elements[key]['value-start'] = values[0];
						thisObj.settings.elements[key]['value-end'] = values[1];
					}
					else{
						delete thisObj.settings.elements[key];
						continue;					
					}
				}
				else if(thisObj.settings.elements[key]['do']=="fadeOut"){
					thisObj.settings.elements[key]['property'] = "opacity";
					thisObj.settings.elements[key]['value-end'] = 0;
				}
				else if(thisObj.settings.elements[key]['do']=="fadeIn"){
					thisObj.settings.elements[key]['property'] = "opacity";
					thisObj.settings.elements[key]['value-end'] = 1;
				}
				thisObj.settings.elements[key]['method'] = "animate";
				delete thisObj.settings.elements[key]['do'];
			}
			/*ADD IF USEIDATTRIBUTE IS SET TO TRUE*/
			if((thisObj.settings.useIdAttribute && (typeof(thisObj.settings.elements[key]['use-id-attribute'])=="undefined" || thisObj.settings.elements[key]['use-id-attribute']==true)) || (!thisObj.settings.useIdAttribute && thisObj.settings.elements[key]['use-id-attribute']==true)){
				if(typeof(thisObj.settings.elements[key]['use-id-attribute'])!="undefined")
					delete thisObj.settings.elements[key]['use-id-attribute'];			
				if(jQuery(thisObj.settings.elements[key]['selector']).length==1){
					var id = jQuery(thisObj.settings.elements[key]['selector']).attr('id');
					if(typeof(id)=='undefined'){
						id = 'isalive-'+thisObj.uniqId+'-element-' + idIndex;
						idIndex++;
						jQuery(thisObj.settings.elements[key]['selector']).attr('id', id);
						thisObj.settings.elements[key]['selector'] = '#'+id;
					}
					else
						thisObj.settings.elements[key]['selector'] = '#'+id;
				}
				else{
					jQuery(thisObj.settings.elements[key]['selector']).each(function(k, child){
						if(typeof(jQuery(child).attr('id')) == "undefined"){
							var id = 'isalive-'+thisObj.uniqId+'-element-' + idIndex;
							jQuery(child).attr('id', id);
							idIndex++;
						}
						else
							var id = jQuery(child).attr('id');
						var newElement = jQuery.extend(true, {}, thisObj.settings.elements[key]);
						newElement['selector'] = "#"+id;
						new_elements.push(newElement);
					});
					delete thisObj.settings.elements[key];
				}
			}
		}
		for(key in new_elements){
			thisObj.settings.elements["ISALIVE_OBJECT_"+keyIndex] = new_elements[key];
			keyIndex++;
		}
		/*DELETES UNVALID ELEMENTS AND ADDS ISALIVE CLASS / PREPARES CSS3*/
		var tempArray = [];
		for(key in thisObj.settings.elements){
			if(typeof(thisObj.settings.elements[key]['property'])!="undefined"){
			
				/*BUILD FUNCTIONS ARRAY && TRIMS PROPERTY*/
				if(typeof(thisObj.settings.elements[key]['property'])=='function'){
					if(typeof(thisObj.functionsArray['f:'+toString(thisObj.settings.elements[key]['property'])])=="undefined")
						thisObj.functionsArray['f:'+toString(thisObj.settings.elements[key]['property'])] = thisObj.settings.elements[key]['property'];
					thisObj.settings.elements[key]['property'] = 'f:'+toString(thisObj.settings.elements[key]['property']);	
				}
				
				/*ONLY STRING PROPERTIES*/
				if(typeof(thisObj.settings.elements[key]['property'])!='string'){
					delete thisObj.settings.elements[key];
					continue;
				}
				
				/*CSS3 DOES NOT WORK ON IE7&IE8*/
				if(isCSS3(thisObj.settings.elements[key]['property']) && browserObj.msie && parseInt(browserObj.version)<9){
					delete thisObj.settings.elements[key];
					continue;
				}
				
				if((thisObj.settings.elements[key]['property'].indexOf('-webkit-')==0 && !browserObj.webkit) || (thisObj.settings.elements[key]['property'].indexOf('-moz-')==0 && !browserObj.mozilla) || (thisObj.settings.elements[key]['property'].indexOf('-ms-')==0 && !browserObj.msie) || (thisObj.settings.elements[key]['property'].indexOf('-o-')==0 && !browserObj.opera)){
					delete thisObj.settings.elements[key];
					continue;
				}
				
				/* SET@START IS NOT USED WHEN INITCSS IS TRUE*/
				if(thisObj.settings.elements[key]["method"]=="set@start" && thisObj.settings.initCSS){
					delete thisObj.settings.elements[key];
					continue;
				}

				/*PUTS MOVE-ON VALUE TO THE ANIMATE-SET ELEMENTS*/
				if(thisObj.settings.elements[key]["method"]=="animate-set" && typeof(thisObj.settings.elements[key]['move-on'])=='undefined')
					thisObj.settings.elements[key]['move-on'] = 1;
				
				/*SET CSS3 VARS*/
				if(thisObj.settings.elements[key]["method"]=="animate"){
					if((browserObj.msie && parseInt(browserObj.version)<10) || thisObj.settings.elements[key]['property']=='scrollTop' || thisObj.settings.elements[key]['property']=='scrollLeft' || typeof(thisObj.functionsArray[thisObj.settings.elements[key]["property"]])!="undefined"){
						thisObj.settings.elements[key]['useCSS3'] = false;
						if(typeof(thisObj.settings.elements[key]["easing"])=="undefined"){
							if(typeof(thisObj.settings.elements[key]["JSEasing"])=="undefined")
								thisObj.settings.elements[key]["easing"] = thisObj.settings.JSEasing;
							else
								thisObj.settings.elements[key]["easing"] = thisObj.settings.elements[key]["JSEasing"];
						}
						if(typeof(jQuery.easing[thisObj.settings.elements[key]["easing"]])=='undefined')
							thisObj.settings.elements[key]["easing"] = "linear";						
						if(typeof(thisObj.settings.elements[key]["JSEasing"])!="undefined")
							delete thisObj.settings.elements[key]['JSEasing'];
						if(typeof(thisObj.settings.elements[key]["CSS3Easing"])!="undefined")
							delete thisObj.settings.elements[key]['CSS3Easing'];
							
						if(canJQueryAnimate(thisObj.settings.elements[key]["property"]))
							thisObj.settings.elements[key]['useJQuery'] = true;
						else{
							thisObj.settings.elements[key]['useJQuery'] = false;
							if(typeof(thisObj.JSValuesArray[thisObj.settings.elements[key]["selector"]])=="undefined")
								thisObj.JSValuesArray[thisObj.settings.elements[key]["selector"]] = {};
						}
					}
					else {
						if((thisObj.settings.useCSS3 && typeof(thisObj.settings.elements[key]['useCSS3'])=="undefined") || thisObj.settings.elements[key]['useCSS3']){
							thisObj.settings.elements[key]['useCSS3'] = true;
							thisObj.settings.elements[key]['useJQuery'] = false;
							if(typeof(thisObj.settings.elements[key]["easing"])=="undefined"){
								if(typeof(thisObj.settings.elements[key]["CSS3Easing"])=="undefined")
									thisObj.settings.elements[key]["easing"] = thisObj.settings.CSS3Easing;
								else
									thisObj.settings.elements[key]["easing"] = thisObj.settings.elements[key]["CSS3Easing"];
							}
							thisObj.settings.elements[key]["easing"] = convertEasing(thisObj.settings.elements[key]["easing"]);
							if(indexOf(['linear','ease','ease-in','ease-out','ease-in-out'],thisObj.settings.elements[key]["easing"])==-1 && thisObj.settings.elements[key]["easing"].indexOf('cubic-bezier')==-1)
								thisObj.settings.elements[key]["easing"] = "linear";
							if(typeof(thisObj.settings.elements[key]["JSEasing"])!="undefined")
								delete thisObj.settings.elements[key]['JSEasing'];
							if(typeof(thisObj.settings.elements[key]["CSS3Easing"])!="undefined")
								delete thisObj.settings.elements[key]['CSS3Easing'];
							
							/*BUILD CSS3 ARRAYS*/
							if(typeof(thisObj.CSS3TransitionArray[thisObj.settings.elements[key]["selector"]])=="undefined")
								thisObj.CSS3TransitionArray[thisObj.settings.elements[key]["selector"]] = {};
							if(typeof(thisObj.CSS3ValuesArray[thisObj.settings.elements[key]["selector"]])=="undefined")
								thisObj.CSS3ValuesArray[thisObj.settings.elements[key]["selector"]] = {};
						}
						else{
							thisObj.settings.elements[key]['useCSS3'] = false;
							if(typeof(thisObj.settings.elements[key]["easing"])=="undefined"){
								if(typeof(thisObj.settings.elements[key]["JSEasing"])=="undefined")
									thisObj.settings.elements[key]["easing"] = thisObj.settings.JSEasing;
								else
									thisObj.settings.elements[key]["easing"] = thisObj.settings.elements[key]["JSEasing"];
							}
							if(typeof(jQuery.easing[thisObj.settings.elements[key]["easing"]])=='undefined')
								thisObj.settings.elements[key]["easing"] = "linear";						
							if(typeof(thisObj.settings.elements[key]["JSEasing"])!="undefined")
								delete thisObj.settings.elements[key]['JSEasing'];
							if(typeof(thisObj.settings.elements[key]["CSS3Easing"])!="undefined")
								delete thisObj.settings.elements[key]['CSS3Easing'];
								
							if(canJQueryAnimate(thisObj.settings.elements[key]["property"]))
								thisObj.settings.elements[key]['useJQuery'] = true;
							else{
								thisObj.settings.elements[key]['useJQuery'] = false;
								if(typeof(thisObj.JSValuesArray[thisObj.settings.elements[key]["selector"]])=="undefined")
									thisObj.JSValuesArray[thisObj.settings.elements[key]["selector"]] = {};
							}
						}
					}
				}

				/*PUTS PREFIX FOR CSS3*/
				thisObj.settings.elements[key]['property'] = vP(thisObj.settings.elements[key]['property']);
				
				/*PUT ANIMATE CLASS FOR ANIMATIONS*/
				if(thisObj.settings.elements[key]['method']=="animate" && indexOf(tempArray,thisObj.settings.elements[key]['selector'])==-1){
					jQuery(thisObj.settings.elements[key]['selector']).addClass(thisObj.settings.animateClass);
					tempArray.push(thisObj.settings.elements[key]['selector']);
				}
			}
		}
		
		/*CHECKS IF ENABLE GPU IS VALID AND ADD SPECIAL CSS*/
		if(browserObj.webkit && (thisObj.settings.enableGPU==true || (thisObj.settings.enableGPU!=false && validateBrowsers(thisObj.settings.enableGPU))))
			jQuery('.'+thisObj.settings.animateClass).css({
				'-webkit-backface-visibility':'hidden',
				'-webkit-perspective':'1000'
			});
		
		var tempArray = [];
		for(key in thisObj.settings.elements){
			/* CREATES ARRAY WITH TRANSITIONS CSS VALUES*/
			if(thisObj.settings.elements[key]['useCSS3'] && (!browserObj.msie || (browserObj.msie && parseInt(browserObj.version)>9)))
				if(typeof(thisObj.CSS3DefaultTransitionArray[thisObj.settings.elements[key]['selector']])=="undefined"){
					var propTempArray = [];
					var pTemp1 = jQuery(thisObj.settings.elements[key]['selector']).css(vP('transition-property'));
					var pTemp2 = jQuery(thisObj.settings.elements[key]['selector']).css(vP('transition-duration'));
					if(typeof(pTemp1)!="undefined" && typeof(pTemp2)!="undefined" && (pTemp1!="all" || pTemp2!="0s")){
						propTempArray.push(pTemp1);
						propTempArray.push(pTemp2);
						propTempArray.push(jQuery(thisObj.settings.elements[key]['selector']).css(vP('transition-timing-function')));
						propTempArray.push(jQuery(thisObj.settings.elements[key]['selector']).css(vP('transition-delay')));
						thisObj.CSS3DefaultTransitionArray[thisObj.settings.elements[key]['selector']] = propTempArray;
					}
					else
						thisObj.CSS3DefaultTransitionArray[thisObj.settings.elements[key]['selector']] = null;
				}
			
			/*FIXES IE OPACITY BUG*/
			if(browserObj.msie && parseInt(browserObj.version)<9 && thisObj.settings.elements[key]['property']=='opacity' && indexOf(tempArray,thisObj.settings.elements[key]['selector'])==-1){		
				var cssValue=parseFloat(jQuery(thisObj.settings.elements[key]['selector']).css('opacity'));
				jQuery(thisObj.settings.elements[key]['selector']).css('opacity',cssValue);
				tempArray.push(thisObj.settings.elements[key]['selector']);
			}
		}
		
		/* DELETES UNWANTED ELEMENTS FROM TRANSITION ARRAY AND MAKES DEFAULT TRANSITION ARRAY*/		
		for(key in thisObj.CSS3DefaultTransitionArray){
			if(thisObj.CSS3DefaultTransitionArray[key]==null){
				delete thisObj.CSS3DefaultTransitionArray[key];
				continue;
			}
			var tempArray = [];
			for(key2 in thisObj.CSS3DefaultTransitionArray[key]){
				if(thisObj.CSS3DefaultTransitionArray[key][key2].indexOf('cubic-bezier')==-1) 
					tempArray.push(thisObj.CSS3DefaultTransitionArray[key][key2].split(','));
				else{
					var aTemp = thisObj.CSS3DefaultTransitionArray[key][key2].split('(');
					for (var keyA in aTemp){
						if(aTemp[keyA].indexOf(')')!=-1){
							aTemp[keyA] = aTemp[keyA].split(')');
							aTemp[keyA][0] = aTemp[keyA][0].replace(/,/g,'*char*');
							aTemp[keyA] = aTemp[keyA].join(')'); 
						}
					}
					tempArray.push(aTemp.join('(').split(','));
				}
				delete(thisObj.CSS3DefaultTransitionArray[key][key2]);
			}
			for(key2 in tempArray[0]){
				var transVal = [];
				transVal.push(jQuery.trim(tempArray[0][key2]));
				transVal.push(jQuery.trim(tempArray[1][key2]));
				transVal.push(jQuery.trim(tempArray[2][key2]));
				transVal.push(jQuery.trim(tempArray[3][key2]));
				thisObj.CSS3DefaultTransitionArray[key][jQuery.trim(tempArray[0][key2])] = transVal.join(" ").replace(/\*char\*/g,',');
			}
		}
		
		/*GETS MAX*/
		if(thisObj.settings.max==null){
			thisObj.settings.max = 0;
			for(key in thisObj.settings.elements){
				if(thisObj.settings.elements[key]['method']=='animate' || thisObj.settings.elements[key]['method']=='animate-set'){
					if(typeof(thisObj.settings.elements[key]['step-end'])!='undefined')
						thisObj.settings.max = Math.max(thisObj.settings.max,thisObj.settings.elements[key]['step-end']);
				}
				else if(thisObj.settings.elements[key]['method']=='set' || thisObj.settings.elements[key]['method']=='add-class' || thisObj.settings.elements[key]['method']=='remove-class'){
					if(typeof(thisObj.settings.elements[key]['step-from'])!='undefined')
						thisObj.settings.max = Math.max(thisObj.settings.max,thisObj.settings.elements[key]['step-from']);
				}
			}
		}
		
		/*INIT STARTING POINT*/
		thisObj.step=thisObj.settings.start;
		thisObj.lastStep=thisObj.settings.start;
			
		/*GETS STARING VALUES*/
		for(key in thisObj.settings.elements){
			if(thisObj.settings.elements[key]['scrollbar'] && thisObj.settings.elements[key]['method']=="animate" && (thisObj.settings.elements[key]['property']=="top" || thisObj.settings.elements[key]['property']=="left")){
				if(typeof(thisObj.settings.elements[key]['step-start'])=="undefined")
					thisObj.settings.elements[key]['step-start'] = 0;
				if(typeof(thisObj.settings.elements[key]['step-end'])=="undefined")
					thisObj.settings.elements[key]['step-end'] = thisObj.settings.max;
			}
			if((thisObj.settings.elements[key]['method']=='animate' || thisObj.settings.elements[key]['method']=='animate-set') && typeof(thisObj.settings.elements[key]['value-start'])=="undefined")
				thisObj.settings.elements[key]['value-start'] = thisObj.getStartCssValue(key);
			else if(thisObj.settings.elements[key]['method']=='set' && typeof(thisObj.settings.elements[key]['value-under'])=="undefined")
				thisObj.settings.elements[key]['value-under'] = thisObj.getStartCssValue(key);
		}
		
		/* GET VALUES FOR CUSTOM PARAMS */
		for(key in thisObj.settings.elements){
			if(thisObj.settings.elements[key]["method"]=="animate" || thisObj.settings.elements[key]["method"]=="animate-set"){
				if(isDinamic(thisObj.settings.elements[key]['value-start']) || isDinamic(thisObj.settings.elements[key]['value-end'])){
					if(thisObj.settings.elements[key]['scrollbar']==true)
						var tempObj = jQuery.extend(true, {key:parseInt(key)}, thisObj.settings.elements[key]);
					else
						var tempObj = jQuery.extend(true, {}, thisObj.settings.elements[key]);
					thisObj.cssDinamicElements.push(tempObj);
				}
				thisObj.settings.elements[key]['value-start'] = thisObj.convertParams(thisObj.settings.elements[key]['value-start'],thisObj.settings.elements[key]['format']);
				thisObj.settings.elements[key]['value-end'] = thisObj.convertParams(thisObj.settings.elements[key]['value-end'],thisObj.settings.elements[key]['format']);
			}
			else if(thisObj.settings.elements[key]["method"]=="set"){
				if(isDinamic(thisObj.settings.elements[key]['value-under']) || isDinamic(thisObj.settings.elements[key]['value-above'])){
					var tempObj = jQuery.extend(true, {}, thisObj.settings.elements[key]);
					thisObj.cssDinamicElements.push(tempObj);
				}
				thisObj.settings.elements[key]['value-under'] = thisObj.convertParams(thisObj.settings.elements[key]['value-under'],thisObj.settings.elements[key]['format']);
				thisObj.settings.elements[key]['value-above'] = thisObj.convertParams(thisObj.settings.elements[key]['value-above'],thisObj.settings.elements[key]['format']);
			}
			else if(thisObj.settings.elements[key]["method"]=="static"){
				if(isDinamic(thisObj.settings.elements[key]['value'])){
					var tempObj = jQuery.extend(true, {}, thisObj.settings.elements[key]);
					thisObj.cssDinamicElements.push(tempObj);
				}
				convertValue = thisObj.convertParams(thisObj.settings.elements[key]['value'],thisObj.settings.elements[key]['format']);
				thisObj.setCSS(thisObj.settings.elements[key]['selector'],thisObj.settings.elements[key]['property'],convertValue);
				delete thisObj.settings.elements[key];
			}
			else if(thisObj.settings.elements[key]["method"]=="set@start"){
				var convertValue = thisObj.convertParams(thisObj.settings.elements[key]["value"],thisObj.settings.elements[key]['format']);
				thisObj.setCSS(thisObj.settings.elements[key]["selector"],thisObj.settings.elements[key]["property"],convertValue);
				delete thisObj.settings.elements[key];
			}
		}
		
		/*THIS FUNCTION CREATES ANIMATION, SET AND CLASS ARRAYS*/
		thisObj.createElementsArray();
		
		/*SCROLLBAR EVENTS*/
		var addScrollbarEvents = function(scrollBarObj,scrollbarKey){

			var mousedownFunction = function(e,eType,myObj){
			
				if(thisObj.animating && thisObj.animationType!="scrollbar")
					return false;
					
				if(window.navigator.msPointerEnabled && !thisObj.settings.enableScrollbarTouch)
					if(e.pointerType!=e.MSPOINTER_TYPE_MOUSE)
						return false;
				
				var htmlUnselectableAttr,cssUserSelect,parentTopLeft,clickPos,position,positionTo,positionValid;
				var valStart = parseInt(thisObj.settings.elements[scrollbarKey]['value-start'].toString().match(/[-]?[0-9]*\.?[0-9]+/)[0]);
				var valEnd = parseInt(thisObj.settings.elements[scrollbarKey]['value-end'].toString().match(/[-]?[0-9]*\.?[0-9]+/)[0]);
				
				thisObj.scrollbarActive = scrollbarKey; 						
				
				if(eType=="mousedown"){
					jQuery('body').bind("selectstart.disableSelection",function(e){
						e.preventDefault();
					});
					htmlUnselectableAttr = jQuery('body').attr('unselectable');
					cssUserSelect = jQuery('body').css('user-select');
					jQuery('body').attr('unselectable', 'on').css('user-select', 'none');
				}
				
				if(thisObj.settings.scrollbarActiveClass!=null)
					jQuery(thisObj.settings.elements[scrollbarKey]['selector']).addClass(thisObj.settings.scrollbarActiveClass);
				
				if(eType=="mousedown"){
					if(thisObj.settings.elements[scrollbarKey]['property']=="top"){
						parentTopLeft = jQuery(scrollBarObj).parent().offset().top;
						clickPos = e.pageY - jQuery(scrollBarObj).offset().top;
					}else{
						parentTopLeft = jQuery(scrollBarObj).parent().offset().left;
						clickPos = e.pageX - jQuery(scrollBarObj).offset().left;
					}
				} else if(eType=="touchstart"){
					if(thisObj.settings.elements[scrollbarKey]['property']=="top"){
						parentTopLeft = jQuery(scrollBarObj).parent().offset().top;
						clickPos = e.touches[0].pageY - jQuery(scrollBarObj).offset().top;
					}else{
						parentTopLeft = jQuery(scrollBarObj).parent().offset().left;
						clickPos = e.touches[0].pageX - jQuery(scrollBarObj).offset().left;
					}
				}
				
				
				if(!thisObj.animating)
					thisObj.scrollBarPosition = thisObj.getPos(thisObj.step);
					
				var mousemoveFunction = function(e,eType){

					if(eType=='mousemove'){
						if(thisObj.settings.elements[scrollbarKey]['property']=="top")
							var mouseNow = (e.pageY - parentTopLeft)-clickPos;
						else
							var mouseNow = (e.pageX - parentTopLeft)-clickPos;
					} else if(eType=='touchmove'){
						if(thisObj.settings.elements[scrollbarKey]['property']=="top")
							var mouseNow = (e.touches[0].pageY - parentTopLeft)-clickPos;
						else
							var mouseNow = (e.touches[0].pageX - parentTopLeft)-clickPos;
					}
					
					if(mouseNow>=valStart && mouseNow<=valEnd)
						jQuery(thisObj.settings.elements[scrollbarKey]['selector']).css(thisObj.settings.elements[scrollbarKey]['property'],mouseNow);
					else if(mouseNow<valStart){
						jQuery(thisObj.settings.elements[scrollbarKey]['selector']).css(thisObj.settings.elements[scrollbarKey]['property'],valStart);
						mouseNow = valStart;
					}
					else if(mouseNow>valEnd){
						jQuery(thisObj.settings.elements[scrollbarKey]['selector']).css(thisObj.settings.elements[scrollbarKey]['property'],valEnd);
						mouseNow = valEnd;
					}
					
					positionValid = false;
					position = thisObj.settings.elements[scrollbarKey]['step-start']+Math.round(Math.abs(thisObj.settings.elements[scrollbarKey]['step-end']-thisObj.settings.elements[scrollbarKey]['step-start'])*((mouseNow-valStart)/Math.abs(valEnd-valStart)));
					
					if(thisObj.settings.scrollbarType=="scroll"){
						positionTo = thisObj.settings.elements[scrollbarKey]['step-start']+(Math.round((position-thisObj.settings.elements[scrollbarKey]['step-start'])/thisObj.settings.stepsOnScrollbar)*thisObj.settings.stepsOnScrollbar);
						if(positionTo!=thisObj.scrollBarPosition)
							if(positionTo>=thisObj.settings.elements[scrollbarKey]['step-start'] && positionTo<=thisObj.settings.elements[scrollbarKey]['step-end'])
								positionValid = true;
					}else{
						if(thisObj.scrollBarPosition<position){
							for(var i=position;i>=thisObj.scrollBarPosition+1;i--){
								if(indexOf(thisObj.settings.scrollbarPoints,i)!=-1){
									positionValid = true;
									positionTo = i;
									break;
								}
							}
						}else if(thisObj.scrollBarPosition>position){
							for(var i=position;i<=thisObj.scrollBarPosition-1;i++){
								if(indexOf(thisObj.settings.scrollbarPoints,i)!=-1){
									positionValid = true;
									positionTo = i;
									break;
								}
							}
						}
					}
					
					if(positionValid){
						thisObj.scrollBarPosition=positionTo;
						thisObj.goTo({to:positionTo,animationType:'scrollbar',duration:thisObj.settings.durationTweaks['scrollbar']['duration'],durationType:thisObj.settings.durationTweaks['scrollbar']['durationType'],minStepDuration:thisObj.settings.durationTweaks['scrollbar']['minStepDuration']});
					}
				}
				
				if(eType=="mousedown"){
					jQuery(document).bind('mousemove.myEventMouseMove',function(e){
						mousemoveFunction(e,'mousemove');
					});
					jQuery(document).bind('mouseup.myEventMouseUp',function(){
						jQuery(document).unbind('mousemove.myEventMouseMove');
						jQuery(document).unbind('mouseup.myEventMouseUp');
						jQuery('body').unbind("selectstart.disableSelection");
						(typeof(htmlUnselectableAttr)!='undefined') ? jQuery('body').attr('unselectable',htmlUnselectableAttr) : jQuery('body').removeAttr('unselectable');  
						(typeof(cssUserSelect)!='undefined') ? jQuery('body').css('user-select', cssUserSelect) : false;  
						if(thisObj.settings.scrollbarActiveClass!=null)
							jQuery(thisObj.settings.elements[scrollbarKey]['selector']).removeClass(thisObj.settings.scrollbarActiveClass);
					});
				}

				if(eType=="touchstart"){
					var touchmoveFunction = function(e){
						e.preventDefault();
						mousemoveFunction(e,'touchmove');
					}
					scrollBarObj.addEventListener('touchmove',touchmoveFunction,false);
					var touchendFunction = function(e){
						scrollBarObj.removeEventListener('touchmove',touchmoveFunction);
						scrollBarObj.removeEventListener('touchend',touchendFunction);
						if(thisObj.settings.scrollbarActiveClass!=null)
							jQuery(thisObj.settings.elements[scrollbarKey]['selector']).removeClass(thisObj.settings.scrollbarActiveClass);
					}
					scrollBarObj.addEventListener('touchend',touchendFunction,false);
				}
			}
			
			if(window.navigator.msPointerEnabled){
				scrollBarObj.addEventListener('MSPointerDown',function(e){
					mousedownFunction(e,'mousedown',this);
					e.stopPropagation();					
				}, false);
				if(thisObj.settings.enableScrollbarTouch)
					jQuery(scrollBarObj).css('-ms-touch-action','none');
			}
			else if('onmousedown' in document.documentElement){
				jQuery(scrollBarObj).bind('mousedown',function(e){
					mousedownFunction(e,'mousedown',this);
					e.stopPropagation();					
				});
			}
			if(thisObj.settings.enableScrollbarTouch && ('ontouchstart' in document.documentElement)){
				scrollBarObj.addEventListener('touchstart',function(e){
					mousedownFunction(e,'touchstart',this);
					e.stopPropagation();					
				}, false);
			}
		}
		
		for(key in thisObj.settings.elements){
			
			/*DELETES ALL NON ANIMATED ELEMENTS*/
			if(thisObj.settings.elements[key]['method']!='animate'){
				delete thisObj.settings.elements[key];
				continue;
			}
			
			/*DELETES UNUSED ELEMENTS AND FINDS SCROLLBAR*/
			if(thisObj.settings.elements[key]['scrollbar'] && (thisObj.settings.elements[key]['property']=="top" || thisObj.settings.elements[key]['property']=="left")){
				/*BINDS MOUSEEVENTS TO SCROLLBAR*/
				jQuery(thisObj.settings.elements[key]['selector']).each(function(){
					addScrollbarEvents(this,key);
				});
			}
			else {
				delete thisObj.settings.elements[key]['value-start'];
				delete thisObj.settings.elements[key]['value-end'];
			}
		}
		
		/*CALLS FUNCTION TO BIND MOUSE AND SCROLL EVENTS*/
		thisObj.bindScrollTouchEvents();
		
		/*THIS WILL SET THE CSS VALUES ON LOAD*/
		if(thisObj.settings.initCSS)
			thisObj.initCSS();

		/*INCREMENT MAX*/
		thisObj.settings.max++;
	}
	
	/*ANIMATING MAIN FUNCTION!!!*/
	isAlive.prototype.animateSite = function(){
		
		var thisObj = this;
		
		//console.log('lastScroll:'+thisObj.lastStep+'|Scroll:'+thisObj.step+'|Duration:'+thisObj.animateDuration);
		
		if(thisObj.animating){
			jQuery(thisObj.TimeLine).stop();
			jQuery('.'+thisObj.settings.animateClass).stop();
		}
		
		thisObj.animating=true;
		
		var key;
		var animations = {};
		var start;
		var end;
		var timing;
		var loop;
		var directionForward;
		var loopFound;
		
		loopFound = (thisObj.l(thisObj.lastStep)!=thisObj.l(thisObj.step));
		
		if(thisObj.step>thisObj.lastStep){
			/*SCROLL DOWN*/
			directionForward = true;
			for(key in thisObj.settings.elements){
				
				if(thisObj.animationType=='scrollbar' && key==thisObj.scrollbarActive)
					continue;
				
				if((thisObj.settings.elements[key]['step-end']+thisObj.l(thisObj.lastStep)<=thisObj.lastStep || thisObj.settings.elements[key]['step-start']+thisObj.l(thisObj.lastStep)>=thisObj.step)==false){
					loop = thisObj.l(thisObj.lastStep);
					if(thisObj.settings.elements[key]['step-start']+loop<=thisObj.lastStep)
						start=thisObj.lastStep;
					else
						start=thisObj.settings.elements[key]['step-start']+loop;
	
					if(thisObj.settings.elements[key]['step-end']+loop>=thisObj.step)
						end=thisObj.getPos(thisObj.step);
					else
						end=thisObj.settings.elements[key]['step-end'];
						
					timing = Math.floor((thisObj.animateDuration/(thisObj.step-thisObj.lastStep))*((end+loop)-start))*1;
					
					if(typeof(animations[start])=="undefined")
						animations[start] = {};
					if(typeof(animations[start][thisObj.settings.elements[key]['selector']])=="undefined")
						animations[start][thisObj.settings.elements[key]['selector']] = {};
					animations[start][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']] = {
						'duration':timing,
						'end':end,
						'to':thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']],
						'useCSS3':thisObj.settings.elements[key]['useCSS3'],
						'useJQuery':thisObj.settings.elements[key]['useJQuery'],
						'easing':thisObj.settings.elements[key]['easing']
					};
					//console.log('Id:'+thisObj.settings.elements[key]['selector']+'|Lastscroll:'+thisObj.lastStep+'|Scroll:'+thisObj.step+'|Css:'+thisObj.settings.elements[key]['property']+'|Start:'+start+'|End:'+end+'|Duration:'+timing+'|Css Value:'+thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']]+'|Css Real:'+jQuery(thisObj.settings.elements[key]['selector']).css(thisObj.settings.elements[key]['property']));
				}	
				if(loopFound && (thisObj.settings.elements[key]['step-end']+thisObj.l(thisObj.step)<=thisObj.lastStep || thisObj.settings.elements[key]['step-start']+thisObj.l(thisObj.step)>=thisObj.step)==false){
					loop = thisObj.l(thisObj.step);
					if(thisObj.settings.elements[key]['step-start']+loop<=thisObj.lastStep)
						start=thisObj.lastStep;
					else
						start=thisObj.settings.elements[key]['step-start']+loop;
	
					if(thisObj.settings.elements[key]['step-end']+loop>=thisObj.step)
						end=thisObj.getPos(thisObj.step);
					else
						end=thisObj.settings.elements[key]['step-end'];
	
					timing = Math.floor((thisObj.animateDuration/(thisObj.step-thisObj.lastStep))*((end+loop)-start))*1;
					
					if(typeof(animations[start])=="undefined")
						animations[start] = {};
					if(typeof(animations[start][thisObj.settings.elements[key]['selector']])=="undefined")
						animations[start][thisObj.settings.elements[key]['selector']] = {};
					animations[start][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']] = {
						'duration':timing,
						'end':end,
						'to':thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']],
						'useCSS3':thisObj.settings.elements[key]['useCSS3'],
						'useJQuery':thisObj.settings.elements[key]['useJQuery'],
						'easing':thisObj.settings.elements[key]['easing']
					};
					//console.log('Id:'+thisObj.settings.elements[key]['selector']+'|Lastscroll:'+thisObj.lastStep+'|Scroll:'+thisObj.step+'|Css:'+thisObj.settings.elements[key]['property']+'|Start:'+start+'|End:'+end+'|Duration:'+timing+'|Css Value:'+thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']]+'|Css Real:'+jQuery(thisObj.settings.elements[key]['selector']).css(thisObj.settings.elements[key]['property']));
				}
			}
		}else{
			/*SCROLL UP*/
			directionForward = false;
			for(key in thisObj.settings.elements){
				
				if(thisObj.animationType=='scrollbar' && key==thisObj.scrollbarActive)
					continue;
				
				if((thisObj.settings.elements[key]['step-end']+thisObj.l(thisObj.step)<=thisObj.step || thisObj.settings.elements[key]['step-start']+thisObj.l(thisObj.step)>=thisObj.lastStep)==false){
					
					loop = thisObj.l(thisObj.step);
					if(thisObj.settings.elements[key]['step-end']+loop>=thisObj.lastStep)
						start=thisObj.lastStep;
					else
						start=thisObj.settings.elements[key]['step-end']+loop;

					if(thisObj.settings.elements[key]['step-start']+loop<=thisObj.step)
						end=thisObj.getPos(thisObj.step);
					else
						end=thisObj.settings.elements[key]['step-start'];
					
					timing = Math.floor((thisObj.animateDuration/(thisObj.lastStep-thisObj.step))*(start-(end+loop)))*1;
					
					if(typeof(animations[start])=="undefined")
						animations[start] = {};
					if(typeof(animations[start][thisObj.settings.elements[key]['selector']])=="undefined")
						animations[start][thisObj.settings.elements[key]['selector']] = {};
					animations[start][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']] = {
						'duration':timing,
						'end':end,
						'to':thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']],
						'useCSS3':thisObj.settings.elements[key]['useCSS3'],
						'useJQuery':thisObj.settings.elements[key]['useJQuery'],
						'easing':thisObj.settings.elements[key]['easing']
					};
					//console.log('Id:'+thisObj.settings.elements[key]['selector']+'|Lastscroll:'+thisObj.lastStep+'|Scroll:'+thisObj.step+'|Css:'+thisObj.settings.elements[key]['property']+'|Start:'+start+'|End:'+end+'|Duration:'+timing+'|Css Value:'+thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']]+'|Css Real:'+jQuery(thisObj.settings.elements[key]['selector']).css(thisObj.settings.elements[key]['property']));
				}	
				if(loopFound && (thisObj.settings.elements[key]['step-end']+thisObj.l(thisObj.lastStep)<=thisObj.step || thisObj.settings.elements[key]['step-start']+thisObj.l(thisObj.lastStep)>=thisObj.lastStep)==false){
					
					loop = thisObj.l(thisObj.lastStep);
					if(thisObj.settings.elements[key]['step-end']+loop>=thisObj.lastStep)
						start=thisObj.lastStep;
					else
						start=thisObj.settings.elements[key]['step-end']+loop;

					if(thisObj.settings.elements[key]['step-start']+loop<=thisObj.step)
						end=thisObj.getPos(thisObj.step);
					else
						end=thisObj.settings.elements[key]['step-start'];
					
					timing = Math.floor((thisObj.animateDuration/(thisObj.lastStep-thisObj.step))*(start-(end+loop)))*1;
					
					if(typeof(animations[start])=="undefined")
						animations[start] = {};
					if(typeof(animations[start][thisObj.settings.elements[key]['selector']])=="undefined")
						animations[start][thisObj.settings.elements[key]['selector']] = {};
					animations[start][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']] = {
						'duration':timing,
						'end':end,
						'to':thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']],
						'useCSS3':thisObj.settings.elements[key]['useCSS3'],
						'useJQuery':thisObj.settings.elements[key]['useJQuery'],
						'easing':thisObj.settings.elements[key]['easing']
					};
					//console.log('Id:'+thisObj.settings.elements[key]['selector']+'|Lastscroll:'+thisObj.lastStep+'|Scroll:'+thisObj.step+'|Css:'+thisObj.settings.elements[key]['property']+'|Start:'+start+'|End:'+end+'|Duration:'+timing+'|Css Value:'+thisObj.animPositions[end][thisObj.settings.elements[key]['selector']][thisObj.settings.elements[key]['property']]+'|Css Real:'+jQuery(thisObj.settings.elements[key]['selector']).css(thisObj.settings.elements[key]['property']));
				}
			}
		}
		
		var stepStart = thisObj.lastStep;
		var stepEnd = thisObj.step;
		var firstTime = true;
		var lastStep = thisObj.lastStep;
		
		/* STARTS ANIMATION */
		jQuery(thisObj.TimeLine).animate({"timer":"+=100"},{duration:thisObj.animateDuration,easing:'linear',queue:false,
			complete : function(){
				var selector,property;
				
				thisObj.animating = false;
				thisObj.animationType='none';
				thisObj.forceAnimation = false;
				
				for(selector in thisObj.CSS3TransitionArray){
					thisObj.CSS3TransitionArray[selector] = {};
					thisObj.CSS3ValuesArray[selector] = {};
					jQuery(selector).css(vPTransition,thisObj.getTransitionArray(selector));
				}
				
				if(thisObj.rebuildOnStop){
					thisObj.rebuildLayout();
					thisObj.rebuildOnStop = false;
					if(thisObj.onComplete!==null){
						setTimeout(function(){
							var onComplete = thisObj.onComplete;
							thisObj.onComplete = null;
							onComplete();
						},25);
					}
				}
				else{
					if(thisObj.onComplete!==null){
						var onComplete = thisObj.onComplete;
						thisObj.onComplete = null;
						onComplete();
					}
				}
			},
			step: function(now, fx) {
			
				var pos,step,selector,property,className,direction,duration;
				
				var value = Math.round((stepStart+(((stepEnd-stepStart)/100)*(now-fx.start)))*100)/100;
				
				thisObj.lastStep = value;
				
				var valid = false;
				
				if(firstTime){
					valid = true;
					pos = value;
				} else if(directionForward && Math.floor(value)>lastStep){
					valid = true;
					pos = Math.floor(value);
				} else if(!directionForward && Math.ceil(value)<lastStep){
					valid = true;
					pos = Math.ceil(value);
				}
				
				if(valid){
					if(firstTime){
						step = lastStep;
						firstTime = false;
					} else {
						if(directionForward) 
							step = lastStep+1;
						else
							step = lastStep-1;
					}
					
					while((directionForward && step<=pos) || (!directionForward && step>=pos)){

						/*ANIMATE-SET && SET && ADD && REMOVE CLASS*/
						if(step==parseInt(step)){
							(directionForward)?((step!=stepStart)?direction = 'forward':direction = null):((step!=stepEnd)?direction = 'backward':direction = null);
							if(direction!=null){
								if(typeof(thisObj.setArray[direction][thisObj.getPos(step)])!="undefined"){ 
									for(selector in thisObj.setArray[direction][thisObj.getPos(step)]){
										for(property in thisObj.setArray[direction][thisObj.getPos(step)][selector])
											thisObj.setCSS(selector,property,thisObj.setArray[direction][thisObj.getPos(step)][selector][property]);
									}
								}
								if(typeof(thisObj.onOffClassArray[direction][thisObj.getPos(step)])!="undefined"){ 
									for(selector in thisObj.onOffClassArray[direction][thisObj.getPos(step)]){
										for(className in thisObj.onOffClassArray[direction][thisObj.getPos(step)][selector]){
											if(thisObj.onOffClassArray[direction][thisObj.getPos(step)][selector][className]==true)
												jQuery(selector).addClass(className);
											else
												jQuery(selector).removeClass(className);
										}
									}
								}
							}
						}
						
						/*ANIMATE*/
		    			if(step!=stepEnd && typeof(animations[step])!="undefined"){
					    	for(selector in animations[step]){
						    	for(property in animations[step][selector]){
						    		duration = 0;
						    		if ((directionForward && (animations[step][selector][property]['end']-thisObj.getPos(value))>0) || (!directionForward && (thisObj.getPos(value)-animations[step][selector][property]['end'])>0))
						    			duration = Math.floor(animations[step][selector][property]['duration']*(Math.abs(animations[step][selector][property]['end']-thisObj.getPos(value))/Math.abs(animations[step][selector][property]['end']-thisObj.getPos(step))));
							    	if(!animations[step][selector][property]['useCSS3']){
										if(animations[step][selector][property]['useJQuery']){
											var tObj = {};
											tObj[property] = animations[step][selector][property]['to'];
											jQuery(selector).animate(tObj,{duration:duration,easing:animations[step][selector][property]['easing'],queue:false});										
										}
										else
											thisObj.animateJS(step,selector,property,animations[step][selector][property]['to'],duration,animations[step][selector][property]['easing']);
							    	}	
							    	else
										thisObj.animateCSS3(selector,property,animations[step][selector][property]['to'],duration,animations[step][selector][property]['easing']);
						    	}
					    	}
		    			}
						
						/*STEP-POINTS AND ON-STEP EVENT*/
						if(step!=stepStart){
							if(thisObj.haveStepPoints){
								var pointFound=indexOf(thisObj.settings.stepPoints,thisObj.getPos(step));
								if(pointFound!=-1){
									jQuery(thisObj.settings.stepPointsSelector).removeClass(thisObj.settings.stepPointsActiveClass);
									jQuery(thisObj.settings.stepPointsSelector).eq(pointFound).addClass(thisObj.settings.stepPointsActiveClass);
								}
							}
							if(thisObj.settings.onStep!=null)
								thisObj.settings.onStep(thisObj.getPos(step),Math.floor(step/thisObj.settings.max),thisObj.animationType);
						}
						
						if(directionForward){
							lastStep = Math.floor(step);
							step = Math.floor(step)+1;
						} else {
							lastStep = Math.ceil(step);
							step = Math.ceil(step)-1;
						}
					}
				}
			}
		});
	}
	
	/* FUNCTION FOR JUMP */
	isAlive.prototype.doJump = function(pos){
		
		var thisObj = this;
		var directionForward,stepPos,currentPosition,nextPosition,notAllowed;

		if(!thisObj.allowWheel || thisObj.forceAnimation)
			return false;
		
		if(thisObj.settings.wheelDelay!==false){
			clearTimeout(thisObj.wheelTimer);
			thisObj.wheelTimer = setTimeout(function(){
				thisObj.waitWheellEnd = false;
			},thisObj.settings.wheelDelay);
		}
		
		(thisObj.animating)?((thisObj.lastStep<thisObj.step)?directionForward=true:directionForward=false):directionForward=null;

		if(thisObj.settings.wheelDelay===false && thisObj.animating && thisObj.animationType=='jump' && ((directionForward && pos)||(!directionForward && !pos)))
			return false;
		
		if(thisObj.settings.wheelDelay!==false && thisObj.waitWheellEnd && thisObj.animating && thisObj.animationType=='jump' && ((directionForward && pos)||(!directionForward && !pos)))
			return false;
			
		if(thisObj.settings.wheelDelay!==false)	
			thisObj.waitWheellEnd = true;
		
		stepPos = thisObj.getPos(thisObj.lastStep);
		currentPosition = indexOf(thisObj.settings.jumpPoints,stepPos);
		if(currentPosition==-1){
			currentPosition = null;
			if(stepPos<=thisObj.settings.jumpPoints[0])
				currentPosition=-0.5;
			else{
				for(var i=0;i<=thisObj.settings.jumpPoints.length-2;i++){
					if(stepPos>thisObj.settings.jumpPoints[i] && stepPos<thisObj.settings.jumpPoints[i+1]){
						currentPosition = i + 0.5;
						break;
					}
				}
				if(currentPosition==null)
					currentPosition=(thisObj.settings.jumpPoints.length-1)+0.5;
			}
		}
		
		if(!thisObj.animating || (thisObj.animating && thisObj.animationType!='jump') || (thisObj.animating && thisObj.animationType=='jump' && ((directionForward && !pos)||(!directionForward && pos)))){
			notAllowed = null;
			nextPosition = currentPosition;
		}else{
			if(pos){
				if(currentPosition<thisObj.settings.jumpPoints.length-1)
					notAllowed = Math.ceil(currentPosition);
				else
					notAllowed = 0;
			}
			else{
				if(currentPosition>0)
					notAllowed = Math.floor(currentPosition);
				else
					notAllowed = thisObj.settings.jumpPoints.length-1;
			}
			nextPosition = thisObj.jumpPosition;
		}
		
		if(pos){
			if(nextPosition<(thisObj.settings.jumpPoints.length-1))
				nextPosition = Math.floor(nextPosition+1);
			else if(thisObj.settings.loop)
				nextPosition=0;
			else
				return;
		}
		else{
			if(nextPosition>0)
				nextPosition = Math.ceil(nextPosition-1);
			else if(thisObj.settings.loop)
				nextPosition=thisObj.settings.jumpPoints.length-1
			else
				return;
		}
		
		if(pos){
			if(nextPosition === notAllowed)
				return false;
			thisObj.jumpPosition = nextPosition;
			thisObj.goTo({to:thisObj.settings.jumpPoints[thisObj.jumpPosition],orientation:'next',animationType:'jump',duration:thisObj.settings.durationTweaks['wheel']['duration'],durationType:thisObj.settings.durationTweaks['wheel']['durationType'],minStepDuration:thisObj.settings.durationTweaks['wheel']['minStepDuration']});
		}else{
			if(nextPosition === notAllowed)
				return false;
			thisObj.jumpPosition = nextPosition;
			thisObj.goTo({to:thisObj.settings.jumpPoints[thisObj.jumpPosition],orientation:'prev',animationType:'jump',duration:thisObj.settings.durationTweaks['wheel']['duration'],durationType:thisObj.settings.durationTweaks['wheel']['durationType'],minStepDuration:thisObj.settings.durationTweaks['wheel']['minStepDuration']});
		}		
	}
	
	/* FUNCTION FOR SCROLL */
	isAlive.prototype.doScroll = function(pos){
		
		var thisObj = this;
		
		if(!thisObj.allowWheel || thisObj.forceAnimation)
			return false;
		
		if(thisObj.animating && thisObj.animationType!='scroll'){
			thisObj.step=Math.round(thisObj.lastStep);
			thisObj.onComplete=null;
		}
		else if(thisObj.animating && thisObj.animationType=='scroll' && ((thisObj.lastStep<thisObj.step && !pos)||(thisObj.lastStep>thisObj.step && pos)))
			thisObj.step=Math.round(thisObj.lastStep);
		
		
		if(pos){
			if((thisObj.step+thisObj.settings.stepsOnScroll<=thisObj.settings.max-1 || thisObj.settings.loop) && Math.floor((thisObj.step+thisObj.settings.stepsOnScroll)/thisObj.settings.max)-Math.floor(thisObj.lastStep/thisObj.settings.max)<=1 && (thisObj.step+thisObj.settings.stepsOnScroll)-thisObj.lastStep<=thisObj.settings.maxScroll)
				thisObj.step = thisObj.step+thisObj.settings.stepsOnScroll;
			else if(thisObj.step<thisObj.settings.max-1 && thisObj.step+thisObj.settings.stepsOnScroll>thisObj.settings.max-1 && !thisObj.settings.loop && (thisObj.settings.max-1)-thisObj.lastStep<=thisObj.settings.maxScroll){
					thisObj.step = thisObj.settings.max-1;
			}else
				return;
		}else{
			if((thisObj.step-thisObj.settings.stepsOnScroll>=thisObj.settings.min || thisObj.settings.loop) && Math.floor(thisObj.lastStep/thisObj.settings.max)-Math.floor((thisObj.step-thisObj.settings.stepsOnScroll)/thisObj.settings.max)<=1 && thisObj.lastStep-(thisObj.step-thisObj.settings.stepsOnScroll)<=thisObj.settings.maxScroll)
				thisObj.step = thisObj.step-thisObj.settings.stepsOnScroll;
			else if(thisObj.step>thisObj.settings.min && thisObj.step-thisObj.settings.stepsOnScroll<thisObj.settings.min && !thisObj.settings.loop && thisObj.lastStep-thisObj.settings.min<=thisObj.settings.maxScroll)
				thisObj.step = thisObj.settings.min;
			else
				return;
		}
		
		if(thisObj.settings.debug)
			jQuery('#isalive-'+thisObj.uniqId+'-debuger span:first').html(thisObj.step);
		
		clearTimeout(thisObj.wheelTimer);
		if(!thisObj.animating || (thisObj.animating && thisObj.animationType!='scroll')){
			thisObj.animationType='scroll';
			thisObj.animateDuration = thisObj.settings.durationTweaks.wheel.duration;
			thisObj.animateSite();
		}
		else{
			thisObj.wheelTimer = setTimeout(function(){
				thisObj.animationType='scroll';
				thisObj.animateDuration = thisObj.settings.durationTweaks.wheel.duration;
				thisObj.animateSite();
			},20);
		}
	}
	
	/*DO TOUCH WIPE*/
	isAlive.prototype.doWipe = function(value){
		
		var thisObj = this;
		var directionForward,stepPos,currentPosition,nextPosition,notAllowed;
		
		if(!thisObj.allowTouch || thisObj.forceAnimation)
			return false;
			
		(thisObj.animating)?((thisObj.lastStep<thisObj.step)?directionForward=true:directionForward=false):directionForward=null;
		stepPos = thisObj.getPos(thisObj.lastStep);
		currentPosition = indexOf(thisObj.settings.wipePoints,stepPos);
		if(currentPosition==-1){
			currentPosition = null;
			if(stepPos<=thisObj.settings.wipePoints[0])
				currentPosition=-0.5;
			else{
				for(var i=0;i<=thisObj.settings.wipePoints.length-2;i++){
					if(stepPos>thisObj.settings.wipePoints[i] && stepPos<thisObj.settings.wipePoints[i+1]){
						currentPosition = i + 0.5;
						break;
					}
				}
				if(currentPosition==null)
					currentPosition=(thisObj.settings.wipePoints.length-1)+0.5;
			}
		}
		
		if(!thisObj.animating || (thisObj.animating && thisObj.animationType!='wipe') || (thisObj.animating && thisObj.animationType=='wipe' && ((directionForward && value==-1)||(!directionForward && value==1)))){
			notAllowed = null;
			nextPosition = currentPosition;
		}else{
			if(value==1){
				if(currentPosition<thisObj.settings.wipePoints.length-1)
					notAllowed = Math.ceil(currentPosition);
				else
					notAllowed = 0;
			}
			else{
				if(currentPosition>0)
					notAllowed = Math.floor(currentPosition);
				else
					notAllowed = thisObj.settings.wipePoints.length-1;
			}
			nextPosition = thisObj.wipePosition;
		}
		
		if(value==1){
			if(nextPosition<(thisObj.settings.wipePoints.length-1))
				nextPosition = Math.floor(nextPosition+1);
			else if(thisObj.settings.loop)
				nextPosition=0;
			else
				return;
		}
		else{
			if(nextPosition>0)
				nextPosition = Math.ceil(nextPosition-1);
			else if(thisObj.settings.loop)
				nextPosition=thisObj.settings.wipePoints.length-1
			else
				return;
		}		

		if(value==1){
			if(nextPosition===notAllowed)
				return false;
			thisObj.wipePosition = nextPosition;
			thisObj.goTo({to:thisObj.settings.wipePoints[thisObj.wipePosition],orientation:'next',animationType:'wipe',duration:thisObj.settings.durationTweaks['touch']['duration'],durationType:thisObj.settings.durationTweaks['touch']['durationType'],minStepDuration:thisObj.settings.durationTweaks['touch']['minStepDuration']});
		}else{
			if(nextPosition===notAllowed)
				return false;
			thisObj.wipePosition = nextPosition;
			thisObj.goTo({to:thisObj.settings.wipePoints[thisObj.wipePosition],orientation:'prev',animationType:'wipe',duration:thisObj.settings.durationTweaks['touch']['duration'],durationType:thisObj.settings.durationTweaks['touch']['durationType'],minStepDuration:thisObj.settings.durationTweaks['touch']['minStepDuration']});
		}		
	}
	
	/*DO TOUCH DRAG*/
	isAlive.prototype.doDrag = function(value){

		var thisObj = this;

		if(!thisObj.allowTouch || thisObj.forceAnimation)
			return false;
		
		if(thisObj.animating && thisObj.animationType!='drag'){
			thisObj.step=Math.round(thisObj.lastStep);
			thisObj.onComplete=null;
		}
		else if(thisObj.animating && thisObj.animationType=='drag' && ((thisObj.lastStep<thisObj.step && value==-1)||(thisObj.lastStep>thisObj.step && value==1)))
			thisObj.step=Math.round(thisObj.lastStep);
		
		if(value==1){
			if((thisObj.step+thisObj.settings.stepsOnDrag<=thisObj.settings.max-1 || thisObj.settings.loop) && Math.floor((thisObj.step+thisObj.settings.stepsOnDrag)/thisObj.settings.max)-Math.floor(thisObj.lastStep/thisObj.settings.max)<=1 && (thisObj.step+thisObj.settings.stepsOnDrag)-thisObj.lastStep<=thisObj.settings.maxDrag)
				thisObj.step = thisObj.step+thisObj.settings.stepsOnDrag;
			else if(thisObj.step<thisObj.settings.max-1 && thisObj.step+thisObj.settings.stepsOnDrag>thisObj.settings.max-1 && !thisObj.settings.loop && (thisObj.settings.max-1)-thisObj.lastStep<=thisObj.settings.maxDrag)
					thisObj.step = thisObj.settings.max-1;
			else
				return;
		}else{
			if((thisObj.step-thisObj.settings.stepsOnDrag>=thisObj.settings.min || thisObj.settings.loop) && Math.floor(thisObj.lastStep/thisObj.settings.max)-Math.floor((thisObj.step-thisObj.settings.stepsOnDrag)/thisObj.settings.max)<=1 && thisObj.lastStep-(thisObj.step-thisObj.settings.stepsOnDrag)<=thisObj.settings.maxDrag)
				thisObj.step = thisObj.step-thisObj.settings.stepsOnDrag;
			else if(thisObj.step>thisObj.settings.min && thisObj.step-thisObj.settings.stepsOnDrag<thisObj.settings.min && !thisObj.settings.loop && thisObj.lastStep-thisObj.settings.min<=thisObj.settings.maxDrag)
				thisObj.step = thisObj.settings.min;
			else
				return;
		}
		
		if(thisObj.settings.debug)
			jQuery('#isalive-'+thisObj.uniqId+'-debuger span:first').html(thisObj.step);
		
		thisObj.animationType='drag';
		thisObj.animateDuration = thisObj.settings.durationTweaks.touch.duration;
		thisObj.animateSite();
	}
	
	/*GO TO FUNCTION*/
	isAlive.prototype.goTo = function(options){
		settings = jQuery.extend({
			to:null,
			duration: null,
			durationType: 'default',  /*default|step*/
			orientation:'default', /*default|loop|next|prev*/
			animationType:'goTo',
			onComplete:null,
			minStepDuration:null,
			force:false
		},options);
		
		var thisObj = this;
		var pos,posNext,posPrev;
		
		if(thisObj.forceAnimation)
			return false;
			
		pos = settings.to+(Math.floor(thisObj.lastStep/thisObj.settings.max)*thisObj.settings.max);
		
		if(thisObj.settings.loop){
			if(settings.orientation=='loop'){
				if(thisObj.lastStep<=pos)
					posNext = pos;
				else
					posNext = settings.to+((Math.floor(thisObj.lastStep/thisObj.settings.max)+1)*thisObj.settings.max);
		
				if(thisObj.lastStep>=pos)
					posPrev = pos;
				else
					posPrev = settings.to+((Math.floor(thisObj.lastStep/thisObj.settings.max)-1)*thisObj.settings.max);
				
				if(Math.abs(thisObj.lastStep-posNext)>Math.abs(thisObj.lastStep-posPrev))
					pos = posPrev;
				else
					pos = posNext;
			}
			else if(settings.orientation == 'next'){
				if(thisObj.lastStep>=pos)
					pos = settings.to+((Math.floor(thisObj.lastStep/thisObj.settings.max)+1)*thisObj.settings.max);
			}
			else if(settings.orientation == 'prev'){
				if(thisObj.lastStep<=pos)
					pos = settings.to+((Math.floor(thisObj.lastStep/thisObj.settings.max)-1)*thisObj.settings.max);
			}
		}
		
		if(!thisObj.animating && pos==thisObj.lastStep)
			return;
		
		thisObj.step = pos;
		thisObj.animationType = settings.animationType;
		thisObj.forceAnimation = settings.force;
		(settings.onComplete!==null)?thisObj.onComplete=settings.onComplete:thisObj.onComplete=null;
		
		/*MIN VALUE FOR DURATION*/
		if(settings.minStepDuration==null) 
			var minStep = thisObj.settings.minStepDuration;
		else
			var minStep = settings.minStepDuration;
			
		if(settings.durationType=='step' && settings.duration!=null){
			if(settings.duration<minStep)
				thisObj.animateDuration=Math.abs(thisObj.lastStep-thisObj.step)*minStep;
			else
				thisObj.animateDuration=Math.abs(thisObj.lastStep-thisObj.step)*settings.duration;
		}
		else{
			if(settings.duration==null){
				if(thisObj.settings.duration/Math.abs(thisObj.lastStep-thisObj.step)<minStep)
					thisObj.animateDuration = Math.abs(thisObj.lastStep-thisObj.step)*minStep;
				else
					thisObj.animateDuration = thisObj.settings.duration;
			}else{
				if(settings.duration/Math.abs(thisObj.lastStep-thisObj.step)<minStep)
					thisObj.animateDuration = Math.abs(thisObj.lastStep-thisObj.step)*minStep;
				else
					thisObj.animateDuration = settings.duration;
			}
		}
		
		thisObj.animateSite();
	}
	
	/*SKIPS TO A POSITION*/
	isAlive.prototype.skip = function(step){
		
		var thisObj = this;

		if(thisObj.forceAnimation)
			return false;
		
		var doSkip = function(step){
			var pos,pointFound,pointFoundSelector,direction;
			var valuesCSS = {};
			var valuesClasses = {};
			var selector,property,className;

			pos = thisObj.getPos(thisObj.step);
			pointFoundSelector = -1;
			pointFound = -1;
			
			while((pos<=step && thisObj.getPos(thisObj.step)<step) || (pos>=step && thisObj.getPos(thisObj.step)>step) || (pos==step && thisObj.getPos(thisObj.step)==step)){
				(step>thisObj.step)?direction = 'forward':((pos!=step)?direction = 'backward':direction = 'forward');
				if(typeof(thisObj.setArray[direction][pos])!="undefined"){
					for(selector in thisObj.setArray[direction][pos]){
						if(typeof(valuesCSS[selector]) == "undefined")
							valuesCSS[selector] = {};
						for(property in thisObj.setArray[direction][pos][selector])
							valuesCSS[selector][property] = thisObj.setArray[direction][pos][selector][property];
					}
				}
				if(typeof(thisObj.onOffClassArray[direction][pos])!="undefined"){
					for(selector in thisObj.onOffClassArray[direction][pos]){
						if(typeof(valuesClasses[selector]) == "undefined")
							valuesClasses[selector] = {}						
						for(className in thisObj.onOffClassArray[direction][pos][selector])
							valuesClasses[selector][className] = thisObj.onOffClassArray[direction][pos][selector][className];
					}
				}
				if(typeof(thisObj.animPositions[pos])!="undefined"){
					for(selector in thisObj.animPositions[pos]){
						if(typeof(valuesCSS[selector]) == "undefined")
							valuesCSS[selector] = {};
						for(property in thisObj.animPositions[pos][selector])
							valuesCSS[selector][property] = thisObj.animPositions[pos][selector][property];
					}
				}
				if(thisObj.haveStepPoints){
					pointFound=indexOf(thisObj.settings.stepPoints,pos);
					if(pointFound!=-1)
						pointFoundSelector = pointFound;
				}
				if(thisObj.settings.onStep!=null)
					thisObj.settings.onStep(pos,Math.floor(pos/thisObj.settings.max),'skip');
				
				(thisObj.getPos(thisObj.step)<step)?pos = pos + 1:pos = pos - 1;
			}

			for(selector in valuesCSS)
				for(property in valuesCSS[selector])
					thisObj.setCSS(selector,property,valuesCSS[selector][property]);
			
			for(selector in valuesClasses){
				for(className in valuesClasses[selector]){
					if(valuesClasses[selector][className]==true)
						jQuery(selector).addClass(className);	
					else
						jQuery(selector).removeClass(className);	
				}
			}
				
			if(pointFoundSelector!=-1 ){
				jQuery(thisObj.settings.stepPointsSelector).removeClass(thisObj.settings.stepPointsActiveClass);
				jQuery(thisObj.settings.stepPointsSelector).eq(pointFoundSelector).addClass(thisObj.settings.stepPointsActiveClass);
			}
			
			step = step+thisObj.l(thisObj.lastStep);
			
			thisObj.step = step;
			thisObj.lastStep = step;
		}
		
		if(thisObj.animating){
			thisObj.stop();
			setTimeout(function(){
				doSkip(step);
			},25);
		}
		else
			doSkip(step);
	}

	/*STOPS ANIMATIONS*/	
	isAlive.prototype.stopTransitions = function(){
		var thisObj = this;
		for(var selector in thisObj.CSS3TransitionArray){
			var CSSValues = {};
			for(var property in thisObj.CSS3TransitionArray[selector])
				CSSValues[property] = jQuery(selector).css(property);
			thisObj.CSS3TransitionArray[selector] = {};
			thisObj.CSS3ValuesArray[selector] = {};
			jQuery(selector).css(vPTransition,thisObj.getTransitionArray(selector));
			jQuery(selector).css(CSSValues);
		}
	}
	
	/*STOPS ANIMATIONS*/	
	isAlive.prototype.stop = function(){
		var thisObj = this;
		
		if(!thisObj.animating)
			return true;
		
		jQuery(thisObj.TimeLine).stop();
		jQuery('.'+thisObj.settings.animateClass).stop();
		thisObj.stopTransitions();
		
		thisObj.animating = false;
		thisObj.animationType='none';
		thisObj.forceAnimation = false;
		thisObj.onComplete = null;
		
		thisObj.step = Math.round(thisObj.lastStep);

		if(thisObj.rebuildOnStop){
			thisObj.rebuildLayout();
			thisObj.rebuildOnStop = false;
		}
	}

	/*PLAYS ANIMATIONS TO THE NEXT PLAY POINT*/	
	isAlive.prototype.play = function(options){
		var thisObj = this;
		if(thisObj.forceAnimation || thisObj.settings.playPoints.length<=1)
			return false;
		options = jQuery.extend({},options);
		var pos = Math.floor(thisObj.getPos(thisObj.lastStep));
		var max = thisObj.settings.max-1;
		var found = null; 
		for(var i=pos+1;i<=max;i++)
			if(indexOf(thisObj.settings.playPoints,i)!=-1){
				found = i;
				break
			}
		if(found==null && thisObj.settings.loop)
			found = thisObj.settings.playPoints[0];
		if(found==null)
			return false;
		options['to'] = found;
		options['orientation'] = 'next';
		options['animationType'] = 'play';
		thisObj.goTo(options);
	}

	/*PLAYS BACK ANIMATIONS TO THE PREV PLAY POINT*/
	isAlive.prototype.rewind = function(options){
		var thisObj = this;
		if(thisObj.forceAnimation || thisObj.settings.playPoints.length<=1)
			return false;
		options = jQuery.extend({},options);
		var pos = Math.ceil(thisObj.getPos(thisObj.lastStep));
		var found = null; 
		for(var i=pos-1;i>=0;i--)
			if(indexOf(thisObj.settings.playPoints,i)!=-1){
				found = i;
				break
			}
		if(found==null && thisObj.settings.loop)
			found = thisObj.settings.playPoints[thisObj.settings.playPoints.length-1];
		if(found==null)
			return false;
		options['to'] = found;
		options['orientation'] = 'prev';
		options['animationType'] = 'rewind';
		thisObj.goTo(options);
	}
	/*AUTOPLAY ANIMATION IN LOOPS*/
	isAlive.prototype.autoplay = function(options){
		var thisObj = this;
		if(thisObj.forceAnimation || !thisObj.settings.loop)
			return false;
		options = jQuery.extend({},options);
		var count = false;
		var loop = 0;
		if(typeof(options['count'])!="undefined"){
			count = options['count'];
			delete options['count'];
		}
		var onLoop = null;
		if(typeof(options['onLoop'])!="undefined"){
			onLoop = options['onLoop'];
			delete options['onLoop'];
		}
		options['to'] = 0;
		if(typeof(options['orientation'])=="undefined" || (options['orientation']!="next" && options['orientation']!="prev"))
			options['orientation'] = "next";
		options['onComplete'] = function(){
			doAutoplay();
		};
		var doAutoplay = function(){
			if(count===false || count>0){
				if(onLoop!=null){
					loop++;
					onLoop(loop);
				}
				thisObj.goTo(options);
				if(count!==false)
					count--;
			}
		};
		doAutoplay();
	}
	
/*ISALIVE MAIN OBJECT:END*/
	
/*JQUERY PLUGIN PART:BEGIN*/	

	var methods = {
		create : function(thisObj,options){
			var selector = thisObj.selector;
			if(jQuery(selector).length==0 || typeof(isAliveObjects[selector])!="undefined")
				return false;
			if(typeof(options) == "undefined")
				options = {};
			isAliveObjects[selector] = new isAlive(selector,options);
			return thisObj;
		},
		goTo : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			if(typeof(options) == "undefined" || typeof(options['to']) == "undefined" || options['to']<0 || options['to']>isAliveObjects[selector].settings.max-1)
				return false;
			options['to'] = Math.round(options['to']);
			isAliveObjects[selector].goTo(options);
			return thisObj;
		},
		skip : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			if(typeof(options) == "undefined" || typeof(options['to']) == "undefined" || options['to']<0 || options['to']>isAliveObjects[selector].settings.max-1)
				return false;
			options['to'] = Math.round(options['to']);
			isAliveObjects[selector].skip(options['to']);
			return thisObj;
		},
		play : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].play(options);
			return thisObj;
		},
		rewind : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].rewind(options);
			return thisObj;
		},
		autoplay : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].autoplay(options);
			return thisObj;
		},
		stop : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].stop();
			return thisObj;
		},
		rebuild : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].rebuildLayout();
			return thisObj;
		},
		enableWheel : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].allowWheel = options;
			return thisObj;
		},
		enableTouch : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].allowTouch = options;
			return thisObj;
		},
		addOnComplete : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined" || !isAliveObjects[selector].animating)
				return false;
			isAliveObjects[selector].onComplete = options;
			return thisObj;
		},
		getCurrentPosition : function(thisObj){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			return isAliveObjects[selector].getPos(isAliveObjects[selector].lastStep);
		},
		getStepPosition : function(thisObj){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			return isAliveObjects[selector].getPos(isAliveObjects[selector].step);
		},
		getMaxStep : function(thisObj){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			return (isAliveObjects[selector].settings.max-1);
		},
		getBrowser : function(){
			return getBrowser();
		},
		getVersion : function(){
			return "1.7.1";
		}
	};
	
	jQuery.fn.isAlive = function(method,options) {
		if(methods[method]){
			var mFunc = methods[method];
			return mFunc(this,options);
		}
		else
			return (typeof(method)=='undefined')?isReady:false;
	};
	   
/*JQUERY PLUGIN PART:END*/
	
})(jQuery);
