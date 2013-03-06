require 'sinatra'
require 'json'
require 'impala'

IMPALA_SERVER=''

get '/data' do
  content_type 'application/json'
  data=[]
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select (round(x/525)*4)+500 as x, (round(y/340)*2)+350 as y, count(*) val from soccer a join sensors s ON a.sid=s.id WHERE s.role='P' and s.sensor='LL' and name='Ben Mueller' group by name,x,y")
  end
  return JSON.dump data
end

get '/players' do
  content_type 'application/json'
  data={:sensors=>['Left Leg', 'Right Leg'],
        :players=>['Player 1', 'Player 2', 'Player 3']}
  return JSON.dump data
end


get '/real_players' do
  content_type 'application/json'
  data=[]
  Impala.connect(IMPALA_SERVER, 21000) do |conn|
    data = conn.query("select (round(x/525)*4)+500 as x, (round(y/340)*2)+350 as y, count(*) val from soccer a join sensors s ON a.sid=s.id WHERE s.sensor='#{params[:sensor]}' AND s.name='#{params[:name]}' AND a.ts > #{params[:min_time]} AND a.ts > #{params[:max_time]}")
  end
  return JSON.dump data
end
