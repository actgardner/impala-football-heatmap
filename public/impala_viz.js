var heatmap;
var loading = new Spinner;
var inprogress = false;
var uptodate = true;
var minTime=0, maxTime=80;
var players;

window.onload = function(){
    var config = {
        element: document.getElementById("heatmap-canvas"),
        radius: 34,
        opacity: 80,
        legend: {
            position: 'br',
            title: 'Time In Position (seconds)'
        }
    };

    $('#time-range').slider({ 'range': true,
                              'min': minTime,
                              'max': maxTime,
                              'values': [minTime, maxTime],
                              'slide' :function(event, ui){
                                   minTime = ui.values[0];
                                   maxTime = ui.values[1];
                                   reqNewData(); 
                              }});
    
    heatmap = h337.create(config);
    $('#player-select').change(function(e){
                                   reqNewData();
                               });
    $('#sensor-select').change(function(e){
                                   reqNewData();
                               });
    addRegularTicks($('#range-holder'), 0, 90, 10);
    requestPlayers();
};

function requestPlayers(){
   $('#player-select').attr('disabled', true);
   $.get('/players', populatePlayers); 
}

function populatePlayers(data){
    var lastTeam = false;
    $('#player-select').attr('disabled', false);
    $('#player-select').empty();
    optGroup = $(document.createElement('optgroup')).attr('label', "Other");
    $('#player-select').append(optGroup);
    for ( var i in data ){
        if ( data[i]['team'] !== lastTeam){
            if ( data[i]['team'] ){
               lastTeam = data[i]['team'];
               optGroup = $(document.createElement('optgroup')).attr('label', "Team "+lastTeam);
               $('#player-select').append(optGroup);
            }
        }
        optGroup.append(new Option(data[i]['player_name'], data[i]['sid']));        
    } 
    reqNewData();
}

function addRegularTicks(slider, min, max, ticks){
    var span = (max-min)/(ticks-1);
    var width = 100*(1/(ticks-1));
    for (var i=0; i<ticks; i++){
        var t = $(document.createElement('div')).addClass('tickLabel').css('width', width+'%').text(span*i);
        if ( i==0) t.css('margin-left', (-1*width/2)+"%");
        else if ( i==ticks-1 ) t.css('margin-right', (-1*width/2)+"%");
        slider.append(t);
    }
}

function reqNewData(){
   if (inprogress){
       uptodate = false;
       return;
   }
   inprogress=true;
   var e = loading.spin().el;
   $(e).css('left', '50%');
   $(e).css('top', '50%');
   $('#heatmap-canvas').append(e);
   $.get('/data', 
         {'min': (minTime *60000000000000)  + 10629342490369879, // picoseconds to seconds, plus the offset 
          'max': (maxTime *60000000000000)  + 10629342490369879, 
          'sid': $('#player-select').val()}, 
          displayNewData ); 
}

function displayNewData(data){
    loading.stop();
    inprogress = false;
    data=setCount(data);
    var m = findMax(data);
    console.log(m);
    heatmap.store.setDataSet({max: m, data: data});
    if ( ! uptodate ) {
        uptodate = true;
        reqNewData();
    }
    uptodate = true;
}

function setCount(data){
    for ( var i in data ){
        // Kludge to support reporting the ball position
        if ( $('#player-select').val() == 4 ){
            data[i].count = data[i].val/10;
        } else {
            data[i].count = data[i].val;
        }
    }
    return data;
}

function findMax(data){
    var max=[0,0,0];
    for ( var i in data ){
       max = addToList(data[i].count, max, 20); 
    }
    console.log(max);
    return max[2];
}

function addToList(val, list, size){
   for ( var i=0; i<size; i++ ){
      if ( list[i] < val ){
          for ( var j = i+1; j<size; j++){
              list[j]=list[j-1];
          }
          list[i] = val;
          break;
      } 
   }
   return list;
}
