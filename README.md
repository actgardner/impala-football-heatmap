impala-football-heatmap
=======================

A simple Ruby/Impala demo visualizing the DEB Grand Challenge 2013 Football data

#Requirements

You must have a Hadoop cluster, with Hive and Impala configured. You can use the [Cloudera Impala Demo VM](https://ccp.cloudera.com/display/SUPPORT/Cloudera\'s+Impala+Demo+VM), which has everything pre-configured, to get test it out on your desktop.

#To Use

Grab the [DEB grand challenge sensor data](http://www.orgs.ttu.edu/debs2013/index.php), and sensors.csv from this repo.

In a Hive shell, define the tables and load the data:

    CREATE TABLE soccer ( sid int, ts bigint, x double, y double, z double, v double, a double, vx double, vy double, vz double, ax double, ay double, az double ) ROW FORMAT FIELDS TERMINATED BY ',';
    CREATE TABLE sensors ( sid int, sensor_position string, team string, player_type string, player_name string ) ROW FORMAT FIELDS TERMINATED BY ',';
    LOAD DATA LOCAL INPATH 'full-game' INTO TABLE soccer;
    LOAD DATA LOCAL INPATH 'sensors.csv' INTO TABLE sensors;

In web.rb configure 'IMPALA_SERVER' to point to an Impala daemon on your cluster

Start the server with 'ruby web.rb'. You should be able to see the visualization by pointing your browser at port 4567 on your server.

#Shout Outs

To put this together quickly, we used [spin.js](http://fgnass.github.com/spin.js/) for the loading spinner and [heatmap.js](http://www.patrick-wied.at/static/heatmapjs/) to draw the heatmap.
