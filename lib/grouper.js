function grouper(opts) {

  opts = opts || {};

  var groupBy        = opts.groupBy        || 'day';   // any datePart{}
  var dateProperty   = opts.dateProperty   || 'date';  // data['date']
  var numberProperty = opts.numberProperty || 'value'; // data['value']
  var reducerType    = opts.reducerType    || 'avg';   // min, max, sum, avg

  var numberParser = opts.numberParser || function(num) {
    return parseInt(num, 10);
  };

  var dateParser = opts.dateParser   || function(date) {
    return new Date(date);
  };

  function datePart(date) {
    return {
      minute : ((date.getHours() * 60) + date.getMinutes()),
      hour   : date.getHours(),
      day    : date.getDate(),
      month  : date.getMonth(),
      year   : date.getFullYear()
    };
  }

  //
  // Reducer functions
  //  - average needs some special treament
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
        console.error('grouper.reducer : unknown type', type);
      }
      return fn;
    })(reducerType);

  function reducerFor(fn) {
    return function(arr) {
      var val = arr.reduce(fn, 0);
      return {
        date     : arr[0].date,
        datePart : arr[0].datePart,
        value    : val
      };
    };
  }

  function sumF(prev, curr) {
    var num = curr[numberProperty];
    return num + prev;
  }

  function maxF(prev, curr) {
    var num = curr[numberProperty];
    return prev < num ? num : prev;
  }

  function minF(prev, curr) {
    var num = curr[numberProperty];
    return prev > num ? num : prev;
  }

  function average(arr) {
    var av = 0;
    if (arr.length !== 0) {
      av = arr.reduce(sumF, 0) / arr.length;
    }
    return {
      date     : arr[0].date,
      datePart : arr[0].datePart,
      value    : av
    };
  }

  //
  // Data crunching
  //

  var inputData  = [];
  var outputData = [];

  this.setData = function(data) {
    inputData = data;
  };

  this.processData = function() {
    var data = inputData.
    map(

      //
      // Ready each element for processing
      //

      function(el) {
        var date = dateParser(el[dateProperty]);
        return {
          date     : date,
          datePart : datePart(date),
          value    : numberParser(el[numberProperty])
        };
      }
    ).
    sort(

      //
      // Order by date
      //

      function(a, b) {
        return a.date < b.date;
      }

    ).
    reduce(
      function(prev, curr, index, arr) {

        if (prev.length === 0) {

          //
          // First item
          //

          return [curr];

        } else if (
          curr.datePart[groupBy] != prev[prev.length - 1].datePart[groupBy]
        ) {

          //
          // Start of a new range, average the last range and add it to the
          // outputData[]
          //

          outputData.push(average(prev));
          return [curr];

        } else {

          //
          // In the same range, keep adding
          //

          prev.push(curr);
          return prev;
        }

      }, []
    );
  };

  this.getData = function() {
    return outputData;
  };

}

module.exports = grouper;
