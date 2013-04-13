var heatmap;
var inprogress = false;
var uptodate = true;
var minScale=0, maxScale=80; // This is the scale itslef
var minTime=0, maxTime=40; // default period
var players;
var playerList=[];
var playerCount=0;

// The following represent the 0.5 and 1.0 weights for the heatmap, 
//    per player
var colourPool = [ ['rgb(255,127,127)','rgb(255,0,0)'], 
                   ['rgb(127,255,127)','rgb(0,255,0)'], 
                   ['rgb(127,127,255)','rgb(0,0,255)'],
                   ['rgb(127,255,255)','rgb(0,255,255)'],
                   ['rgb(255,127,255)','rgb(255,0,255)'],
                   ['rgb(255,255,127)','rgb(255,255,0)']];

var config = {
        radius: 34,
        opacity: 70,
    };

var playbackTimer=false;

var spin_opts = {
  lines: 9, // The number of lines to draw
  length: 5, // The length of each line
  width: 3, // The line thickness
  radius: 3, // The radius of the inner circle
  corners: 0.7, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb
  speed: 1, // Rounds per second
  trail: 51, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
}

window.onload = function(){
    $('#time-range').slider({ 'range': true,
                              'min': minScale,
                              'max': maxScale,
                              'values': [minTime, maxTime],
                              'slide' :function(event, ui){
                                   minTime = ui.values[0];
                                   maxTime = ui.values[1];
                                   updateAllPlayers(); 
                              }});
    $('#add-player').click(addPlayerViz);
    $('#play').click(startPlayback);
    addRegularTicks($('#range-holder'), minScale, maxScale, 9);
    requestPlayers();
};

function removePlayer(player){
    console.log(player.index);
    player.wrapper.remove();
    player.map.remove();
    playerList.splice(player.index, 1);
    colourPool.splice(0,0,player['colours']);
    playerCount -= 1;
}

function addPlayerViz(){
    var newPlayer = {};
    newPlayer['loading'] = new Spinner(spin_opts);
    newPlayer['colours'] = colourPool[0];
    colourPool.splice(0,1);
    newPlayer['select'] = $(document.createElement('select')).attr('disabled', 'true');
    newPlayer['spin'] = $(document.createElement('div')).attr('class', 'colour-block');
    newPlayer['colour'] = $(document.createElement('div')).attr('class', 'colour-block').css('background-color', newPlayer['colours'][1]);
    newPlayer['wrapper'] = $(document.createElement('div'));
    newPlayer['map'] = $(document.createElement('div')).attr('class', 'map-canvas');
    newPlayer['index'] = playerCount;
    newPlayer['delete'] = $(document.createElement('input')).attr('type', 'button').attr('value', 'Remove').click(function(){removePlayer(newPlayer);});
    newPlayer['wrapper'].append(newPlayer['colour']);
    newPlayer['wrapper'].append(newPlayer['select']);
    newPlayer['wrapper'].append(newPlayer['delete']);
    newPlayer['wrapper'].append(newPlayer['spin']);
    var playerConf = config;
    playerConf.gradient = {0.00:"white", 0.50:newPlayer['colours'][0], 1.00:newPlayer['colours'][1]};
    playerConf.element = newPlayer['map'][0];
    $('#player-list').append(newPlayer['wrapper']);
    $('#heatmap-canvas').append(newPlayer['map']);
    playerList[playerCount] = newPlayer;
    playerCount += 1;
    newPlayer['select'].change(function(){
        populateHeatmap(newPlayer);    
    });
    newPlayer['h337'] = h337.create(playerConf);
    populatePlayerList(newPlayer['select']);
    populateHeatmap(newPlayer); 
}

function populatePlayerList(list){
   var lastTeam = false;
   list.attr('disabled', false);
   optGroup = $(document.createElement('optgroup')).attr('label', "Other");
   list.append(optGroup);
   for ( var i in players ){
        if ( players[i]['team'] !== lastTeam){
            if ( players[i]['team'] ){
               lastTeam = players[i]['team'];
               optGroup = $(document.createElement('optgroup')).attr('label', "Team "+lastTeam);
               list.append(optGroup);
            }
        }
        optGroup.append(new Option(players[i]['player_name'], players[i]['sid']));
    }
}

function requestPlayers(){
   $('#player-select').attr('disabled', true);
   $.get('/players', populatePlayers); 
}

function populatePlayers(data){
   players=data;
   for (var i in playerList){
       populatePlayerList(playerList[i]['select']);
   } 
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

function updateAllPlayers(){
    for (var p in playerList){
        populateHeatmap(playerList[p]);
    } 
}

function populateHeatmap(playerList){
    if ( playerList['inprogress'] ){
        playerList['buffer'] = true;
        return;
    }
    playerList['inprogress'] = true;
    var e = playerList['loading'].spin().el;
    $(e).css('left', '50%');
    $(e).css('top', '50%');
    playerList['spin'].append(e);
    $.get('/data',
         {'min': (minTime *60000000000000)  + 10753295594424116, // picoseconds to seconds, plus the offset
          'max': (maxTime *60000000000000)  + 10753295594424116,
          'sid': playerList['select'].val()},
          function(data) { displayNewData(playerList, data); } ); 
}

function displayNewData(playerList, data){
    playerList['loading'].stop();
    playerList['inprogress'] = false;
    data = setCount(data);
    var m = findMax(data);
    playerList['h337'].store.setDataSet({max: m, data: data});
    if ( playerList['buffer'] ) {
        playerList['buffer'] = false;
        populateHeatmap(playerList);
    }
    playerList['buffer'] = false;
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

var tickSpan = 0.5;

function startPlayback(){
    $('#time-range').slider().off('slide');
    maxTime = minTime + tickSpan;
    $('#time-range').slider('values', 1 , parseInt($('#time-range').slider('values', 0)) + tickSpan);
    $('#play').off('click');
    $('#play').click(stopPlayback); 
    $('#play').val('Pause Playback');
    playbackTimer = setInterval(playbackTick, 1000);   
}

function playbackTick(){
    maxTime += tickSpan;
    minTime += tickSpan;
    $('#time-range').slider('values', 1, parseInt($('#time-range').slider('values', 1)) + tickSpan);
    $('#time-range').slider('values', 0, parseInt($('#time-range').slider('values', 0)) + tickSpan);
    if (maxTime > maxScale) {
        stopPlayback();
    } else {
        updateAllPlayers();    
    }
}

function stopPlayback(){
    clearInterval(playbackTimer);
    $('#play').val('Playback Game');
    $('#play').off('click');
    $('#play').click(startPlayback);
}
