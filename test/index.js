var assert = require('assert');
var expect = require('expect.js');
var moment = require('moment');

var Grouper = require('../lib/grouper.js');

var RANGESIZE = 1000;

var mom     = moment(new Date(0));
var counter = 0;

var incDay = function() {
  mom.add('days', 1);
  return +mom.toDate();
};

function generateDatePoint(fn) {
  return {
    value : counter++,
    date  : fn()
  };
}

function generateDatePoints(fn) {
  var datePoints = [];

  for (var i=0; i<=RANGESIZE; i++) {
    datePoints.push(generateDatePoint(fn));
  }

  return datePoints;
}

var groups     = ['minute', 'hour', 'day', 'month', 'year'];
var aggregates = ['avg', 'min', 'max', 'sum'];

var datePoints = []; 

describe('Grouper', function() {

    beforeEach(
      function(done) {
        mom     = moment(new Date(0));
        counter = 0;
        done();
      });

    describe('groupBy#minute', function() {

        it('should have 1000 elements when days grouped by minute', function() {

            datePoints = generateDatePoints(incDay);
            var grouper = new Grouper({
                groupBy     : 'minute'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, RANGESIZE);
          });
      });

    describe('groupBy#day', function() {

        it('should have RANGESIZE elements when days grouped by day', function() {

            datePoints = generateDatePoints(incDay);
            var grouper = new Grouper({
                groupBy     : 'day'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, RANGESIZE);
          });
      });

    describe('groupBy#month', function() {

        it('should have 41 elements when days grouped by month', function() {

            datePoints = generateDatePoints(incDay);

            var grouper = new Grouper({
                groupBy     : 'month'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, 41);
          });
      });

    describe('groupBy#year', function() {

        it('should have 3 elements when days grouped by year', function() {

            datePoints = generateDatePoints(incDay);
            var grouper = new Grouper({
                groupBy     : 'year'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, 3);
          });
      });

  });
