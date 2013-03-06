var heatmap;
var loading = new Spinner;
var inprogress = false;
var uptodate = true;
var minTime=0, maxTime=90;

window.onload = function(){
    // heatmap configuration
    var config = {
        element: document.getElementById("heatmap-canvas"),
        radius: 20,
        opacity: 60,
        legend: {
            position: 'br',
            title: 'Football Position Heatmap'
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
    addRegularTicks($('#range-holder'), 0, 90, 10);
    requestPlayers();
};

function requestPlayers(){
   $('#player-select').attr('disabled', true);
   $('#sensor-select').attr('disabled', true);
   $.get('/players', populatePlayers); 
}

function populatePlayers(data){
    $('#player-select').attr('disabled', false);
    $('#player-select').empty();
    for ( var i in data['players'] ){
        $('#player-select').append(new Option(data['players'][i], data['players'][i]));        
    } 
    $('#sensor-select').attr('disabled', false);
    $('#sensor-select').empty();
    for ( var i in data['sensors'] ){
        $('#sensor-select').append(new Option(data['sensors'][i], data['sensors'][i]));
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
   var e = loading.spin().el;
   $(e).css('left', '50%');
   $(e).css('top', '50%');
   $('#heatmap-canvas').append(e);
   $.get('/data', 
         {'min': minTime, 
          'max': maxTime, 
          'sensor': $('#sensor-select').val(), 
          'player': $('#player-select').val()},
          displayNewData ); 
}

function displayNewData(data){
    loading.stop();
    inprogress = false;
    heatmap.store.setDataSet({max: 10, data: data});
    if ( ! uptodate ) {
        uptodate = true;
        reqNewData();
    }
    uptodate = true;
}
