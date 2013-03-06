require 'sinatra'
require 'json'
require 'impala'

IMPALA_SERVER='10.177.2.3'

get '/data' do
  content_type 'application/json'
  data=[]
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select (round(x/525)*4)+500 as x, (round(y/340)*2)+350 as y, count(*) val from soccer a join sensors s ON a.sid=s.sid WHERE s.sensor_position='#{params[:sensor]}' and s.player_name='#{params[:player]}' AND ts < #{params[:max]} AND ts > #{params[:min]} group by x,y")
  end
  return JSON.dump data
end

get '/players' do
  content_type 'application/json'
  data = {:sensors=>['LL', 'RL']}
  players = []
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select player_name FROM sensors WHERE player_type='P' GROUP BY player_name")
  end
  data = {:sensors=>['LL', 'RL'], :players=>data}
  return JSON.dump data
end

