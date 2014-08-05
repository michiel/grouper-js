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