/*
 _       __                          __                                 _     
| |     / /__        _________  ____/ /__        ____ ___  ____ _____ _(_)____
| | /| / / _ \______/ ___/ __ \/ __  / _ \______/ __ `__ \/ __ `/ __ `/ / ___/
| |/ |/ /  __/_____/ /__/ /_/ / /_/ /  __/_____/ / / / / / /_/ / /_/ / / /__  
|__/|__/\___/      \___/\____/\__,_/\___/     /_/ /_/ /_/\__,_/\__, /_/\___/  
                                                              /____/          
jQuery.isAlive.helper(0.0.2) is a list of functions for jQuery.isAlive plugin.
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

/*
 * CONVERTS COLOR NAMES TO HEX TO BE USED FOR ANIMATIONS
 */
function colourNameToHex(colour){
	var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
		"beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
		"cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
		"darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
		"darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
		"darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
		"firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
		"gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
		"honeydew":"#f0fff0","hotpink":"#ff69b4",
		"indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
		"lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
		"lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
		"lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
		"magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
		"mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
		"navajowhite":"#ffdead","navy":"#000080",
		"oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
		"palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
		"red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
		"saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
		"tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
		"violet":"#ee82ee",
		"wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
		"yellow":"#ffff00","yellowgreen":"#9acd32"
	};

	if (typeof colours[colour.toLowerCase()] != 'undefined')
	return colours[colour.toLowerCase()];

	return false;
}