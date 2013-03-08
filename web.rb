require 'sinatra'
require 'json'
require 'impala'

IMPALA_SERVER=''

get '/data' do
  content_type 'application/json'
  data=[]
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select (round(x/2650)*17)+440 as x, (round(-1*y/3400)*24)+280 as y, count(*)/200 val from soccer_part WHERE sid =#{params[:sid]} AND ts < #{params[:max]} AND ts > #{params[:min]} group by x,y")
  end
  return JSON.dump data
end

get '/players' do
  content_type 'application/json'
  data = {:sensors=>['LL', 'RL']}
  players = []
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select sid, sensor_position, player_name FROM sensors WHERE player_type='P'")
  end
  data = {:sensors=>['LL', 'RL'], :players=>data}
  return JSON.dump data
end

