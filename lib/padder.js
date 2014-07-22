var util   = require('./util');
var moment = require('moment');

var datePart      = util.datePart;
var options       = util.options;
var dataStructFor = util.dataStructFor;

function padder(args, startDate, endDate) {

  startDate = startDate || (+new Date());
  endDate   = endDate   || (+new Date());

  var startDatePart = datePart(+startDate);
  var endDatePart   = datePart(+endDate);

  opts           = options(args || {});
  var dataStruct = dataStructFor(opts);

  //
  // Data crunching
  //

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
      function(a, b) {
        return +a[opts.dateProperty] < +b[opts.dateProperty];
      }
    );
  };

  this.getData = function() {
    return outputData;
  };

}

module.exports = padder;
