function createHtmlElements(){

	var createArray = function(splitNumber){

		var widthDimension = $("#myElement").width();
		var heightDimension = $("#myElement").height();

		var totalH = 0;
		var totalW = 0;
		var tempH,tempW;
		var i = 0;
		var elements = [];
		
		while (totalH < heightDimension){
			if (heightDimension-totalH<=Math.round(heightDimension/splitNumber))
				tempH = heightDimension-totalH;
			else{
				do{
					tempH = Math.round(Math.random() * Math.round(heightDimension/splitNumber));
				}while(tempH<Math.round(heightDimension/splitNumber)/2 || elements[tempH]!=undefined);
			}
			
			totalW = 0;

			while (totalW < widthDimension){
				if (widthDimension-totalW<=Math.round(widthDimension/splitNumber))
					tempW = widthDimension-totalW;
				else{
					do{
						tempW = Math.round(Math.random() * Math.round(widthDimension/splitNumber));
					}while(tempW<Math.round(widthDimension/splitNumber)/2);
				}
				
				if (elements[tempH]==undefined){
					elements[tempH] = [];
					i=0;
				}
				
				elements[tempH][i] = tempW;
				i++;
				
				totalW = totalW+tempW; 
				
			}
			
			totalH = totalH+tempH; 
		}
		
		return elements;
		
	}

	var animations = {};
	var bx,by,img,x,y,randFound,inc;

	var widthDimension = $("#myElement").width();
	var heightDimension = $("#myElement").height();
	var elements = createArray(5);
	
	bx = 0;
	by = 0;
	x = 0;
	y = 0;
	inc = -1;
	i = -1;
	
	
	for(key in elements){
		x = 0;
		bx = 0;
		for (key2 in elements[key]){
			i++;
			$("#myElement").append('<div class="smalldiv" id="BUTTERFLY-'+i+'" style="background-position:'+bx+'px '+by+'px;left:'+x+'px;top:'+y+'px;width:'+elements[key][key2]+'px;height:'+key+'px;"></div>');
			
			var sStart,sEnd;
			
			var sStart = Math.round(Math.random()*5);
			var sEnd = 20-Math.round(Math.random()*5);

			inc++;
			animations[inc] = {};
			animations[inc]["selector"] = "#BUTTERFLY-"+i;
			animations[inc]["method"] = "animate";
			animations[inc]["property"] = "top";
			animations[inc]["step-start"] = sStart;
			animations[inc]["step-end"] = sEnd;
			
			randFound = false;
			if (Math.round(Math.random()*1)==1){
				randFound = true;
				if (Math.round(Math.random()*1)==1)
					animations[inc]["value-end"] = heightDimension;
				else
					animations[inc]["value-end"] = 0-parseInt(key);
			}
			else
				animations[inc]["value-end"] = Math.round(Math.random()*heightDimension);
			
			inc++;
			animations[inc] = {};
			animations[inc]["selector"] = "#BUTTERFLY-"+i;
			animations[inc]["method"] = "animate";
			animations[inc]["property"] = "left";
			animations[inc]["step-start"] = sStart;
			animations[inc]["step-end"] = sEnd;
			
			if (randFound)
				animations[inc]["value-end"] = Math.round(Math.random()*widthDimension);
			else{
				if (Math.round(Math.random()*1)==1)
					animations[inc]["value-end"] = widthDimension;
				else
					animations[inc]["value-end"] = 0-parseInt(elements[key][key2]);
			}

			inc++;
			animations[inc] = {};
			animations[inc]["selector"] = "#BUTTERFLY-"+i;
			animations[inc]["method"] = "animate";
			animations[inc]["property"] = "transform";
			animations[inc]["step-start"] = sStart;
			animations[inc]["step-end"] = sEnd;
			animations[inc]["value-start"] = "rotate(0deg) scale(1)";
			animations[inc]["value-end"] = "rotate("+Math.round((Math.random()*720)-360)+"deg) scale(0)";

			x = x + parseInt(elements[key][key2]);
			bx = bx - parseInt(elements[key][key2]);
			
		}
		
		y = y + parseInt(key);
		by = by - parseInt(key);
	}
	
	$("#myElement").css('background-image','none');
	return animations;
}


$(window).load(function(){
	
	var animations = createHtmlElements();
	
	$('butterfly').isAlive('create',{
		duration:500,
		elements:animations,
		useCSS3:true,
		easing:"easeOutQuad",
		enableGPU:"webkit",
		elementTweaks:{'width':1026,'height':778}
	});
	
	$('#myElement').click(function(){
		$('butterfly').isAlive('toggle',{duration:2000});
		return false;
	});
	
});
