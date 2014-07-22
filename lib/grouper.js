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

  function datePart(dateInt) {
    var date = new Date(dateInt);
    return {
      minute : ((date.getHours() * 60) + date.getMinutes()),
      hour   : date.getHours(),
      day    : date.getDate(),
      month  : date.getMonth(),
      year   : date.getFullYear()
    };
  }

  function dataStruct(date, datePart, value) {
    var ret = {
      date     : date,
      datePart : datePart
    };
    ret[numberProperty] = value;
    return ret;
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
      return dataStruct(arr[0].date, arr[0].datePart, val);
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
    return dataStruct(arr[0].date, arr[0].datePart, av);
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
        return dataStruct(
          date,
          datePart(date),
          numberParser(el[numberProperty])
        );
      }
    ).
    sort(

      //
      // Order by date
      //

      function(a, b) {
        return +a.date < +b.date;
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
          curr.datePart[groupBy] !== prev[prev.length - 1].datePart[groupBy]
        ) {

          //
          // Start of a new range, reduce the last range and add it to the
          // outputData[]
          //

          outputData.push(reducer(prev));
          return [curr];

        } else if (
          index === (arr.length - 1)
        ) {

          //
          // End of the line, 
          //
          //  - if curr item belongs in the active range, add it and push the reduced range
          //  - else reduce the active range and treat curr as a new range
          //
          //  Add the results to outputData[]
          //

          if (curr.datePart[groupBy] === prev[prev.length - 1].datePart[groupBy]) {
            prev.push(curr);
            outputData.push(reducer(prev));
          } else {
            outputData.push(reducer(prev));
            outputData.push(reducer([curr]));
          }

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
