/********************************************************************************
The MIT License (MIT)

Copyright (c) 2014 Ronnie Chong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
********************************************************************************/


/*
TO DO

 - callbacks methods
 - update on demand
*/


(function($){
	$.fn.statMyText = function(options){

		var	objText = {
				'chars':{
					'value':0,
					'textHolder':'Characters'
				 },
				'words':{
					'value':0,
					'textHolder':'Words'
				},
				'whitespaces':{
					'value':0,
					'textHolder':'Whitespaces'
				}
			},
			objRegex = {
				'regexHTML':/(<([^>]+)>)/ig,
				'regexExtraWhiteSpace':/[\s\n\r]+/g,
				'regexAlphaNum':/[^a-z0-9]/gi,
				'regexAlpha':/[^a-z]/gi,
				'regexWhiteSpace':/\s/g
			}
			objCount = {};
			

		//Default settings
		var settings = $.extend({
			'displayInfo':true,
			'excludeHTML':true,
			'excludeNum':false,
			'caseSensitive':false,
			'sortType':'alpha',		//frequency or alpha
			'sortBy':'desc',		//asc or desc
			'statsOutputClass':'result-stats',
			'chartOutputClass':'result-output',
			'maxCol':20
		},options);

		if (this.length==0) return $(this);

		return this.each(function(){
			'use strict';
			var $this = $(this);
	

			var fnEvalText = function(str,$parent){
				'use strict';
				var tmp = str,
					totalWords = new Array(),
					objTmp;
					
				tmp = $.trim(tmp);

				//Remove markup
				if (settings.excludeHTML){
					tmp = str.replace(objRegex.regexHTML, '');
				}

				//Count words and characters
				objText.whitespaces.value  = (tmp.match(objRegex.regexWhiteSpace)==null)?0:tmp.match(objRegex.regexWhiteSpace).length;
				objText.chars.value = tmp.length;
				totalWords = $.trim(tmp).replace(objRegex.regexExtraWhiteSpace,' ').split(' ');
				objText.words.value = (totalWords.length==1)?(totalWords[0].length>=1)?1:0:totalWords.length;
				
				//tag characters
				objTmp = {};
				tmp = $.trim(tmp).replace((settings.excludeNum)?objRegex.regexAlpha:objRegex.regexAlphaNum,'');
				for (var i=0;i<tmp.length;i++){
					var a = tmp[i];
					if (!settings.caseSensitive){a = a.toLowerCase();}
					if (a in objTmp){
						objTmp[a] =  objTmp[a] + 1;
					}else{
						objTmp[a] = 1;
					}
				}

				objCount = fnSortObj (objTmp);
				fnUpdateChart(objCount,$parent);
				if (settings.displayInfo) fnUpdateStatsInfo();
				//debug(tmp);
			}

			//Sort
			var fnSortObj = function(array){
				'use strict';
	        	var tmp = [],
	          		oSorted={},
	          		sortFunc=(settings.sortType=='frequency')?function(a,b){return b>a}:function(a,b){return a>b};
	          	 
	          for (var k in array) {
	          	if (settings.sortType=='frequency'){
	            	if (array.hasOwnProperty(k)) tmp.push({key: k, value:  array[k]});
	           	}else{
	           		tmp.push(k);
	           	}
	          }

	          if (settings.sortType=='frequency'){
	          	tmp.sort(function(o1, o2) {
		        	return sortFunc(o1.value, o2.value);
		        });
	          }else{
	          	tmp.sort();
	          }
	          

	          $.each(tmp, function(index, value){
	          	if (settings.sortType=='frequency'){
	              	oSorted[value.key]=value.value;
	          	}else{
	            	oSorted[tmp[index]] = array[tmp[index]];
	          	}
	          });      

	          return oSorted;
			};

			var fnGetObjSize = function(obj) {
				'use strict';
			    var size = 0, 
			    	key;
			    for (key in obj) {
			        if (obj.hasOwnProperty(key)) size++;
			    }
			    return size;
			};

			//Sort list
			var fnGetSortList = function($ul, sortMode, sortBy){

				var items = $('li', $ul).get();




				items.sort(function(a,b){
					var keyA = $(a).text();
					var keyB = $(b).text();

					if (keyA < keyB) return -1;
					if (keyA > keyB) return 1;
					return 0;
				});




				// $ul.empty();
				// $.each(items, function(i, li){
				// 	$ul.append(li);
				// });

				// return $ul;
			}

			//Initial graphical presentation markups
			var fnBuildChart = function($parent){
				'use strict';
				var tmpHTML = '',
					$el = $('.'+settings.chartOutputClass,$parent),
					count = ($('.chart',$el).length<=0)?1:$('.chart',$el).length + 1;

					tmpHTML = '<div class="chart" id="chart'+count+'">';
					tmpHTML += '<ul class="list-chart"></ul>';
					tmpHTML += '<span class="range min-val" data-value="0">0</span>';
					tmpHTML += '<span class="range med-val" data-value="0">0</span>';
					tmpHTML += '<span class="range max-val" data-value="0">0</span>';
					tmpHTML +='</div>';

				$el.append(tmpHTML);
			}

			//Update content
			var fnUpdateChart = function(obj,$parent){
				'use strict';
				var a,
					$el = $('.chart',$parent).last(),
					$ul = $('.list-chart',$el),
					med,
					min = 0,
					max = (fnGetMaxMin(objCount,'max')<=10)? 10 : Math.ceil(getMaxMin(objCount,'max')/10) * 10;
					med = (fnGetMaxMin(objCount,'max')<=10)? 5 : Math.ceil(max /2);
					

				//update range
				$('.min-val',$el).text(min).attr('data-value',min);
				$('.med-val',$el).text(med).attr('data-value',med);
				$('.max-val',$el).text(max).attr('data-value',max);


				$ul.empty();
				for (a in obj){
					var width = (obj[a]/max) * 100,
						li = $('<li/>')
								.attr('data-char',a)
								.attr('data-value',obj[a])
								.append(
									$('<div/>')
										.addClass('bar-container')
										.append(
											$('<div/>')
												.addClass('bar')
												.css('width',width+'%')
												.append(
													$('<span/>')
													.addClass('value')
													.html(obj[a])
												)
												.append(
													$('<span/>')
														.addClass('char')
														.html(a)
												)
										)
								);
						
					$ul.append(li);
				}

				//fnGetSortList($ul,settings.sortType, settings.sortBy);
			}

			//get highest and lowest value
			var fnGetMaxMin = function(obj,str){
				'use strict';
				var arr = Object.keys( obj ).map(function ( key ) { return obj[key]; });
				if (arr.length<=0) return 0;
				else if (str=='min') return Math.min.apply( null, arr );
				else if (str=='max') return Math.max.apply( null, arr );
			}

			//update stats
			var fnUpdateStatsInfo = function(){
				'use strict';
				var a='',
					item,
					$tmp,
					$el = $('.'+settings.statsOutputClass);

				//Build if list does not exist
				if (!$('ul',$el).length){
					$tmp=$('<ul>').addClass('list-stats');
					for (item in objText){
						$tmp.append($('<li>')
							.append($('<span>')
								.addClass('textHolder')
							)
							.append($('<span>')
								.addClass('value')
							)
							.attr('data-type', item)
						);
					}
					$el.append($tmp);
				}

				//update stats
				for (item in objText){
					$('[data-type="'+item+'"] .textHolder', $el).text(objText[item].textHolder);
					$('[data-type="'+item+'"] .value', $el).text(objText[item].value);
				}
			}

			var init = function(){
				var time;
				fnBuildChart($this);
				if (settings.displayInfo) fnUpdateStatsInfo();
				$('#textInput',$this).keyup(function(){
					fnEvalText($(this).val(),$this);
					//clearInterval(timer);
				    // timer = setTimeout(function() {
				    
				    // }, 250);
				});

			}

			//debugging only. remove before deploy
			var debug = function(str){
				var a = '',
					b ='';

				for (item in objText){
					a += objText[item].textHolder + '=' + objText[item].value + '<br/>';
				}
				a += 'Min = ' + fnGetMaxMin(objCount,'min') + '<br/>';
				a += 'Max = ' + fnGetMaxMin(objCount,'max') + '<br/>';
				for (x in objCount){
					b += x + '=' + objCount[x] + '<br/>';
				}
				$('#result').html(a);
				$('#arraylist').html(b);
				$('#thetext').html(str);
			}

			init();

		}); //return
	}
}(jQuery));