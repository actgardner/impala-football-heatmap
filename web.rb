require 'sinatra'
require 'json'
require 'impala'

set :bind, '0.0.0.0'
set :port, 80

IMPALA_SERVER=''

get '/' do
  redirect '/index.html'
end

get '/data' do
  content_type 'application/json'
  data=[]
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select (round(-1*x/2624)*25)+573 as y, (round(-1*y/3400)*34)+363 as x, count(*)/200 as val from soccer WHERE sid =#{params[:sid]} AND ts < #{params[:max]} AND ts > #{params[:min]} group by x,y")
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

