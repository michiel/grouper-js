!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Grouper=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
'use strict';

var util = _dereq_('./util');

var datePart      = util.datePart;
var options       = util.options;
var dataStructFor = util.dataStructFor;
var timeIntervals = util.timeIntervals;

function grouper(opts) {

  opts           = options(opts || {});
  var dataStruct = dataStructFor(opts);

  //
  // Reducer functions
  //  - average needs some special treatment
  //

  var groupReducer = (function(type) {
      var fn;
      switch(type) {
      case 'avg':
        fn = average;
        break;
      case 'sum':
        fn = reducerFor(sumF);
        break;
      case 'min':
        fn = reducerFor(minF);
        break;
      case 'max':
        fn = reducerFor(maxF);
        break;
      default:
        throw new Error('grouper.groupReducer : unknown type ' +  type);
      }
      return fn;
    })(opts.reducerType);

  function reducerFor(fn) {
    return function(arr) {
      var val = arr.reduce(fn, 0);
      return dataStruct(
        arr[0].date,
        arr[0].datePart,
        val
      );
    };
  }

  function sumF(prev, curr) {
    var num = curr[opts.numberProperty];
    return num + prev;
  }

  function maxF(prev, curr) {
    var num = curr[opts.numberProperty];
    return prev < num ? num : prev;
  }

  function minF(prev, curr) {
    var num = curr[opts.numberProperty];
    return prev > num ? num : prev;
  }

  function average(arr) {
    var av = 0;
    if (arr.length !== 0) {
      av = arr.reduce(sumF, 0) / arr.length;
    }
    return dataStruct(
      arr[0].date,
      arr[0].datePart,
      av
    );
  }

  //
  // Data crunching
  //

  function structureForProcessing(el) {
    var date = opts.dateParser(el[opts.dateProperty]);
    return dataStruct(
      date,
      datePart(date),
      opts.numberParser(el[opts.numberProperty])
    );
  }


  function reduceToGroups(retArr, curr/* , index, arr */) {

    if (retArr.length === 0) {

      //
      // First element, start new range
      //

      retArr.push([curr]);

    } else {

      var currRange = retArr[retArr.length - 1];
      var last      = currRange[currRange.length - 1];
      
      if (inSameRange(curr.datePart, last.datePart)) {

        //
        // Add to current range
        //

        currRange.push(curr);

      } else {

        //
        // Start new range with current object
        //

        retArr.push([curr]);
      }

    }

    return retArr;
  }

  function inSameRange(a, b) {

    var firstNonMatch = 'millisecond';
    var len           = timeIntervals.length - 1;

    for (var i=len,range;(range=timeIntervals[i]);i--) {
      if (a[range] !== b[range]) {
        firstNonMatch = range;
        break;
      }
    }

    return timeIntervals.indexOf(firstNonMatch) < timeIntervals.indexOf(opts.groupBy);
  }

  var inputData  = [];
  var outputData = [];

  /* jshint validthis:true */
  this.setData = function(data) {
    inputData = data;
  };

  /* jshint validthis:true */
  this.processData = function() {
   outputData = inputData.
    map(
      structureForProcessing
    ).
    sort(
      opts.dateSorter
    ).
    reduce(
      reduceToGroups, []
    ).
    map(
      groupReducer
    );
  };

  /* jshint validthis:true */
  this.getData = function() {
    return outputData;
  };

}

module.exports = grouper;
},{"./util":2}],2:[function(_dereq_,module,exports){
"use strict";
'use strict';

module.exports = {

  options : function(args) {
    args = args || {};
    return {
      groupBy        : args.groupBy        || 'day',   // any datePart{}
      dateProperty   : args.dateProperty   || 'date',  // data['date']
      numberProperty : args.numberProperty || 'value', // data['value']
      reducerType    : args.reducerType    || 'avg',   // min, max, sum, avg
      numberParser   : args.numberParser   || function(num) {
        return parseInt(num, 10);
      },
      dateParser     : args.dateParser     || function(date) {
        return new Date(date);
      },
      dateSorter     : args.dateSorter     || function(a, b) {
        return +a.date < +b.date;
      },

    };
  },

  datePart : function(dateInt) {
    var date = new Date(dateInt);
    return {
      second : date.getSeconds(),
      minute : ((date.getHours() * 60) + date.getMinutes()),
      hour   : date.getUTCHours() + 1,
      day    : date.getUTCDate(),
      month  : date.getUTCMonth(),
      year   : date.getFullYear()
    };
  },

  dataStructFor : function(opts) {
    return function(date, datePart, value) {
      var ret = {
        date     : date,
        datePart : datePart
      };
      ret[opts.numberProperty] = value;
      return ret;
    };
  },

  //
  // Order of these intervals specifies priority, which is necessary for
  // grouping
  //

  timeIntervals : [
    'second',
    'minute',
    'hour',
    'day',
    'month',
    'year'
  ],

  aggregateFunctions : [
    'avg',
    'min',
    'max',
    'sum'
  ]

};
},{}]},{},[1])
(1)
});