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
      }
    };
  },

  datePart : function(dateInt) {
    var date = new Date(dateInt);
    return {
      minute : ((date.getHours() * 60) + date.getMinutes()),
      hour   : date.getHours(),
      day    : date.getDate(),
      month  : date.getMonth(),
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
  }

};

