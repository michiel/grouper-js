var extend = require('util')._extend;
var Grouper = require('./lib/grouper.js');
var Padder  = require('./lib/padder.js');

function rand(s) {
  s = s || 500;
  return Math.floor(Math.random() * s);
}

function generateDatePoint() {
  return {
    value : rand(50000),
    date  : +new Date() - rand(600000000),
  };
}

function generateDatePoints() {
  var datePoints = [];

  for (var i=0; i<1000; i++) {
    datePoints.push(generateDatePoint());
  }

  return datePoints;
}

var groups     = ['minute', 'hour', 'day', 'month', 'year'];
var aggregates = ['avg', 'min', 'max', 'sum'];

var datePoints = generateDatePoints();

groups.forEach(function(group) {

    aggregates.forEach(function(aggregate) {

        console.log("running ", group, aggregate, "items : ", datePoints.length);

        var grouper = new Grouper({
            groupBy     : group,
            reducerType : aggregate
          });

        grouper.setData(datePoints);
        grouper.processData();
        var groupedData = grouper.getData();

        console.log("run ", group, aggregate, " grouped ret: ", groupedData.length);

        var padder = new Padder({
            groupBy     : group
          });
        padder.setData(groupedData);
        padder.processData();

        var paddedData = padder.getData();

        console.log("run ", group, aggregate, " padded ret: ", paddedData.length);

      });
  });


