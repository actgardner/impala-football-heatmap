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
    data = conn.query("select (round(-1*x/2624)*25)+563 as y, (round(-1*y/3400)*39)+472 as x, count(*)/200 as val from soccer WHERE sid =#{params[:sid]} AND ts < #{params[:max]} AND ts > #{params[:min]} AND x > 0 group by x,y")
  end
  return JSON.dump data
end

get '/players' do
  content_type 'application/json'
  data=[]
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("SELECT MIN(sid) AS sid, player_name, MIN(team) AS team FROM sensors WHERE player_name != 'Ball' GROUP BY player_name ORDER BY team LIMIT 100")
  end
  return JSON.dump data
end

