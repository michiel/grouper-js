var util = require('./util');

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

  var reducer = (function(type) {
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
        throw new Error('grouper.reducer : unknown type ' +  type);
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

  function inSameRange(a, b) {

    var firstNonMatch = 'millisecond';

    if (a.year !== b.year) {
      firstNonMatch = 'year';
    } else if (a.month !== b.month) {
      firstNonMatch = 'month';
    } else if (a.day !== b.day) {
      firstNonMatch = 'day';
    } else if (a.hour !== b.hour) {
      firstNonMatch = 'hour';
    } else if (a.minute !== b.minute) {
      firstNonMatch = 'minute';
    } else if (a.second !== b.second) {
      firstNonMatch = 'second';
    } else {
      firstNonMatch = 'millisecond';
    }

    return timeIntervals.indexOf(firstNonMatch) < timeIntervals.indexOf(opts.groupBy);
  }

  var inputData  = [];
  var outputData = [];

  this.setData = function(data) {
    inputData = data;
  };

  this.processData = function() {
   outputData = inputData.
    map(

      //
      // Ready each element for processing
      //

      function(el) {
        var date = opts.dateParser(el[opts.dateProperty]);
        return dataStruct(
          date,
          datePart(date),
          opts.numberParser(el[opts.numberProperty])
        );
      }
    ).
    sort(

      //
      // Order by date
      //

      function(a, b) {
        return +a[opts.dateProperty] < +b[opts.dateProperty];
      }

    ).
    reduce(

      function(prev, curr, index, arr) {

        if (prev.length === 0) {

          //
          // First element, start new range
          //

          prev.push([curr]);

        } else {

          var currArr = prev[prev.length - 1];
          var last    = currArr[currArr.length - 1];
          
          if (inSameRange(curr.datePart, last.datePart)) {

            //
            // Add to current range
            //

            currArr.push(curr);

          } else {

            //
            // Start new range
            //

            prev.push([curr]);
          }

        }

        return prev;

      }, []
    ).
    map(reducer);
  };

  this.getData = function() {
    return outputData;
  };

}

module.exports = grouper;
