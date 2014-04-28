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
			'sortFrequency':false,
			'maxCol':20
		},options);


		return this.each(function(){
			'use strict';
			var $p = $(this),
				timer;
			
			buildChart($p);
			if (settings.displayInfo) updateInfo();
			$('#textInput',$p).keyup(function(){
				evalText($(this).val(),$p);
				clearInterval(timer);
			    timer = setTimeout(function() {
			    
			    }, 250);
			});
		})

		

		function evalText(str,$parent){
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

			objCount = sortObj (objTmp);
			updateChart(objCount,$parent);
			if (settings.displayInfo) updateInfo();
			//debug(tmp);
		}

		//Sort
		function sortObj(array){
			'use strict';
        	var tmp = [],
          		oSorted={},
          		sortFunc=(settings.sortFrequency)?function(a,b){return b>a}:function(a,b){return a>b};
          	 
          for (var k in array) {
          	if (settings.sortFrequency){
            	if (array.hasOwnProperty(k)) tmp.push({key: k, value:  array[k]});
           	}else{
           		tmp.push(k);
           	}
          }

          if (settings.sortFrequency){
          	tmp.sort(function(o1, o2) {
	        	return sortFunc(o1.value, o2.value);
	        });
          }else{
          	tmp.sort();
          }
          

          $.each(tmp, function(index, value){
          	if (settings.sortFrequency){
              	oSorted[value.key]=value.value;
          	}else{
            	oSorted[tmp[index]] = array[tmp[index]];
          	}
          });      

          return oSorted;
		};

		function getObjSize(obj) {
			'use strict';
		    var size = 0, 
		    	key;
		    for (key in obj) {
		        if (obj.hasOwnProperty(key)) size++;
		    }
		    return size;
		};


		//Initial graphical presentation markups
		function buildChart($parent){
			'use strict';

			var tmpHTML = '',
				$el = $('.result-output',$parent),
				count = ($('.chart',$el).length<=0)?1:$('.chart',$el).length + 1;

				tmpHTML = '<div class="chart" id="chart'+count+'">';
				tmpHTML += '<ul class="list-chart"></ul>';
				tmpHTML += '<span class="range min-val" data-value="0">0</span>';
				tmpHTML += '<span class="range med-val" data-value="0">0</span>';
				tmpHTML += '<span class="range max-val" data-value="0">0</span>';
				tmpHTML +='</div>';

			$el.append(tmpHTML);

			//line or dots
			//http://www.terrill.ca/design/vertical_bar_graphs/
		}

		//Update content
		function updateChart(obj,$parent){
			'use strict';
			var a,
				count = 1,
				$el = $('.chart',$parent).last(),
				$ul = $('.list-chart',$el),
				med,
				min = 0,
				max = (getMaxMin(objCount,'max')<=10)? 10 : Math.ceil(getMaxMin(objCount,'max')/10) * 10;
				med = (getMaxMin(objCount,'max')<=10)? 5 : Math.ceil(max /2);
				


			$('.min-val',$el).text(min).attr('data-value',min);
			$('.med-val',$el).text(med).attr('data-value',med);
			$('.max-val',$el).text(max).attr('data-value',max);


			$ul.empty();

//Update only if not exist

			for (a in obj){
				var width = (obj[a]/max) * 100,
					//width = (1/getObjSize(objCount)) * 100,
					li =  '<li data-char="'+a+'" data-value="'+obj[a]+'">';
					//li += '<div class="bar-container"><div class="bar" style="width:'+width+'%;">';
					li += '<div class="bar-container"><div class="bar" style="width:1px">';
					li += '<span class="value">'+obj[a]+'</span><span class="char">'+a+'</span>';
					li += '</div></div></li>';
				$ul.append(li);
				//$('li:last-child .bar',$ul).stop().animate({'width':width + '%'},20 * count);
				//$('li:last-child .bar',$ul).delay(500).css({transition : 'width 1s ease-in-out','width':+width+'%'});
				 
				count++;
			}
			$('li',$ul).each(function(){
				var width = ($(this).attr('data-value')/max) * 100;
				$('.bar',this).css('width', width + '%');
			})
		}

		//get highest and lowest value
		function getMaxMin(obj,str){
			'use strict';
			var arr = Object.keys( obj ).map(function ( key ) { return obj[key]; });
			if (arr.length<=0) return 0;
			else if (str=='min') return Math.min.apply( null, arr );
			else if (str=='max') return Math.max.apply( null, arr );
			
		}
		function updateInfo(){
			'use strict';
			var a='',
				item,
				$el = $('.result-stats');

			//Build if list does not exist
			if (!$('ul',$el).length){
				
				for (item in objText){
					//a += '<li><span class="textHolder">'+objText[item].textHolder + '</span><span class="value">' + objText[item].value + '</span></li>';
					//a += '<li><span class="textHolder"></span><span class="value"></span></li>';
					$el.append(
						$('<li>')
							.append('</span>')
							.addClass('textHolder')
							.append('</span>')
							.addClass('value')
					);
				}
				$el.wrap('<ul>').addClass('list-stats');
				//$el.append(a);
			}

			
			

		}

		function debug(str){
			var a = '',
				b ='';

			for (item in objText){
				a += objText[item].textHolder + '=' + objText[item].value + '<br/>';
			}
			a += 'Min = ' + getMaxMin(objCount,'min') + '<br/>';
			a += 'Max = ' + getMaxMin(objCount,'max') + '<br/>';
			for (x in objCount){
				b += x + '=' + objCount[x] + '<br/>';
			}
			$('#result').html(a);
			$('#arraylist').html(b);
			$('#thetext').html(str);
		}
	}
}(jQuery));