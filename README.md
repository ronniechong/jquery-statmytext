##jquery-statmytext##
A simple characters statistic plugin

###Demo###
http://ronniechong.github.io/jquery-statmytext/

###History Log###

Ver 1.0.1 (6th June 2014)
- Added Grunt tasks

Ver 1.0 (22nd May 2014)
- Version 1.0.0 released

###How to use###

#### Markup ####

Add the jQuery and CSS scripts

    <script type="text/javascript" src="js/path/jquery.statmytext.js"></script>
    
    <link href="css/path/jquery.statmytext.css" rel="stylesheet" type="text/css"/>

Add the HTML markup

    <div id="statmytext">
      <section class="input-text">
        <div class="input-container">
          <label for="textInput">Enter your text here</label>
          <textarea id="textInput" name="textInput" placeholder="Type in some goodness"></textarea>
        </div>
        <div class="result">
          <div class="result-stats"></div>
          <div class="stats-controller"></div>
        </div>
      </section>
      <section class="result-output"></section>
    </div>

#### jQuery Call ####

    <script type="text/javascript">
        $(function(e){
            $('#statmytext').statMyText();
        });
    </script>


###Available settings###

    <script type="text/javascript">
        $(function(e){
            $('#statmytext').statMyText({
                'displayInfo':false,
                onSortComplete:function(e){
                    //Do something fancy
                }
            });
        });
    </script>
Properties | Description | Type | Values
---|---|---|---
displayInfo | Display statistics | Boolean | true (default) or false
displayController | Display controllers| Boolean | true (default) or false
excludeHTML | Omit HTML markups| Boolean | true (default) or false
excludeNum | Omit numerics | Boolean | true or false (default)
caseSensitive| Case sensitive | Boolean | true or false (default),
sortBy | Sort by alphanumeric or frequency| string | alpha (default) or freq
sortOrder | Sort ascending or descending | string | asc (default) or desc
statsOutputClass | class for stats output | string | result-stats (default)
chartOutputClass | class for chart | string | result-output (default)
controllerOutputClass | class for controller | string | stats-controller (default)
listSortByClass | class for Sort By list | string | sortBy (default)
listSortOrderClass | class for Sort Order list | string |  sortOrder (default)
sortOrderText | Sort Order text | array | `['Ascending','Descending']` (default)
sortByText | Sort By text | array | `['Alphabetical','Frequency']` (default)
onSortComplete | call back on sort completion | function | returns e.sortBy and e.sortOrder string
