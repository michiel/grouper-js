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

