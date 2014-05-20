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


;(function($){
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
			'displayController':true,
			'excludeHTML':true,
			'excludeNum':false,
			'caseSensitive':false,
			'sortBy':'alpha',		//frequency or alpha
			'sortOrder':'asc',		//asc or desc
			'statsOutputClass':'result-stats',
			'chartOutputClass':'result-output',
			'controllerOutputClass':'stats-controller',
			'listSortByClass':'sortBy',
			'listSortOrderClass':'sortOrder',
			'sortOrderText':[['Ascending','asc'], ['Descending','desc']],
			'sortByText':[['Alphabetical','alpha'], ['Frequency','freq']],
			'onSortComplete':function(e){
			}
		},options);

		var callback = {
			'onSortCompleteCallback':{
				'sortBy':settings.sortBy,
				'sortOrder':settings.sortOrder
			}
		}

		return this.each(function(method){
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
				objCount = objTmp;
				fnUpdateChart(objCount,$parent);
				if (settings.displayInfo) fnUpdateStatsInfo($parent);
			}

			//Sort list
			var fnGetSortList = function($ul, sortBy, sortOrder){
				var items = $ul.find('li').get();

				items.sort(function(a,b){
					var keyA = (sortBy=='alpha')?$(a).attr('data-char'):parseInt($(a).attr('data-value')),
						keyB = (sortBy=='alpha')?$(b).attr('data-char'):parseInt($(b).attr('data-value')),
						returnX = (sortOrder=='desc')?1:-1,
						returnY = (sortOrder=='desc')?-1:1;

					if (keyA < keyB) return returnX;
					if (keyA > keyB) return returnY;
					return 0;
				});

				 $ul.empty();
				 $.each(items, function(i, li){
				 	$ul.append(li);
				 });

				 //callback
				 if ( $.isFunction( settings.onSortComplete ) ) {
 				   settings.onSortComplete.call( $this,callback.onSortCompleteCallback );
				}
				 return $ul;
			}

			//Initial graphical presentation markups
			var fnBuildChart = function($parent){
				'use strict';
				var $el = $parent.find('[class='+settings.chartOutputClass+']'),
					count = ($el.find('.chart').length<=0)?1:$el.find('.chart').length + 1,
					tmpHTML = $('<div/>')
								.addClass('chart')
								.attr('id','chart'+count)
								.append(
									$('<ul/>').addClass('list-chart')
								)
								.append(
									$('<span/>')
										.addClass('range min-val')
										.attr('data-value',0)
										.text('0')
								)
								.append(
									$('<span/>')
										.addClass('range med-val')
										.attr('data-value',0)
										.text('0')
								)
								.append(
									$('<span/>')
										.addClass('range max-val')
										.attr('data-value',0)
										.text('0')
								);
				$el.append(tmpHTML);
			}

			//Update content
			var fnUpdateChart = function(obj,$parent){
				'use strict';
				var a,
					$el = $parent.find('.chart').last(),
					$ul = $el.find('.list-chart'),
					med,
					min = 0,
					max = (fnGetMaxMin(objCount,'max')<=10)? 10 : Math.ceil(fnGetMaxMin(objCount,'max')/10) * 10;
					med = (fnGetMaxMin(objCount,'max')<=10)? 5 : Math.ceil(max /2);
					

				//update range
				$el.find('.min-val').text(min).attr('data-value',min);
				$el.find('.med-val').text(med).attr('data-value',med);
				$el.find('.max-val').text(max).attr('data-value',max);

				//Build bar
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

				$ul = fnGetSortList($ul, settings.sortBy,settings.sortOrder);
			}

			//get highest and lowest value
			var fnGetMaxMin = function(obj,str){
				'use strict';
				var arr = Object.keys( obj ).map(function ( key ) { return obj[key]; });
				if (arr.length<=0) return 0;
				else if (str=='min') return Math.min.apply( null, arr );
				else if (str=='max') return Math.max.apply( null, arr );
			}


			//build controller
			var fnUpdateStatsController = function($parent){
				'use strict';
				var arrText = [settings.sortOrderText,settings.sortByText],
					arrClass = [settings.listSortOrderClass,settings.listSortByClass],
					$el = $parent.find('.chart').last(),
					$ul = $el.find('.list-chart'),
					strHtml,arrTmp;
				
				//build list if not exist
				for (var i=0; i<arrClass.length;i++){
					
					strHtml = $('<ul/>').addClass(arrClass[i]);

					if ($parent.find('[class="'+arrClass[i]+'"]').length<=0){	

						for (var j=0; j<arrText.length; j++){
							arrTmp = arrText[i][j];	

							strHtml.append($('<li>')
										.append($('<a/>')
											.attr({
												'href':'#',
												'data-sort':arrTmp[1]
											})
											.html(arrTmp[0])
										)
									)
						}
						$parent.find('[class="'+settings.controllerOutputClass+'"]').append(strHtml);
						$parent.find('[data-sort="'+settings.sortBy+'"]').addClass('active');
						$parent.find('[data-sort="'+settings.sortOrder+'"]').addClass('active');
					}
				}
		
				//Update sort List via click events
				$parent.find('[class="'+settings.controllerOutputClass+'"]').on('click','a',function(e){
					e.preventDefault();
					var $p = $(this).parent().closest('ul');
					$p.find('a').removeClass('active');
					$(this).addClass('active');

					//overwrites settings 
					settings.sortBy = callback.onSortCompleteCallback.sortBy = $parent.find($('[class="'+settings.listSortByClass+'"] .active')).attr('data-sort');
					settings.sortOrder = callback.onSortCompleteCallback.sortOrder = $parent.find($('[class="'+settings.listSortOrderClass+'"] .active')).attr('data-sort');
					
					$ul  = fnGetSortList($ul, settings.sortBy,settings.sortOrder);

					
				})
			}

			//update stats
			var fnUpdateStatsInfo = function($parent){
				'use strict';
				var a='',
					item,
					$tmp,
					$el = $parent.find('[class="'+settings.statsOutputClass+'"]');

				//Build if list does not exist
				if (!$el.find('ul').length){
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
					$('[data-type="'+item+'"]', $el).find('.textHolder').text(objText[item].textHolder);
					$('[data-type="'+item+'"]', $el).find('.value').text(objText[item].value);
				}
			}			

			//Init
			var init = function($that){
				fnBuildChart($that);
				
				if (settings.displayInfo) fnUpdateStatsInfo($that);
				if (settings.displayController) fnUpdateStatsController($that);
				
				$('#textInput',$that).keyup(function(){
					fnEvalText($(this).val(),$that);
				});

			}

			init($this);

		}); //return
	}
}(jQuery));