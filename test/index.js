var assert = require('assert');
var expect = require('expect.js');
var moment = require('moment');

var Grouper = require('../lib/grouper.js');
var Util    = require('../lib/util.js');

var groups     = Util.timeIntervals;
var aggregates = Util.aggregateFunctions;

var RANGESIZE = 1000;

var mom     = null; // moment(new Date(0));
var counter = 0;

var incSecond = function() {
  mom.add('seconds', 1);
  return +mom.toDate();
};

var incDay = function() {
  mom.add('days', 1);
  return +mom.toDate();
};

var incMonth = function() {
  mom.add('months', 1);
  return +mom.toDate();
};

var incYear = function() {
  mom.add('years', 1);
  return +mom.toDate();
};

function generateDatePoint(fn) {
  return {
    value : counter++,
    date  : fn()
  };
}

function generateDatePoints(fn, amount) {
  var datePoints = [];
  amount = amount || RANGESIZE;

  for (var i=0; i<amount; i++) {
    datePoints.push(generateDatePoint(fn));
  }

  return datePoints;
}

var datePoints = []; 

describe('Grouper', function() {

    beforeEach(
      function(done) {
        mom     = moment(new Date(0));
        counter = 0;
        done();
      });

    describe('groupBy#second/second', function() {

        it('should have 1000 elements when seconds grouped by second', function() {

            datePoints = generateDatePoints(incSecond);
            var grouper = new Grouper({
                groupBy     : 'second'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, RANGESIZE);
          });
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

        it('should have 1000 elements when days grouped by day', function() {

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

        it('should have 40 elements when days grouped by month', function() {

            datePoints = generateDatePoints(incDay);

            var grouper = new Grouper({
                groupBy     : 'month'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, 40);
          });
      });

    describe('groupBy#months/month', function() {

        it('should have 12 elements when months grouped by month', function() {

            datePoints = generateDatePoints(incMonth, 12);

            var grouper = new Grouper({
                groupBy     : 'month'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, 12);
          });
      });

    describe('groupBy#months/day', function() {

        it('should have 12 element when months grouped by day', function() {

            datePoints = generateDatePoints(incMonth, 12);

            var grouper = new Grouper({
                groupBy     : 'day'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, 12);
          });
      });


    describe('groupBy#years/year', function() {

        it('should have 12 element when years grouped by year', function() {

            datePoints = generateDatePoints(incYear, 12);

            var grouper = new Grouper({
                groupBy     : 'year'
              });

            grouper.setData(datePoints);
            grouper.processData();

            assert.equal(grouper.getData().length, 12);
          });
      });


  });
