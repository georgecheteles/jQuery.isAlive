/*
 _       __                          __                                 _     
| |     / /__        _________  ____/ /__        ____ ___  ____ _____ _(_)____
| | /| / / _ \______/ ___/ __ \/ __  / _ \______/ __ `__ \/ __ `/ __ `/ / ___/
| |/ |/ /  __/_____/ /__/ /_/ / /_/ /  __/_____/ / / / / / /_/ / /_/ / / /__  
|__/|__/\___/      \___/\____/\__,_/\___/     /_/ /_/ /_/\__,_/\__, /_/\___/  
                                                              /____/          
jQuery.isAlive.helper(0.0.3) is a list of functions for jQuery.isAlive plugin.
Written by George Cheteles (george@we-code-magic.com).
Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
Please attribute the author if you use it.
Find me at:
	http://www.we-code-magic.com 
	office@we-code-magic.com
Last modification on this file: 19 November 2013.
*/

var myHelperData = {};

/*
 * FOR IE7 & IE8 ROTATE(DEG)
 * ONLY FOR IE8 OR LOWER
*/
rotateIE = function(selector,deg){

	elementToRotate = jQuery(selector);
	
	deg = parseFloat(deg);
	var deg2radians = Math.PI * 2 / 360;
	var rad = deg * deg2radians ;
	var costheta = Math.cos(rad);
	var sintheta = Math.sin(rad);

	var m11 = costheta;
	var m12 = -sintheta;
	var m21 = sintheta;
	var m22 = costheta;
	var matrixValues = 'M11=' + m11 + ', M12='+ m12 +', M21='+ m21 +', M22='+ m22;

	elementToRotate.css('filter', 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\','+matrixValues+')');
	elementToRotate.css('-ms-filter', 'progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\','+matrixValues+')');
		
	return true;
}

/*
 * FOR IE7 & IE8 ROTATE(DEG) IN CENTER
 * ONLY FOR IE8 OR LOWER
 * NEEDS ABSOLUTE POSITION
 */
rotateCenterIE = function(selector,deg){

	elementToRotate = jQuery(selector);
	
	if(myHelperData['rotateIE']==undefined)
		myHelperData['rotateIE'] = {};
		
	if(myHelperData['rotateIE'][selector]==undefined){
		myHelperData['rotateIE'][selector] = {};
		myHelperData['rotateIE'][selector]['w'] = parseInt(elementToRotate.css('width'));
		myHelperData['rotateIE'][selector]['l'] = parseInt(elementToRotate.css('left'));
		myHelperData['rotateIE'][selector]['h'] = parseInt(elementToRotate.css('height'));
		myHelperData['rotateIE'][selector]['t'] = parseInt(elementToRotate.css('top'));
	}
	
	deg = parseFloat(deg);
	var deg2radians = Math.PI * 2 / 360;
	var rad = deg * deg2radians ;
	var costheta = Math.cos(rad);
	var sintheta = Math.sin(rad);

	var m11 = costheta;
	var m12 = -sintheta;
	var m21 = sintheta;
	var m22 = costheta;
	var matrixValues = 'M11=' + m11 + ', M12='+ m12 +', M21='+ m21 +', M22='+ m22;
	
	elementToRotate.css('filter', 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\','+matrixValues+')');
	elementToRotate.css('-ms-filter', 'progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\','+matrixValues+')');
		
	var wtemp = parseInt(elementToRotate.css('width'));
	var htemp = parseInt(elementToRotate.css('height'));
	
	var w = myHelperData['rotateIE'][selector]['w'];
	var h = myHelperData['rotateIE'][selector]['h'];
	var t = myHelperData['rotateIE'][selector]['t'];
	var l = myHelperData['rotateIE'][selector]['l'];
	
	elementToRotate.css('left',l - ((wtemp-w)/2));
	elementToRotate.css('top',t - ((htemp-h)/2));
		
	return true;
}
