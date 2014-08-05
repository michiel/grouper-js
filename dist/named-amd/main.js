define("grouper",
  [],
  function() {
    "use strict";
    'use strict';

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
  });
define("grouper/padder",
  [],
  function() {
    "use strict";
    'use strict';

    var util   = require('./util');

    var datePart      = util.datePart;
    var options       = util.options;
    var dataStructFor = util.dataStructFor;

    function padder(args) {

      var opts       = options(args || {});
      var dataStruct = dataStructFor(opts);

      //
      // Data crunching
      //

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
          function(a, b) {
            return +a[opts.dateProperty] < +b[opts.dateProperty];
          }
        );
      };

      /* jshint validthis:true */
      this.getData = function() {
        return outputData;
      };

    }

    module.exports = padder;
  });
define("grouper/util",
  [],
  function() {
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
  });