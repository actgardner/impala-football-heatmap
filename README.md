impala-football-heatmap
=======================

A simple Ruby/Impala demo visualizing the DEB Grand Challenge 2013 Football data

#Requirements

You must have a Hadoop cluster, with Hive and Impala configured. You can use the [Cloudera Impala Demo VM](https://ccp.cloudera.com/display/SUPPORT/Cloudera\'s+Impala+Demo+VM), which has everything pre-configured, to get test it out on a single machine.

#To Use

Grab the [DEB grand challenge sensor data](http://www.orgs.ttu.edu/debs2013/index.php), and sensors.csv from this repo.

In a Hive shell, define the tables and load the data:

    CREATE TABLE soccer ( sid int, ts bigint, x double, y double, z double, v double, a double, vx double, vy double, vz double, ax double, ay double, az double ) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';
    CREATE TABLE sensors ( sid int, sensor_position string, team string, player_type string, player_name string ) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';
    LOAD DATA LOCAL INPATH 'full-game' INTO TABLE soccer;
    LOAD DATA LOCAL INPATH 'sensors.csv' INTO TABLE sensors;

In web.rb configure IMPALA_SERVER to point to an Impala daemon on your cluster

Start the server with 'ruby web.rb'. You should be able to see the visualization by pointing your browser at port 4567 on your server.

#Partitioning

To partition on the sensor id, which speeds up the queries a bit, you can run the following:

    SET hive.exec.dynamic.partition=true;
    SET hive.exec.dynamic.partition.mode=nonstrict;
    CREATE TABLE soccer_part (ts bigint, x double, y double, z double, v double, a double, vx double, vy double, vz double, ax double, ay double, az double) PARTITIONED BY (sid int) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',';
    INSERT OVERWRITE TABLE soccer_part PARTITION(sid) select ts,x,y,z,v,a,vx,vy,vz,ax,ay,az,sid from soccer;

You'll have to update the query in web.rb to use the partitioned table, as well.

#Thanks

To put this together quickly, we used [spin.js](http://fgnass.github.com/spin.js/) for the loading spinner and [heatmap.js](http://www.patrick-wied.at/static/heatmapjs/) to draw the heatmap. 

On the backend, Colin Marc's [impala-ruby](https://github.com/colinmarc/impala-ruby) was essential

The [football pitch background image](http://commons.wikimedia.org/wiki/File:Kentt%C3%A4.png) is from Wikimedia Commons user Lenin 
