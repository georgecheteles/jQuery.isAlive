/*
 _       __                          __                                 _     
| |     / /__        _________  ____/ /__        ____ ___  ____ _____ _(_)____
| | /| / / _ \______/ ___/ __ \/ __  / _ \______/ __ `__ \/ __ `/ __ `/ / ___/
| |/ |/ /  __/_____/ /__/ /_/ / /_/ /  __/_____/ / / / / / /_/ / /_/ / / /__  
|__/|__/\___/      \___/\____/\__,_/\___/     /_/ /_/ /_/\__,_/\__, /_/\___/  
                                                              /____/          
jQuery.isAlive(1.3.3)
Written by George Cheteles (george@we-code-magic.com).
Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
Please attribute the author if you use it.
Find me at:
	http://www.we-code-magic.com 
	office@we-code-magic.com
Last modification on this file: 19 November 2013
*/

(function(jQuery) {
	
	/*THIS IS THE MAIN ARRAY THAT KEEPS ALL THE OBJECTS*/
	var isAliveObjects = [];
	var isReady = false;
	var browserObj = null;
	var indexOf = null;
	
	var resizeTimer;
	var windowWidth;
	var windowHeight;
	
	/*CONVERTING HEX TO RGB*/
	function hexToRgb(hex) {
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {r: parseInt(result[1], 16),g: parseInt(result[2], 16),	b: parseInt(result[3], 16)} : null;
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
	
	/*FUNCTION ADD FORMAT*/
	function addFormat(value,format){
		if(typeof(format)!="undefined")
			return format.replace(/value/g,value);
		return value;
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
			if(browser=="msie10+" && browserObj.msie && parseInt(browserObj.version)>10) validBrowser = true;
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

	/*REMOVES ALL DOUBLE SPACES*/
	function fixSpaces(text){
		if(typeof(text)!="string" || text.indexOf(" ")==-1)
			return text;
		text = text.split(" ");
		var ret = [];
		for(var key in text)
			if(text[key]!="")
				ret.push(text[key]);
		return ret.join(" ");
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
		for (i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			hash = c + (hash << 6) + (hash << 16) - hash;
		}
		return hash;
	}
	
	/*RETURNS THE OBJECT LENGTH*/
	function lengthObj(obj){
		var key;
		var ret = 0;
		for(key in obj)
			ret++;
		return ret;
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
		jQuery.uaMatch = function( ua ) {
			ua = ua.toLowerCase();
			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};
		matched = jQuery.uaMatch( navigator.userAgent );
		browser = {};
		var mobile = (/(android|bb\d+|meego).+mobile|webos|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0,4)));
		
		if(mobile)
			browser.mobile = true;
		
		if( matched.browser ) {
			browser[ matched.browser ] = true;
			browser.version = matched.version;
		}
		if( browser.chrome ) {
			browser.webkit = true;
		} else if( browser.webkit ) {
			browser.safari = true;
		}
		return browser;
	}
	
	/* CHECKS PROPERTY IS CSS3 */
	function isCSS3(property){
		var CSS3 = ['transform','trasition','border-radius','background-size','box-shadow'];
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
	function fixCSS3(property){
		if(property=='transform' || property=='transition' || property=='filter'){
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
	function getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd,format,type){
		var value,valTemp,formatDetected,splitChar;
		
		splitChar = " ";
		if(valStart.toString().indexOf(",")!=-1)
			splitChar = ",";
			
		/* IF THE FORMAT DOES NOT MATCH */		
		if(valStart.toString().split(splitChar).length!=valEnd.toString().split(splitChar).length)
				return false;
				
		valStart = valStart.toString().split(splitChar);
		valEnd = valEnd.toString().split(splitChar);
		
		value = [];
		for(var key in valStart){
			
			if(valStart[key].indexOf("px")!=-1 || valEnd[key].indexOf("px")!=-1)
				formatDetected = "px";
			else if(valStart[key].indexOf("%")!=-1 && valEnd[key].indexOf("%")!=-1)
				formatDetected = "%"; 
			else if(valStart[key].indexOf("deg")!=-1 && valEnd[key].indexOf("deg")!=-1)
				formatDetected = "deg";
			else
				formatDetected = "";
				
			valStart[key] = valStart[key].replace(formatDetected,"");
			valEnd[key] = valEnd[key].replace(formatDetected,"");
			
			if(isNaN(parseFloat(valStart[key])) || isNaN(parseFloat(valEnd[key]))){
				value.push(valStart[key]);
				continue;
			}
			
			valStart[key] = parseFloat(valStart[key]);
			valEnd[key] = parseFloat(valEnd[key]);
			
			valTemp = parseFloat(valStart[key]+((valEnd[key]-valStart[key])*((pos-stepStart)/(stepEnd-stepStart))));
			
			if(type=="int")
				valTemp = Math.round(valTemp);

			value.push(valTemp.toString()+formatDetected);
		}
		
		value = value.join(splitChar);
		value = addFormat(value,format);
		
		if(isNumber(value))
			return parseFloat(value);
		
		return value;
	}
	
/*ISALIVE MAIN OBJECT:BEGIN*/	
	
	function isAlive(selector,options){
		
		this.step=0;
		this.lastStep=0;
		this.animating = false;
		this.forceAnimation = false;
		this.scrollTimer;
		this.animPositions = [];
		this.animateDuration;
		this.touchPosition;
		this.jumpPosition;
		this.animationType='none';
		this.mySelector = selector;
		this.allowScroll = true;
		this.allowTouch = true;
		this.scrollbarActive = null;
		this.waitScrollEnd = false;
		this.waitScrollTimer;
		
		/* MY CLASS/SET ARRAYS */
		this.setArray = {};
		this.onOffClassArray = {};
		
		this.cssDinamicElements = [];
		
		this.params = {};
		this.onComplete = null;
		this.uniqId = Math.round(Math.random()*1000)+1;
		this.CSS3TransitionArray = {};
		this.CSS3DefaultTransitionArray = {};
		this.functionsArray = {};
		this.haveStepPoints;
		this.rebuildOnStop = false;
		this.msTouchAction;
		this.lastCSS = {};
		
		this.settings = jQuery.extend({}, {
			elements:{},
			elementsType:"linear", /*linear|tree*/
			duration: 1000,
			durationTweaks:{}, /*obj: {jump|wipe|scrollBar:duration|durationType|minStepDuration}*/
			enableScroll:true,
			scrollType:"scroll", /*scroll|jump*/
			jumpPoints:[],
			max:null,
			min:0,
			maxScroll:1000000,
			maxDrag:1000000,
			debug:false,
			easing:'linear', /*linear|swing*/
			start:0,
			loop:false,
			preventScroll:true,
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
			CSS3Easing:'linear', /*linear|ease|ease-in|ease-out|ease-in-out*/
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
			scrollDelay:250, /*number or false*/
			enableGPU:"none", /*none|webki|chrome|safari|mozilla|msie|opera|mobile*/
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
	
	/*ANIMATE FUNCTION THAT WORKS FOR BACKGROUND-POSITION TOO*/
	isAlive.prototype.animateCSS = function(startPos,selector,property,value,duration,easing){
		
		var thisObj = this;
		var temp;
		var format = null;
		var isInt = (property.indexOf("color")!=-1);
		
		if(startPos==parseInt(startPos) || typeof(thisObj.lastCSS[selector+'|'+property])=="undefined")
			thisObj.lastCSS[selector+'|'+property] = thisObj.animPositions[Math.round(startPos)][selector][property].toString();

		var start = thisObj.lastCSS[selector+'|'+property];
		var end = value.toString();
		
		if(start.indexOf('(')!=-1){
			temp = start.split('(');
			format = temp[0];
			start = temp[1].replace(")","");
			temp = end.split('(');
			end = temp[1].replace(")","");
		}
			
		var splitChar = " ";
		if(start.indexOf(',')!=-1)
			splitChar = ",";
		start = start.split(splitChar);
		end = end.split(splitChar);
		
		if(start.length!=end.length)
			return false;
			
		var tempObj = {};
		tempObj[property.replace(/-/g,"")+'Timer']="+=100";
		jQuery(selector).animate(tempObj,{duration:duration,easing:easing,queue:false,
			step: function(step,fx){
				var arrayTemp = [];
				var val,f,CSSVal;
				step = step-fx.start;
				for(var key in start){
					f = ""
					if(start[key].indexOf("px")!=-1)
						f = "px";
					else if(start[key].indexOf("%")!=-1)
						f = "%";
					else if(start[key].indexOf("deg")!=-1)
						f = "deg";
					startT = parseInt(start[key].replace(f,""));
					endT = parseInt(end[key].replace(f,""));
					val = startT + ((endT-startT)*(step/100));
					if(isInt)
						val = Math.round(val);
					arrayTemp.push(val.toString()+f);
				}
				CSSVal = arrayTemp.join(splitChar);
				if(format!=null)
					CSSVal = format+"("+CSSVal+")";
				thisObj.lastCSS[selector+'|'+property] = CSSVal;
				thisObj.setCSS(selector,property,CSSVal);
			}
		});
	}
	
	/* REPLACES PARAMS */
	isAlive.prototype.convertParams = function(params){
		
		var thisObj = this;

		var returnValue,paramsConv,key,format,splitChar,evl,lastBracket,bracketCount,key;
		
		if(typeof(params) == "function")
			return params(thisObj.mySelector,thisObj.params);
			
		paramsConv = fixSpaces(params).toString();
		
		splitChar = " ";
		if(paramsConv.indexOf(",")!=-1)
			splitChar = ",";
		
		if(!isDinamic(params)){
			paramsConv = paramsConv.split(splitChar); 
			for(key in paramsConv)
				paramsConv[key] = paramsConv[key].replace("top","0%").replace("center","50%").replace("bottom","100%").replace("left","0%").replace("right","100%");		
		}
		else{
			paramsConv = paramsConv.replace(/elementTop/g,thisObj.params.elementTop.toString());
			paramsConv = paramsConv.replace(/elementLeft/g,thisObj.params.elementLeft.toString());
			paramsConv = paramsConv.replace(/elementHeight/g,thisObj.params.elementHeight.toString());
			paramsConv = paramsConv.replace(/elementWidth/g,thisObj.params.elementWidth.toString());
			paramsConv = paramsConv.replace(/documentHeight/g,thisObj.params.documentHeight.toString());
			paramsConv = paramsConv.replace(/documentWidth/g,thisObj.params.documentWidth.toString());
			paramsConv = paramsConv.replace(/windowHeight/g,thisObj.params.windowHeight.toString());
			paramsConv = paramsConv.replace(/windowWidth/g,thisObj.params.windowWidth.toString());
			paramsConv = paramsConv.split(splitChar); 
			for(key in paramsConv){
				paramsConv[key] = paramsConv[key].replace("top","0%").replace("center","50%").replace("bottom","100%").replace("left","0%").replace("right","100%");
				if(paramsConv[key].indexOf('eval(')!=-1){
					/*FIND CLOSING BRACKET POSITION*/
					bracketCount = 0;
					for(lastBracket=0;lastBracket<=paramsConv[key].indexOf('eval(');lastBracket++)
						if(paramsConv[key].charAt(lastBracket)=="(")
					bracketCount++;
					for(lastBracket=paramsConv[key].length-1;lastBracket>=0;lastBracket--){
						if(paramsConv[key].charAt(lastBracket)==")"){
							if(bracketCount==0)
								break;
							else
								bracketCount--;
						}
					}
					evl = paramsConv[key].substr(paramsConv[key].indexOf('eval(')+5,(lastBracket-5)-paramsConv[key].indexOf('eval('));
					try{
						eval("evl = "+evl+';');
					}catch(err){}
					paramsConv[key] = paramsConv[key].substr(0,paramsConv[key].indexOf('eval(')) + evl + paramsConv[key].substr(lastBracket+1);
				}
			}
		}
		
		paramsConv = paramsConv.join(splitChar);
		if(isNumber(paramsConv))
			return parseFloat(paramsConv);
		else
			return paramsConv;
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
				var fix = fixCSS3(temp[0]);
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
	
	/*SET CSS VALUES*/
	isAlive.prototype.setCSS = function(selector,property,value){
		var thisObj = this;
		var key,key2;
		if(typeof(property)=="string"){
			if(typeof(thisObj.functionsArray[property])!="undefined"){
				var f = thisObj.functionsArray[property];
				f(selector,value);
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
			else{
				if(typeof(thisObj.CSS3TransitionArray[selector])!="undefined" && typeof(thisObj.CSS3TransitionArray[selector][property])!="undefined"){
					delete thisObj.CSS3TransitionArray[selector][property];
					jQuery(selector).css(fixCSS3('transition'),thisObj.getTransitionArray(selector));
				}
				else if(property==fixCSS3("transition")){
					value = thisObj.getTransitionArray(selector,value);
				}
				jQuery(selector).css(property,value);
				return;
			}
		}		
		else{
			jQuery(selector).css(fixCSS3('transition'),thisObj.getTransitionArray(selector));
			jQuery(selector).css(property);
		}
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
					value = thisObj.convertParams(thisObj.cssDinamicElements[key]['value']);
					value = addFormat(value,thisObj.cssDinamicElements[key]['format'])
					thisObj.setCSS(thisObj.cssDinamicElements[key]['selector'],thisObj.cssDinamicElements[key]['property'],value);
				} else if(thisObj.cssDinamicElements[key]['method']=="animate"){
					/*REPOSITION ANIMATE*/	
					valStart = thisObj.convertParams(thisObj.cssDinamicElements[key]['value-start']);
					valEnd = thisObj.convertParams(thisObj.cssDinamicElements[key]['value-end']);
					if(thisObj.cssDinamicElements[key]['scrollbar']==true){
						thisObj.settings.elements[thisObj.cssDinamicElements[key]['key']]['value-start']=valStart;
						thisObj.settings.elements[thisObj.cssDinamicElements[key]['key']]['value-end']=valEnd;
					}
					stepStart = thisObj.cssDinamicElements[key]['step-start']
					stepEnd = thisObj.cssDinamicElements[key]['step-end']
					for(pos=stepStart;pos<=stepEnd;pos++){
						value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd,thisObj.cssDinamicElements[key]['format'],thisObj.cssDinamicElements[key]['type']);
						thisObj.animPositions[pos][thisObj.cssDinamicElements[key]['selector']][thisObj.cssDinamicElements[key]['property']]=value;
					}
					if(typeof(changedElements[thisObj.cssDinamicElements[key]['selector']])=="undefined")
						changedElements[thisObj.cssDinamicElements[key]['selector']] = [];
					if(indexOf(changedElements[thisObj.cssDinamicElements[key]['selector']],thisObj.cssDinamicElements[key]['property'])==-1)
						changedElements[thisObj.cssDinamicElements[key]['selector']].push(thisObj.cssDinamicElements[key]['property']);
				}else if(thisObj.cssDinamicElements[key]['method']=="set"){
					/*REPOSITION SET*/
					selector = thisObj.cssDinamicElements[key]['selector'];
					property = thisObj.cssDinamicElements[key]['property'];
					stepFrom = thisObj.cssDinamicElements[key]['step-from'];

					valAbove = thisObj.cssDinamicElements[key]['value-above'];
					if(isDinamic(valAbove)){
						valAbove = thisObj.convertParams(valAbove);
						valAbove = addFormat(valAbove,thisObj.cssDinamicElements[key]['format']);
						thisObj.setArray['forward'][stepFrom][selector][property] = valAbove;
					}
					
					valUnder = thisObj.cssDinamicElements[key]['value-under'];
					if(isDinamic(valUnder)){
						valUnder = thisObj.convertParams(valUnder);
						valUnder = addFormat(valUnder,thisObj.cssDinamicElements[key]['format']);
						thisObj.setArray['backward'][stepFrom][selector][property] = valUnder;
					}
					if(typeof(changedElements[thisObj.cssDinamicElements[key]['selector']])=="undefined")
						changedElements[thisObj.cssDinamicElements[key]['selector']] = [];
					if(indexOf(changedElements[thisObj.cssDinamicElements[key]['selector']],thisObj.cssDinamicElements[key]['property'])==-1)
						changedElements[thisObj.cssDinamicElements[key]['selector']].push(thisObj.cssDinamicElements[key]['property']);
				}else if(thisObj.cssDinamicElements[key]['method']=="animate-set"){
					/*REPOSITION ANIMATE-SET*/
					valStart = thisObj.cssDinamicElements[key]['value-start'];
					valEnd = thisObj.cssDinamicElements[key]['value-end'];
					if(isDinamic(valStart))
						valStart = thisObj.convertParams(valStart);
					if(isDinamic(valEnd))
						valEnd = thisObj.convertParams(valEnd);
					selector = thisObj.cssDinamicElements[key]['selector'];
					property = thisObj.cssDinamicElements[key]['property'];
					stepStart = thisObj.cssDinamicElements[key]['step-start'];
					stepEnd = thisObj.cssDinamicElements[key]['step-end'];
					moveOn = thisObj.cssDinamicElements[key]['move-on'];
					for(pos=stepStart;pos<=stepEnd;pos++){
						if((pos-stepStart)%moveOn==0){
							value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd,thisObj.cssDinamicElements[key]['format'],thisObj.cssDinamicElements[key]['type']);
							if(pos>stepStart){
								thisObj.setArray['forward'][pos][selector][property] = value;
								thisObj.setArray['backward'][pos][selector][property] = oldValue;
							}
							oldValue = value;
						}
					}
					if(typeof(changedElements[thisObj.cssDinamicElements[key]['selector']])=="undefined")
						changedElements[thisObj.cssDinamicElements[key]['selector']] = [];
					if(indexOf(changedElements[thisObj.cssDinamicElements[key]['selector']],thisObj.cssDinamicElements[key]['property'])==-1)
						changedElements[thisObj.cssDinamicElements[key]['selector']].push(thisObj.cssDinamicElements[key]['property']);
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
		var key,pos,value,posFrom,atStart;
		var thisObj = this;
		if(thisObj.settings.elements[index]['method']=='animate' || thisObj.settings.elements[index]['method']=='animate-set')
			posFrom = parseInt(thisObj.settings.elements[index]['step-start']);
		else if(thisObj.settings.elements[index]['method']=='set')
			posFrom = parseInt(thisObj.settings.elements[index]['step-from']);
		
		atStart = null;
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
		
		if(typeof(thisObj.functionsArray[thisObj.settings.elements[index]['property']])!="undefined")
			return 0;
		
		if(thisObj.settings.elements[index]['property']=="scrollTop")
			return jQuery(thisObj.settings.elements[index]['selector']).scrollTop();
		else if(thisObj.settings.elements[index]['property']=="scrollLeft")
			return jQuery(thisObj.settings.elements[index]['selector']).scrollLeft();
		else{
			value = jQuery(thisObj.settings.elements[index]['selector']).css(thisObj.settings.elements[index]['property']);
			if(value.toString().indexOf(" ")==-1){
				value = value.replace(/px/g,'');
				if(isNumber(value))
					value = parseFloat(value);
			}
			return value;
		}
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
				
				function onTouchStart(e) {
				
					if(!thisObj.allowTouch)
						return;
				
					if(!ie10) {
						if(e.touches.length != 1) 
							return;
						startX = e.touches[0].clientX;
						startY = e.touches[0].clientY;
						isMoving = true;
						this.addEventListener('touchmove', onTouchMove, false);
						this.addEventListener('touchend', cancelTouch, false);
					} else {
						if(e.pointerType==e.MSPOINTER_TYPE_MOUSE)
							return;
						startX = e.clientX;
						startY = e.clientY;
						isMoving = true;
						document.addEventListener('MSPointerMove', onTouchMove, false);
						document.addEventListener('MSPointerUp', cancelTouch, false);
					}
				}
	
				function cancelTouch(e) {
					if(!ie10) {
						this.removeEventListener('touchmove', onTouchMove);
						this.removeEventListener('touchend', cancelTouch);
					} else {
						document.removeEventListener('MSPointerMove', onTouchMove);
						document.removeEventListener('MSPointerUp', cancelTouch);
					}
					isMoving = false;
				}	
		
				function onTouchMove(e) {
					if(!ie10 && thisObj.settings.preventTouch) {
						e.preventDefault();
					}
		    		 
					if(isMoving) {
						if(!ie10) {
							var x = e.touches[0].clientX;
							var y = e.touches[0].clientY;
						} else {
							var x = e.clientX;
							var y = e.clientY;
						}
						var dx = startX - x;
						var dy = startY - y;
						if(thisObj.settings.touchType=='wipe'){
							if(Math.abs(dx) >= thisObj.settings.wipeXFrom) {
								if(dx > 0 && thisObj.settings.touchActions.left!=0) {
									cancelTouch();
									thisObj.doWipeTouch(thisObj.settings.touchActions.left);
									return;
								}
								else if(dx < 0 && thisObj.settings.touchActions.right!=0){
									cancelTouch();
									thisObj.doWipeTouch(thisObj.settings.touchActions.right);
									return;
								}
							}
							if(Math.abs(dy) >= thisObj.settings.wipeYFrom) {
								if(dy > 0 && thisObj.settings.touchActions.up!=0) {
									cancelTouch();
									thisObj.doWipeTouch(thisObj.settings.touchActions.up);
									return;
								}
								else if(dy < 0 && thisObj.settings.touchActions.down!=0) {
									cancelTouch();
									thisObj.doWipeTouch(thisObj.settings.touchActions.down);
									return;
								}
							}
						} else {
							if(Math.abs(dx) >= thisObj.settings.dragXFrom) {
								if(dx > 0 && thisObj.settings.touchActions.left!=0){
									thisObj.doDragTouch(thisObj.settings.touchActions.left);
									startX = x;
								} else if(dx < 0 && thisObj.settings.touchActions.right!=0){
									thisObj.doDragTouch(thisObj.settings.touchActions.right);
									startX = x;
								}
				    		 }
			    			 if(Math.abs(dy) >= thisObj.settings.dragYFrom) {
				    			if(dy > 0 && thisObj.settings.touchActions.up!=0){
				    				thisObj.doDragTouch(thisObj.settings.touchActions.up);
									startY = y;
				    			}else if(dy < 0 && thisObj.settings.touchActions.down!=0){
				    				thisObj.doDragTouch(thisObj.settings.touchActions.down);
									startY = y;
								}
							}
						}
					}
				}
		    	 
				if('ontouchstart' in document.documentElement) {
					this.addEventListener('touchstart', onTouchStart, false);
				} else if(window.navigator.msPointerEnabled){
					ie10 = true;
					this.addEventListener('MSPointerDown', onTouchStart, false);
				}
			});
		}
		
		/* BIND SCROLL EVENTS */
		if(thisObj.settings.enableScroll){
			if(thisObj.settings.scrollType=="scroll"){
				/*FOR NON FIREFOX*/
				jQuery(thisObj.mySelector).bind('DOMMouseScroll', function(e){
					(e.originalEvent.detail > 0)?thisObj.doScroll(true):thisObj.doScroll(false);
					if(thisObj.settings.preventScroll)
						return false;
				});
				/*FOR FIREFOX*/
				jQuery(thisObj.mySelector).bind('mousewheel', function(e){
					(e.originalEvent.wheelDelta < 0)?thisObj.doScroll(true):thisObj.doScroll(false);
					if(thisObj.settings.preventScroll)
						return false;
				});
			}
			else{
				/*FOR FIREFOX*/
				jQuery(thisObj.mySelector).bind('DOMMouseScroll', function(e){
					(e.originalEvent.detail > 0)?thisObj.doJump(true):thisObj.doJump(false);
					if(thisObj.settings.preventScroll)
						return false;
				});
				/*FOR NON FIREFOX*/
				jQuery(thisObj.mySelector).bind('mousewheel', function(e){
					(e.originalEvent.wheelDelta < 0)?thisObj.doJump(true):thisObj.doJump(false);
					if(thisObj.settings.preventScroll)
						return false;
				});
			}
		}
	}
	
	/*THIS FUNCTION CREATES ANIMATION, SET AND CLASS ARRAYS*/
	isAlive.prototype.createElementsArray = function(){
		var thisObj = this;
		var myElements = jQuery.extend({},thisObj.settings.elements);
		var pos;
		var progress;
		var moveTo;
		var key;
		var selector,property,className;
		var valStart,valEnd;
		var stepStart,stepEnd,value;
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
						valStart = myElements[key]['value-start']; 
						valEnd = myElements[key]['value-end'];
						stepStart = myElements[key]['step-start']; 
						stepEnd = myElements[key]['step-end'];
						value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd,myElements[key]['format'],myElements[key]['type']);
						if(typeof(thisObj.animPositions[pos])=="undefined")
							thisObj.animPositions[pos]=[];
						if(typeof(thisObj.animPositions[pos][myElements[key]['selector']])=="undefined")
							thisObj.animPositions[pos][myElements[key]['selector']]=[];
						thisObj.animPositions[pos][myElements[key]['selector']][myElements[key]['property']]=value;
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
						value = getAtPosValue(pos,valStart,valEnd,stepStart,stepEnd,myElements[key]['format'],myElements[key]['type']);
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
		}
		
		
		/*SHOW SCROLL POSITION*/
		if(thisObj.settings.debug)
			jQuery(thisObj.mySelector).append('<div style="position:absolute;padding:5px;border:1px solid gray; color: red; top:10px;left:10px;display:inline-block;background:white;z-index:9999;" id="isalive-'+thisObj.uniqId+'-debuger" class="isalive-debuger"><span>'+thisObj.settings.start+'</span></div>');
		
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
		if(indexOf(['linear','ease','ease-in','ease-out','ease-in-out'],thisObj.settings.CSS3Easing)==-1 && thisObj.settings.CSS3Easing.indexOf('cubic-bezier')==-1)	
			thisObj.settings.CSS3Easing  = "linear";
			
		if(typeof(jQuery.easing[thisObj.settings.easing])=='undefined')
			thisObj.settings.easing = "linear";
		
		/*MAKE SURE THAT MAXSCROLL AND MAXTOUCH IS NO BIGGER THEN SCROLLJUMP AND TOUCHJUMP*/
		if(thisObj.settings.maxScroll<thisObj.settings.stepsOnScroll)
			thisObj.settings.maxScroll = thisObj.settings.stepsOnScroll;
		if(thisObj.settings.maxDrag<thisObj.settings.stepsOnDrag)
			thisObj.settings.maxDrag = thisObj.settings.stepsOnDrag;
		
		/*CHECK FOR TOUCH*/
		if(thisObj.settings.enableTouch && (thisObj.settings.touchType=="wipe" && thisObj.settings.wipePoints.length<=1))
			thisObj.settings.enableTouch = false;
		
		/*GET CSS FOR MSIE 10 TOUCH*/
		if(thisObj.settings.enableTouch && browserObj.msie && parseInt(browserObj.version)>=10 && thisObj.settings.preventTouch){
			thisObj.msTouchAction = jQuery(thisObj.mySelector).css('-ms-touch-action');			
			jQuery(thisObj.mySelector).css('-ms-touch-action',"none");			
		}
		
		/*SORT TOUCH POINT*/
		if(thisObj.settings.enableTouch && thisObj.settings.touchType=='wipe')
			thisObj.settings.wipePoints.sort(function(a,b){return a-b});
		
		/*CHECK FOR SCROLL*/
		if(thisObj.settings.enableScroll && thisObj.settings.scrollType=="jump" && thisObj.settings.jumpPoints.length<=1)
			thisObj.settings.enableScroll = false;

		/*SORT AND GET START SCROLL POINT*/
		if(thisObj.settings.enableScroll && thisObj.settings.scrollType=='jump')
			thisObj.settings.jumpPoints.sort(function(a,b){return a-b});
		
		/*SORT STOP POINTS*/
		thisObj.settings.playPoints.sort(function(a,b){return a-b});

		/*KEEP DEFAULT DURATION*/
		thisObj.animateDuration=thisObj.settings.duration;
			
		/*CHECK IF SCROLLBARPOINTS EXIST*/
		if(thisObj.settings.scrollbarType!="scroll" && thisObj.settings.scrollbarPoints.length==0)
			thisObj.settings.scrollbarType = "scroll";
		
		/*SETS THE DURATION TWEAKS*/
		if(typeof(thisObj.settings.durationTweaks['jump'])=="undefined")
			thisObj.settings.durationTweaks['jump'] = {};
		if(typeof(thisObj.settings.durationTweaks['wipe'])=="undefined")
			thisObj.settings.durationTweaks['wipe'] = {};
		if(typeof(thisObj.settings.durationTweaks['scrollbar'])=="undefined")
			thisObj.settings.durationTweaks['scrollbar'] = {};
		thisObj.settings.durationTweaks['jump'] = jQuery.extend({duration:thisObj.settings.duration,durationType:"default",minStepDuration:thisObj.settings.minStepDuration},thisObj.settings.durationTweaks['jump']);
		thisObj.settings.durationTweaks['wipe'] = jQuery.extend({duration:thisObj.settings.duration,durationType:"default",minStepDuration:thisObj.settings.minStepDuration},thisObj.settings.durationTweaks['wipe']);
		thisObj.settings.durationTweaks['scrollbar'] = jQuery.extend({duration:thisObj.settings.duration,durationType:"default",minStepDuration:thisObj.settings.minStepDuration},thisObj.settings.durationTweaks['scrollbar']);

		/*IF MIN NOT 0 LOOP CAN NOT WORK*/
		if(thisObj.settings.min>0)
			thisObj.settings.loop = false;
			
		/*SET TOUCH ACTIONS*/
		thisObj.settings.touchActions = jQuery.extend({up:1,down:-1,right:0,left:0},thisObj.settings.touchActions);
			
		/*SORT AND INIT STEP POINTS*/	
		thisObj.haveStepPoints = (thisObj.settings.stepPointsSelector!=null && thisObj.settings.stepPointsActiveClass!=null && thisObj.settings.stepPoints.length>0);
		thisObj.settings.stepPoints.sort(function(a,b){return a-b});
		
		/*DELETE ELEMENTS FOR OTHER BROWSERS THEN MINE*/
		for(key in thisObj.settings.elements){
			if(typeof(thisObj.settings.elements[key]['+browsers'])!="undefined"){
				if(!validateBrowsers(thisObj.settings.elements[key]['+browsers']))
					delete thisObj.settings.elements[key];
			}
			else if(typeof(thisObj.settings.elements[key]['-browsers'])!="undefined"){
				if(validateBrowsers(thisObj.settings.elements[key]['-browsers']))
					delete thisObj.settings.elements[key];
			}
		}

		/*ADDS ID AND DUPLICATES ELEMENTS IF USE_ID_ATTRIBUTE OPTION IS ON*/
		var new_elements = [];
		var idIndex = 0;
		var keyIndex = 0;

		for(key in thisObj.settings.elements){
			if(typeof(thisObj.settings.elements[key]['selector'])=="undefined" || typeof(thisObj.settings.elements[key]['method'])=="undefined" || jQuery(thisObj.settings.elements[key]['selector']).length==0)
				delete thisObj.settings.elements[key];
			else{
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
		};
		for(key in new_elements){
			thisObj.settings.elements["ISALIVE_OBJECT_"+keyIndex] = new_elements[key];
			keyIndex++;
		}
		
		/*DELETES UNVALID ELEMENTS AND ADDS ISALIVE CLASS / PREPARES CSS3*/
		var tempArray = [];
		for(key in thisObj.settings.elements){
			if(typeof(thisObj.settings.elements[key]['property'])!="undefined"){
			
				/*BUILD FUNCTIONS ARRAY*/
				if(typeof(thisObj.settings.elements[key]['property'])=='function'){
					if(typeof(thisObj.functionsArray['f:'+toString(thisObj.settings.elements[key]['property'])])=="undefined")
						thisObj.functionsArray['f:'+toString(thisObj.settings.elements[key]['property'])] = thisObj.settings.elements[key]['property'];
					thisObj.settings.elements[key]['property'] = 'f:'+toString(thisObj.settings.elements[key]['property']);	
				}
				
				/*MAKES ALL PROPERTY LOWER CASE*/
				thisObj.settings.elements[key]['property'] = jQuery.trim(thisObj.settings.elements[key]['property']).toLowerCase();
				if(thisObj.settings.elements[key]['property']=='scrolltop')	thisObj.settings.elements[key]['property'] = 'scrollTop';
				if(thisObj.settings.elements[key]['property']=='scrollleft') thisObj.settings.elements[key]['property'] = 'scrollLeft';
				
				/*CSS3 DOES NOT WORK ON IE7&IE8*/
				if(isCSS3(thisObj.settings.elements[key]['property']) && browserObj.msie && parseInt(browserObj.version)<9){
					delete thisObj.settings.elements[key];
					continue;
				}
				
				/* SET@START IS NOT USED WHEN INITCSS IS TRUE*/
				if(thisObj.settings.elements[key]["method"]=="set@start" && thisObj.settings.initCSS){
					delete thisObj.settings.elements[key];
					continue;
				}

				/*PUTS MOVE-ON VALUE TO THE ANIMATE-SET ELEMENTS*/
				if(thisObj.settings.elements[key]["method"]=="animate-set")
					if(typeof(thisObj.settings.elements[key]['move-on'])=='undefined')
						thisObj.settings.elements[key]['move-on'] = 1;
				
				/*DELETES INVALID EASING*/
				if(typeof(thisObj.settings.elements[key]['easing'])!="undefined" && typeof(jQuery.easing[thisObj.settings.elements[key]['easing']])=="undefined")
					delete thisObj.settings.elements[key]['easing'];
				
				/*DELETES INVALID EASING CSS3*/
				if(typeof(thisObj.settings.elements[key]['CSS3Easing'])!="undefined" && indexOf(['linear','ease','ease-in','ease-out','ease-in-out'],thisObj.settings.elements[key]['CSS3Easing'])==-1 && thisObj.settings.elements[key]['CSS3Easing'].indexOf('cubic-bezier')==-1)
					delete thisObj.settings.elements[key]['CSS3Easing'];
					
					
				/*SET CSS3 VARS*/
				if(thisObj.settings.elements[key]["method"]=="animate"){
					if(thisObj.settings.elements[key]['property']=='scrollTop' || thisObj.settings.elements[key]['property']=='scrollLeft' || typeof(thisObj.functionsArray[thisObj.settings.elements[key]["property"]])!="undefined" || (browserObj.msie && parseInt(browserObj.version)<10)){
						thisObj.settings.elements[key]['useCSS3'] = false;
						if(typeof(thisObj.settings.elements[key]["easing"])=="undefined")
							thisObj.settings.elements[key]["easing"] = thisObj.settings.easing;
						if(typeof(thisObj.settings.elements[key]["CSS3Easing"])!="undefined")
							delete thisObj.settings.elements[key]['CSS3Easing'];
					}
					else {
						if((thisObj.settings.useCSS3 && typeof(thisObj.settings.elements[key]['useCSS3'])=="undefined") || thisObj.settings.elements[key]['useCSS3']){
							thisObj.settings.elements[key]['useCSS3'] = true;
							if(typeof(thisObj.settings.elements[key]["CSS3Easing"])=="undefined")
								thisObj.settings.elements[key]["easing"] = thisObj.settings.CSS3Easing;
							else{
								thisObj.settings.elements[key]["easing"] = thisObj.settings.elements[key]["CSS3Easing"];
								delete thisObj.settings.elements[key]['CSS3Easing'];
							}
						}
						else{
							thisObj.settings.elements[key]['useCSS3'] = false;
							if(typeof(thisObj.settings.elements[key]["easing"])=="undefined")
								thisObj.settings.elements[key]["easing"] = thisObj.settings.easing;
							if(typeof(thisObj.settings.elements[key]["CSS3Easing"])!="undefined")
								delete thisObj.settings.elements[key]['CSS3Easing'];
						}
					}
					thisObj.settings.elements[key]['useJQuery'] = true;
					if(thisObj.settings.elements[key]['useCSS3'] || typeof(thisObj.functionsArray[thisObj.settings.elements[key]["property"]])!="undefined" || (!thisObj.settings.elements[key]['useCSS3'] && indexOf(["transform","color","background-color","border-color","border-left-color","border-top-color","border-right-color","border-bottom-color"],thisObj.settings.elements[key]["property"])!=-1))
						thisObj.settings.elements[key]['useJQuery'] = false;
				}

				/*PUT ANIMATE CLASS FOR ANIMATIONS*/
				if(thisObj.settings.elements[key]['method']=="animate" && indexOf(tempArray,thisObj.settings.elements[key]['selector'])==-1){
					jQuery(thisObj.settings.elements[key]['selector']).addClass(thisObj.settings.animateClass);
					tempArray.push(thisObj.settings.elements[key]['selector']);
				}
						
				/*PUTS PREFIX FOR CSS3*/
				thisObj.settings.elements[key]['property'] = fixCSS3(thisObj.settings.elements[key]['property']);
			}
		}
		jQuery(thisObj.mySelector).addClass(thisObj.settings.animateClass);
		
		/*CHECKS IF ENABLE GPU IS VALID*/
		if(thisObj.settings.enableGPU=="none" || typeof(browserObj.webkit)=="undefined")
			var validGPU = false;
		else
			var validGPU = validateBrowsers(thisObj.settings.enableGPU);
		
		var tempArray = [];
		var tempArrayGPU = [];
		for(key in thisObj.settings.elements){
			
			/* CREATES ARRAY WITH TRANSITIONS CSS VALUES*/
			if(!browserObj.msie || (browserObj.msie && parseInt(browserObj.version)>9))
				if(typeof(thisObj.CSS3DefaultTransitionArray[thisObj.settings.elements[key]['selector']])=="undefined"){
					var propTempArray = [];
					var pTemp1 = jQuery(thisObj.settings.elements[key]['selector']).css(fixCSS3('transition-property'));
					var pTemp2 = jQuery(thisObj.settings.elements[key]['selector']).css(fixCSS3('transition-duration'));
					if(pTemp1!="all" || pTemp2!="0s"){
						propTempArray.push(pTemp1);
						propTempArray.push(pTemp2);
						propTempArray.push(jQuery(thisObj.settings.elements[key]['selector']).css(fixCSS3('transition-timing-function')));
						propTempArray.push(jQuery(thisObj.settings.elements[key]['selector']).css(fixCSS3('transition-delay')));
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
			
			/*MAKES WEBKIT GPU ENABLED*/
			if(validGPU && (thisObj.settings.elements[key]['method']=='animate' || thisObj.settings.elements[key]['method']=='animate-set') && indexOf(tempArrayGPU,thisObj.settings.elements[key]['selector'])==-1){
				jQuery(thisObj.settings.elements[key]['selector']).css('-webkit-backface-visibility','hidden') ;
				jQuery(thisObj.settings.elements[key]['selector']).css('-webkit-perspective','1000') ;
				tempArrayGPU.push(thisObj.settings.elements[key]['selector']);
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
			if(thisObj.settings.elements[key]['scrollbar']){
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
		
			/*CONVERT IF HEX COLOR FOUND*/
			if(thisObj.settings.elements[key]["method"]=="animate" || thisObj.settings.elements[key]["method"]=="animate-set"){
				if(indexOf(["color","background-color","border-color","border-left-color","border-top-color","border-right-color","border-bottom-color"],thisObj.settings.elements[key]["property"])!=-1){
					convertValue = hexToRgb(thisObj.settings.elements[key]["value-start"]);
					if(convertValue!=null){
						convertValue = convertValue.r.toString()+','+convertValue.g.toString()+','+convertValue.b.toString();
						thisObj.settings.elements[key]["value-start"] = convertValue;
					}
					convertValue = hexToRgb(thisObj.settings.elements[key]["value-end"]);
					if(convertValue!=null){
						convertValue = convertValue.r.toString()+','+convertValue.g.toString()+','+convertValue.b.toString();
						thisObj.settings.elements[key]["value-end"] = convertValue;
					}
					thisObj.settings.elements[key]["format"] = "rgb(value)";
					thisObj.settings.elements[key]["type"] = "int";
				}
			}
		
			if(thisObj.settings.elements[key]["method"]=="animate" || thisObj.settings.elements[key]["method"]=="animate-set"){
				if(isDinamic(thisObj.settings.elements[key]['value-start']) || isDinamic(thisObj.settings.elements[key]['value-end'])){
					if(thisObj.settings.elements[key]['scrollbar']==true)
						var tempObj = jQuery.extend(true, {key:parseInt(key)}, thisObj.settings.elements[key]);
					else
						var tempObj = jQuery.extend(true, {}, thisObj.settings.elements[key]);
					thisObj.cssDinamicElements.push(tempObj);
				}
				thisObj.settings.elements[key]['value-start'] = thisObj.convertParams(thisObj.settings.elements[key]['value-start']);
				thisObj.settings.elements[key]['value-end'] = thisObj.convertParams(thisObj.settings.elements[key]['value-end']);
			}
			else if(thisObj.settings.elements[key]["method"]=="set"){
				if(isDinamic(thisObj.settings.elements[key]['value-under']) || isDinamic(thisObj.settings.elements[key]['value-above'])){
					var tempObj = jQuery.extend(true, {}, thisObj.settings.elements[key]);
					thisObj.cssDinamicElements.push(tempObj);
				}
				thisObj.settings.elements[key]['value-under'] = thisObj.convertParams(thisObj.settings.elements[key]['value-under']);
				thisObj.settings.elements[key]['value-under'] = addFormat(thisObj.settings.elements[key]['value-under'],thisObj.settings.elements[key]['format'])
				thisObj.settings.elements[key]['value-above'] = thisObj.convertParams(thisObj.settings.elements[key]['value-above']);
				thisObj.settings.elements[key]['value-above'] = addFormat(thisObj.settings.elements[key]['value-above'],thisObj.settings.elements[key]['format'])
			}
			else if(thisObj.settings.elements[key]["method"]=="static"){
				if(isDinamic(thisObj.settings.elements[key]['value'])){
					var tempObj = jQuery.extend(true, {}, thisObj.settings.elements[key]);
					thisObj.cssDinamicElements.push(tempObj);
				}
				convertValue = thisObj.convertParams(thisObj.settings.elements[key]['value']);
				convertValue = addFormat(convertValue,thisObj.settings.elements[key]['format'])
				thisObj.setCSS(thisObj.settings.elements[key]['selector'],thisObj.settings.elements[key]['property'],convertValue);
				delete thisObj.settings.elements[key];
			}
			else if(thisObj.settings.elements[key]["method"]=="set@start"){
				var convertValue = thisObj.convertParams(thisObj.settings.elements[key]["value"]);
				convertValue = addFormat(convertValue,thisObj.settings.elements[key]["format"]);
				thisObj.setCSS(thisObj.settings.elements[key]["selector"],thisObj.settings.elements[key]["property"],convertValue);
				delete thisObj.settings.elements[key];
			}
		}
		
		/*THIS FUNCTION CREATES ANIMATION, SET AND CLASS ARRAYS*/
		thisObj.createElementsArray();
		
		/*SCROLLBAR EVENTS*/
		var addScrollbarEvents = function(scrollBarObj,scrollbarKey){

			var mousedownFunction = function(e,eType,myObj){
			
				if(thisObj.forceAnimation)
					return false;
					
				if(window.navigator.msPointerEnabled && !thisObj.settings.enableScrollbarTouch)
					if(e.pointerType!=e.MSPOINTER_TYPE_MOUSE)
						return false;
				
				var htmlUnselectableAttr,cssUserSelect,parentTopLeft,clickPos,position,positionTo,scrollBarPosition,positionValid;
				
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
				
				scrollBarPosition = thisObj.getPos(Math.round(thisObj.lastStep));
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
					
					if(mouseNow>=thisObj.settings.elements[scrollbarKey]['value-start'] && mouseNow<=thisObj.settings.elements[scrollbarKey]['value-end'])
						jQuery(thisObj.settings.elements[scrollbarKey]['selector']).css(thisObj.settings.elements[scrollbarKey]['property'],mouseNow);
					else if(mouseNow<thisObj.settings.elements[scrollbarKey]['value-start']){
						jQuery(thisObj.settings.elements[scrollbarKey]['selector']).css(thisObj.settings.elements[scrollbarKey]['property'],thisObj.settings.elements[scrollbarKey]['value-start']);
						mouseNow = thisObj.settings.elements[scrollbarKey]['value-start'];
					}
					else if(mouseNow>thisObj.settings.elements[scrollbarKey]['value-end']){
						jQuery(thisObj.settings.elements[scrollbarKey]['selector']).css(thisObj.settings.elements[scrollbarKey]['property'],thisObj.settings.elements[scrollbarKey]['value-end']);
						mouseNow = thisObj.settings.elements[scrollbarKey]['value-end'];
					}
					
					positionValid = false;
					position = thisObj.settings.elements[scrollbarKey]['step-start']+Math.round(Math.abs(thisObj.settings.elements[scrollbarKey]['step-end']-thisObj.settings.elements[scrollbarKey]['step-start'])*((mouseNow-thisObj.settings.elements[scrollbarKey]['value-start'])/Math.abs(thisObj.settings.elements[scrollbarKey]['value-end']-thisObj.settings.elements[scrollbarKey]['value-start'])));
					
					if(thisObj.settings.scrollbarType=="scroll"){
						positionTo = thisObj.settings.elements[scrollbarKey]['step-start']+(Math.round((position-thisObj.settings.elements[scrollbarKey]['step-start'])/thisObj.settings.stepsOnScrollbar)*thisObj.settings.stepsOnScrollbar);
						if(Math.abs(scrollBarPosition-positionTo)>=thisObj.settings.stepsOnScrollbar)
							positionValid = true;
						else if(position!=scrollBarPosition && (position==thisObj.settings.elements[scrollbarKey]['step-start'] || position==thisObj.settings.elements[scrollbarKey]['step-end'])){
							positionValid = true;
							positionTo = position;
						}
					}else{
						if(scrollBarPosition<position){
							for(var i=position;i>=scrollBarPosition+1;i--){
								if(indexOf(thisObj.settings.scrollbarPoints,i)!=-1){
									positionValid = true;
									positionTo = i;
									break;
								}
							}
						}else if(scrollBarPosition>position){
							for(var i=position;i<=scrollBarPosition-1;i++){
								if(indexOf(thisObj.settings.scrollbarPoints,i)!=-1){
									positionValid = true;
									positionTo = i;
									break;
								}
							}
						}
					}
					
					if(positionValid){
						scrollBarPosition=positionTo;
						if(thisObj.getPos(thisObj.lastStep)<positionTo)
							thisObj.goTo({to:positionTo,orientation:'next',animationType:'scrollbar',duration:thisObj.settings.durationTweaks['scrollbar']['duration'],durationType:thisObj.settings.durationTweaks['scrollbar']['durationType'],minStepDuration:thisObj.settings.durationTweaks['scrollbar']['minStepDuration']});
						else if(thisObj.getPos(thisObj.lastStep)>positionTo)
							thisObj.goTo({to:positionTo,orientation:'prev',animationType:'scrollbar',duration:thisObj.settings.durationTweaks['scrollbar']['duration'],durationType:thisObj.settings.durationTweaks['scrollbar']['durationType'],minStepDuration:thisObj.settings.durationTweaks['scrollbar']['minStepDuration']});
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
				if(thisObj.settings.enableScrollbarTouch)
					jQuery(scrollBarObj).css('-ms-touch-action',"none");
				scrollBarObj.addEventListener('MSPointerDown',function(e){
					mousedownFunction(e,'mousedown',this);
					e.stopPropagation();					
				}, false);
					
			} else if('onmousedown' in document.documentElement){
				jQuery(scrollBarObj).bind('mousedown',function(e){
					mousedownFunction(e,'mousedown',this);
					e.stopPropagation();					
				});
			}
			if('ontouchstart' in document.documentElement && thisObj.settings.enableScrollbarTouch){
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
			if(thisObj.settings.elements[key]['scrollbar']!=true){
				delete thisObj.settings.elements[key]['value-start'];
				delete thisObj.settings.elements[key]['value-end'];
			}else if(thisObj.settings.elements[key]['method']=="animate" && (thisObj.settings.elements[key]['property']=="top" || thisObj.settings.elements[key]['property']=="left")){
				/*BINDS MOUSEEVENTS TO SCROLLBAR*/
				jQuery(thisObj.settings.elements[key]['selector']).each(function(){
					addScrollbarEvents(this,key);
				});
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

		jQuery('.'+thisObj.settings.animateClass).stop();
		thisObj.animating=true;
		
		var key;
		var animations = {};
		var start;
		var end;
		var timing;
		var loop;
		var directionForward;
		var loopFound;
		
		if(thisObj.step==thisObj.lastStep){
			thisObj.animating=false;
			thisObj.animationType='none';
			thisObj.animateDuration = thisObj.settings.duration;
			thisObj.forceAnimation = false;			
			return;
		}
		
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
		var CSS3Found = false;
		var CSS3ValuesArray = {};
		var lastStep = thisObj.lastStep;
		
		/* STARTS ANIMATION */
		jQuery(thisObj.mySelector).animate({"timer":"+=100"},{duration:thisObj.animateDuration,easing:'linear',queue:false,
			complete : function(){
				var selector;
				thisObj.animating = false;
				thisObj.animationType='none';
				thisObj.animateDuration = thisObj.settings.duration;
				thisObj.forceAnimation = false;
				
				for(selector in thisObj.CSS3TransitionArray){
					delete thisObj.CSS3TransitionArray[selector];
					jQuery(selector).css(fixCSS3('transition'),thisObj.getTransitionArray(selector));
				}

				if(thisObj.rebuildOnStop){
					thisObj.rebuildLayout();
					thisObj.rebuildOnStop = false;
				}
				
				if(thisObj.onComplete!==null){
					thisObj.onComplete();
					thisObj.onComplete = null;
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
							(directionForward)?direction = 'forward':((step!=stepEnd)?direction = 'backward':direction = 'forward');
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
						
						/*ANIMATE*/
		    			if(step!=stepEnd && typeof(animations[step])!="undefined"){
					    	for(selector in animations[step]){
						    	for(property in animations[step][selector]){
								
						    		duration = 0;
						    		if ((directionForward && (animations[step][selector][property]['end']-thisObj.getPos(value))>0) || (!directionForward && (thisObj.getPos(value)-animations[step][selector][property]['end'])>0))
						    			duration = Math.floor(animations[step][selector][property]['duration']*(Math.abs(animations[step][selector][property]['end']-thisObj.getPos(value))/Math.abs(animations[step][selector][property]['end']-thisObj.getPos(step))));
										
							    	if(!animations[step][selector][property]['useCSS3']){
										if(animations[step][selector][property]['useJQuery']){
											var animObj = {};
											animObj[property] = animations[step][selector][property]['to'];
											jQuery(selector).animate(animObj,{duration:duration,easing:animations[step][selector][property]['easing'],queue:false});										
										}
										else
											thisObj.animateCSS(step,selector,property,animations[step][selector][property]['to'],duration,animations[step][selector][property]['easing']);
							    	}	
							    	else{
										CSS3ValuesArray[property] = animations[step][selector][property]['to'];
										if(typeof(thisObj.CSS3TransitionArray[selector])=="undefined")
											thisObj.CSS3TransitionArray[selector] = {};
							    		thisObj.CSS3TransitionArray[selector][property] = property+' '+parseFloat(duration/1000)+'s '+animations[step][selector][property]['easing'];
							    		CSS3Found = true;
							    	}
						    	}
						    	if(CSS3Found){
									thisObj.setCSS(selector,CSS3ValuesArray);
									CSS3ValuesArray = {};
									CSS3Found = false;
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
		var directionForward;
		
		if(thisObj.settings.scrollDelay!==false && thisObj.settings.scrollDelay>0){
			clearTimeout(thisObj.waitScrollTimer);
			thisObj.waitScrollTimer = setTimeout(function(){
				thisObj.waitScrollEnd = false;
			},thisObj.settings.scrollDelay);
		}
		
		thisObj.animating?((thisObj.lastStep<thisObj.step)?directionForward=true:directionForward=false):directionForward=null;
		
		if(!thisObj.allowScroll || thisObj.forceAnimation)
			return false;
		
		if(thisObj.settings.scrollDelay!==false && thisObj.settings.scrollDelay>0 && thisObj.waitScrollEnd && thisObj.animating && thisObj.animationType=='jump' && ((directionForward && pos)||(!directionForward && !pos)))
			return false;
			
		if(thisObj.settings.scrollDelay===false && thisObj.animating && thisObj.animationType=='jump' && ((directionForward && pos)||(!directionForward && !pos)))
			return false;
		
		if(thisObj.settings.scrollDelay!==false && thisObj.settings.scrollDelay>0)	
			thisObj.waitScrollEnd = true;
			
		if(!thisObj.animating || (thisObj.animating && thisObj.animationType!='jump') || (thisObj.animating && thisObj.animationType=='jump' && ((directionForward && !pos)||(!directionForward && pos)))){

			var stepPos = thisObj.getPos(Math.round(thisObj.lastStep));
			
			thisObj.jumpPosition = indexOf(thisObj.settings.jumpPoints,stepPos);
			
			if(thisObj.jumpPosition==-1){
				thisObj.jumpPosition = null;
				if(stepPos<=thisObj.settings.jumpPoints[0]){
					if(pos)
						thisObj.jumpPosition=-1;
					else
						thisObj.jumpPosition=0;
				}else{
					for(var i=0;i<=thisObj.settings.jumpPoints.length-2;i++){
						if(stepPos>thisObj.settings.jumpPoints[i] && stepPos<thisObj.settings.jumpPoints[i+1]){
							if(pos)
								thisObj.jumpPosition=i;
							else
								thisObj.jumpPosition=i+1;
							break;
						}
					}
					if(thisObj.jumpPosition==null){
						if(pos)
							thisObj.jumpPosition=thisObj.settings.jumpPoints.length-1;
						else
							thisObj.jumpPosition=thisObj.settings.jumpPoints.length
					}
				}
			}
		}
		
		if(pos){
			if(thisObj.jumpPosition<(thisObj.settings.jumpPoints.length-1)){
				thisObj.jumpPosition++;
				thisObj.goTo({to:thisObj.settings.jumpPoints[thisObj.jumpPosition],orientation:'loop',animationType:'jump',duration:thisObj.settings.durationTweaks['jump']['duration'],durationType:thisObj.settings.durationTweaks['jump']['durationType'],minStepDuration:thisObj.settings.durationTweaks['jump']['minStepDuration']});
			}else if(thisObj.jumpPosition==(thisObj.settings.jumpPoints.length-1) && thisObj.settings.loop){
				thisObj.jumpPosition=0;
				thisObj.goTo({to:thisObj.settings.jumpPoints[thisObj.jumpPosition],orientation:'loop',animationType:'jump',duration:thisObj.settings.durationTweaks['jump']['duration'],durationType:thisObj.settings.durationTweaks['jump']['durationType'],minStepDuration:thisObj.settings.durationTweaks['jump']['minStepDuration']});
			}
		}
		else{
			if(thisObj.jumpPosition>0){
				thisObj.jumpPosition--;
				thisObj.goTo({to:thisObj.settings.jumpPoints[thisObj.jumpPosition],orientation:'loop',animationType:'jump',duration:thisObj.settings.durationTweaks['jump']['duration'],durationType:thisObj.settings.durationTweaks['jump']['durationType'],minStepDuration:thisObj.settings.durationTweaks['jump']['minStepDuration']});
			}else if(thisObj.jumpPosition==0 && thisObj.settings.loop){
				thisObj.jumpPosition=thisObj.settings.jumpPoints.length-1
				thisObj.goTo({to:thisObj.settings.jumpPoints[thisObj.jumpPosition],orientation:'loop',animationType:'jump',duration:thisObj.settings.durationTweaks['jump']['duration'],durationType:thisObj.settings.durationTweaks['jump']['durationType'],minStepDuration:thisObj.settings.durationTweaks['jump']['minStepDuration']});
			}
		}
	}
	
	/* FUNCTION FOR SCROLL */
	isAlive.prototype.doScroll = function(pos){
		
		var thisObj = this;
		
		if(!thisObj.allowScroll || thisObj.forceAnimation)
			return false;
		
		if(thisObj.animating && thisObj.animationType!='scroll'){
			thisObj.animateDuration=thisObj.settings.duration;
			thisObj.step=Math.round(thisObj.lastStep);
			thisObj.onComplete=null;
		} else if(thisObj.animating && thisObj.animationType=='scroll' && ((thisObj.lastStep<thisObj.step && !pos)||(thisObj.lastStep>thisObj.step && pos)))
			thisObj.step=Math.round(thisObj.lastStep);
		
		if(pos){
			if((thisObj.step+thisObj.settings.stepsOnScroll<=thisObj.settings.max-1 || thisObj.settings.loop) && (thisObj.step+thisObj.settings.stepsOnScroll)-thisObj.lastStep<thisObj.settings.max*2 && Math.abs((thisObj.step+thisObj.settings.stepsOnScroll)-thisObj.lastStep)<=thisObj.settings.maxScroll)
				thisObj.step = thisObj.step+thisObj.settings.stepsOnScroll;
			else if(thisObj.step<thisObj.settings.max-1 && thisObj.step+thisObj.settings.stepsOnScroll>thisObj.settings.max-1 && !thisObj.settings.loop && Math.abs((thisObj.settings.max-1)-thisObj.lastStep)<=thisObj.settings.maxScroll){
					thisObj.step = thisObj.settings.max-1;
			}else
				return;
		}else{
			if((thisObj.step-thisObj.settings.stepsOnScroll>=thisObj.settings.min || thisObj.settings.loop) && thisObj.lastStep-(thisObj.step-thisObj.settings.stepsOnScroll)<thisObj.settings.max*2 && Math.abs((thisObj.step-thisObj.settings.stepsOnScroll)-thisObj.lastStep)<=thisObj.settings.maxScroll)
				thisObj.step = thisObj.step-thisObj.settings.stepsOnScroll;
			else if(thisObj.step>thisObj.settings.min && thisObj.step-thisObj.settings.stepsOnScroll<thisObj.settings.min && !thisObj.settings.loop && thisObj.lastStep<=thisObj.settings.maxScroll)
				thisObj.step = thisObj.settings.min;
			else
				return;
		}
		
		if(thisObj.settings.debug)
			jQuery('#isalive-'+thisObj.uniqId+'-debuger span:first').html(thisObj.step);
		
		clearTimeout(thisObj.scrollTimer);
		if(!thisObj.animating || (thisObj.animating && thisObj.animationType!='scroll')){
			thisObj.animationType='scroll';
			thisObj.animateSite();
		}
		else{
			thisObj.scrollTimer = setTimeout(function(){
				thisObj.animationType='scroll';
				thisObj.animateSite();
			},20);
		}
	}
	
	/*DO TOUCH WIPE*/
	isAlive.prototype.doWipeTouch = function(value){
		
		var thisObj = this;
		
		if(thisObj.forceAnimation)
			return false;
		
		if(thisObj.animationType!='touchWipe' || (thisObj.animationType=='touchWipe' && ((thisObj.lastStep<thisObj.step && value==-1)||(thisObj.lastStep>thisObj.step && value==1)))){
			var stepPos = thisObj.getPos(Math.round(thisObj.lastStep));
			thisObj.touchPosition = indexOf(thisObj.settings.wipePoints,stepPos);
			if(thisObj.touchPosition==-1){
				thisObj.touchPosition = null;
				if(stepPos<=thisObj.settings.wipePoints[0]){
					if(value==1)
						thisObj.touchPosition=-1;
					else
						thisObj.touchPosition=0;
				}else{
					for(var i=0;i<=thisObj.settings.wipePoints.length-2;i++)
						if(stepPos>thisObj.settings.wipePoints[i] && stepPos<thisObj.settings.wipePoints[i+1]){
							if(value==1)
								thisObj.touchPosition=i;
							else
								thisObj.touchPosition=i+1;
							break;
						}
					if(thisObj.touchPosition==null){
						if(value==1)
							thisObj.touchPosition=thisObj.settings.wipePoints.length-1;
						else
							thisObj.touchPosition=thisObj.settings.wipePoints.length
					}
				}
			}
		}
		
		if(value==1){
			if(thisObj.touchPosition<(thisObj.settings.wipePoints.length-1)){
				thisObj.touchPosition++;
				thisObj.goTo({to:thisObj.settings.wipePoints[thisObj.touchPosition],orientation:'next',animationType:'touchWipe',duration:thisObj.settings.durationTweaks['wipe']['duration'],durationType:thisObj.settings.durationTweaks['wipe']['durationType'],minStepDuration:thisObj.settings.durationTweaks['wipe']['minStepDuration']});
			}else if(thisObj.touchPosition==(thisObj.settings.wipePoints.length-1) && thisObj.settings.loop){
				thisObj.touchPosition=0;
				thisObj.goTo({to:thisObj.settings.wipePoints[thisObj.touchPosition],orientation:'next',animationType:'touchWipe',duration:thisObj.settings.durationTweaks['wipe']['duration'],durationType:thisObj.settings.durationTweaks['wipe']['durationType'],minStepDuration:thisObj.settings.durationTweaks['wipe']['minStepDuration']});
			}
		}
		if(value==-1){
			if(thisObj.touchPosition>0){
				thisObj.touchPosition--;
				thisObj.goTo({to:thisObj.settings.wipePoints[thisObj.touchPosition],orientation:'prev',animationType:'touchWipe',duration:thisObj.settings.durationTweaks['wipe']['duration'],durationType:thisObj.settings.durationTweaks['wipe']['durationType'],minStepDuration:thisObj.settings.durationTweaks['wipe']['minStepDuration']});
			}else if(thisObj.touchPosition==0 && thisObj.settings.loop){
				thisObj.touchPosition=thisObj.settings.wipePoints.length-1;
				thisObj.goTo({to:thisObj.settings.wipePoints[thisObj.touchPosition],orientation:'prev',animationType:'touchWipe',duration:thisObj.settings.durationTweaks['wipe']['duration'],durationType:thisObj.settings.durationTweaks['wipe']['durationType'],minStepDuration:thisObj.settings.durationTweaks['wipe']['minStepDuration']});
			}
		}
	}
	
	/*DO TOUCH DRAG*/
	isAlive.prototype.doDragTouch = function(value){

		var thisObj = this;

		if(thisObj.forceAnimation)
			return false;
		
		if(thisObj.animating && thisObj.animationType!='dragTouch'){
			thisObj.animateDuration=thisObj.settings.duration;
			thisObj.step=Math.round(thisObj.lastStep);
			thisObj.onComplete=null;
		} if(thisObj.animating && thisObj.animationType=='dragTouch' && ((thisObj.lastStep<thisObj.step && value==-1)||(thisObj.lastStep>thisObj.step && value==1)))
			thisObj.step=Math.round(thisObj.lastStep);
		
		if(value==1){
			if((thisObj.step+thisObj.settings.stepsOnDrag<=thisObj.settings.max-1 || thisObj.settings.loop) && (thisObj.step+thisObj.settings.stepsOnDrag)-thisObj.lastStep<thisObj.settings.max*2 && Math.abs((thisObj.step+thisObj.settings.stepsOnDrag)-thisObj.lastStep)<=thisObj.settings.maxDrag)
				thisObj.step = thisObj.step+thisObj.settings.stepsOnDrag;
			else if(thisObj.step<thisObj.settings.max-1 && thisObj.step+thisObj.settings.stepsOnDrag>thisObj.settings.max-1 && !thisObj.settings.loop && Math.abs((thisObj.settings.max-1)-thisObj.lastStep)<=thisObj.settings.maxDrag)
					thisObj.step = thisObj.settings.max-1;
			else
				return;
		}else{
			if((thisObj.step-thisObj.settings.stepsOnDrag>=thisObj.settings.min || thisObj.settings.loop) && thisObj.lastStep-(thisObj.step-thisObj.settings.stepsOnDrag)<thisObj.settings.max*2 && Math.abs((thisObj.step-thisObj.settings.stepsOnDrag)-thisObj.lastStep)<=thisObj.settings.maxDrag)
				thisObj.step = thisObj.step-thisObj.settings.stepsOnDrag;
			else if(thisObj.step > thisObj.settings.min && thisObj.step-thisObj.settings.stepsOnDrag<thisObj.settings.min && !thisObj.settings.loop && thisObj.lastStep<=thisObj.settings.maxDrag)
				thisObj.step = thisObj.settings.min;
			else
				return;
		}
		
		if(thisObj.settings.debug)
			jQuery('#isalive-'+thisObj.uniqId+'-debuger span:first').html(thisObj.step);
		
		thisObj.animationType='dragTouch';
		thisObj.animateSite();
	}
	
	/*GO TO FUNCTION*/
	isAlive.prototype.goTo = function(options){
		settings = jQuery.extend({
			to:null,
			duration: null,
			durationType: 'default',
			orientation:'default',
			animationType:'goTo',
			onComplete:null,
			minStepDuration:null,
			force:false
		},options);
		
		var thisObj = this;
		var pos,posNext,posPrev;
		
		if(thisObj.forceAnimation || settings.to==null || settings.to<0 || settings.to>thisObj.settings.max-1)
			return false;
		
		thisObj.animationType = settings.animationType;
		thisObj.forceAnimation = settings.force;
		
		pos = settings.to+(Math.floor(thisObj.lastStep/thisObj.settings.max)*thisObj.settings.max);
		
		if(Math.abs(pos-thisObj.lastStep)>=thisObj.settings.max*2)
			return;

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
				if(thisObj.lastStep>pos)
					pos = settings.to+((Math.floor(thisObj.lastStep/thisObj.settings.max)+1)*thisObj.settings.max);
			}
			else if(settings.orientation == 'prev'){
				if(thisObj.lastStep<pos)
					pos = settings.to+((Math.floor(thisObj.lastStep/thisObj.settings.max)-1)*thisObj.settings.max);
			}
		}
		
		thisObj.step = pos;
		
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
		
		thisObj.onComplete=null;
		if(settings.onComplete!==null && typeof(settings.onComplete)=='function')
			thisObj.onComplete = settings.onComplete; 
		thisObj.animateSite();
	}
	
	/*SKIPS TO A POSITION*/
	isAlive.prototype.skip = function(step){
		
		var thisObj = this;
		
		if(step<0 || step>thisObj.settings.max-1)
			return false;
			
		thisObj.stop();
		
		if(thisObj.getPos(thisObj.step) == step)
			return false;
		
		var pos,pointFound,pointFoundSelector,direction;
		var valuesCSS = {};
		var valuesClasses = {};
		var selector,property,className;
		
		pos = thisObj.step;
		pointFoundSelector = -1;
		pointFound = -1;
			
		while((pos<=step && thisObj.getPos(thisObj.step)<step) || (pos>=step && thisObj.getPos(thisObj.step)>step)){
			
			if(thisObj.haveStepPoints){
				pointFound=indexOf(thisObj.settings.stepPoints,pos);
				if(pointFound!=-1)
					pointFoundSelector = pointFound;
			}
			
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

			if(thisObj.settings.onStep!=null)
				thisObj.settings.onStep(pos,Math.floor(pos/thisObj.settings.max),'skip');
			
			if(thisObj.getPos(thisObj.step)<step)
				pos = pos + 1;
			else
				pos = pos - 1;
		}
		
		for(selector in valuesClasses){
			for(className in valuesClasses[selector]){
				if(valuesClasses[selector][className]==true)
					jQuery(selector).addClass(className);	
				else
					jQuery(selector).removeClass(className);	
			}
		}
			
		for(selector in valuesCSS)
			for(property in valuesCSS[selector])
				thisObj.setCSS(selector,property,valuesCSS[selector][property]);

		if(pointFoundSelector!=-1 ){
			jQuery(thisObj.settings.stepPointsSelector).removeClass(thisObj.settings.stepPointsActiveClass);
			jQuery(thisObj.settings.stepPointsSelector).eq(pointFoundSelector).addClass(thisObj.settings.stepPointsActiveClass);
		}
		
		step = step+thisObj.l(thisObj.lastStep);
		
		thisObj.step = step;
		thisObj.lastStep = step;
		
	}
	
	/*STOPS ANIMATIONS*/	
	isAlive.prototype.stop = function(){
		var thisObj = this;
		var selector;
		jQuery('.'+thisObj.settings.animateClass).stop();
		thisObj.animating = false;
		thisObj.forceAnimation = false;
		thisObj.animationType='none';
		thisObj.animateDuration = thisObj.settings.duration;	
		(thisObj.lastStep<thisObj.step)?thisObj.step = Math.floor(thisObj.lastStep):thisObj.step = Math.ceil(thisObj.lastStep);
		thisObj.onComplete = null;
		
		for(selector in thisObj.CSS3TransitionArray){
			delete thisObj.CSS3TransitionArray[selector];
			jQuery(selector).css(fixCSS3('transition'),thisObj.getTransitionArray(selector));
		}
		
		if(thisObj.rebuildOnStop){
			thisObj.rebuildLayout();
			thisObj.rebuildOnStop = false;
		}
	}

	/*PLAYS ANIMATIONS TO THE NEXT PLAY POINT*/	
	isAlive.prototype.play = function(options){
		var thisObj = this;
		if(thisObj.settings.playPoints.length<=1)
			return false;
		if(typeof(options) == "undefined")
			options = {};
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
		if(thisObj.settings.playPoints.length<=1)
			return false;
		if(typeof(options) == "undefined")
			options = {};
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
			if(typeof(options) == "undefined")
				options = {};
			isAliveObjects[selector].goTo(options);
			return thisObj;
		},
		skip : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			if(typeof(options) == "undefined" || typeof(options['to']) == "undefined")
				return false;
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
		enableScroll : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].allowScroll = options;
			return thisObj;
		},
		enableTouch : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined")
				return false;
			isAliveObjects[selector].allowTouch = options;
			if(options==true && isAliveObjects[selector].settings.enableTouch && browserObj.msie && parseInt(browserObj.version)>=10 && isAliveObjects[selector].settings.preventTouch){
				isAliveObjects[selector].msTouchAction = jQuery(thisObj.mySelector).css('-ms-touch-action');
				jQuery(selector).css('-ms-touch-action',"none");				
			}
			else if(options==false && isAliveObjects[selector].settings.enableTouch && browserObj.msie && parseInt(browserObj.version)>=10 && isAliveObjects[selector].settings.preventTouch)
				jQuery(selector).css('-ms-touch-action',isAliveObjects[selector].msTouchAction);
			return thisObj;
		},
		addOnComplete : function(thisObj,options){
			var selector = thisObj.selector;
			if(typeof(isAliveObjects[selector])=="undefined" || !isAliveObjects[selector].animating)
				return false;
			if(typeof(options)=='function')
				isAliveObjects[selector].onComplete = options;
			else
				return false;
			return thisObj;
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
			return "1.3.3";
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
