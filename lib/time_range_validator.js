var TimeRangeValidator = {
  validate: function(newTimeRange, tasks){
    if(newTimeRange.work_start.toString() === "Invalid date" ||
      newTimeRange.work_end.toString() === "Invalid date")
      return new this.ValidationError(
        this.ValidationError.TYPES.INVALIDATE,
        newTimeRange
      );

    if(newTimeRange.work_start.toString() === newTimeRange.work_end.toString())
      return new this.ValidationError(
        this.ERROR_TYPES.DUPLICATED,
        newTimeRange
      );
    if(newTimeRange.work_start > newTimeRange.work_end)
      return new this.ValidationError(
        this.ERROR_TYPES.LATER_START,
        newTimeRange
      );
    var timeRange;
    for(var i in tasks){
      timeRange = tasks[i].timeRange;
      var trKeys = ["work_start", "work_end"]
      for(var j in trKeys){
        var trKey = trKeys[j];
        if((timeRange.work_start.get() < newTimeRange[trKey] &&
          timeRange.work_end.get() > newTimeRange[trKey]) ||
          (newTimeRange.work_start < timeRange[trKey].get() &&
          newTimeRange.work_end > timeRange[trKey].get()) ){
            return new this.ValidationError(
              this.ERROR_TYPES.FOLDED,
              newTimeRange
            );
          }
      }

      if(timeRange.work_start.get().isSame(newTimeRange.work_start) &&
         timeRange.work_end.get().isSame(newTimeRange.work_end)){
            return new this.ValidationError(
              this.ERROR_TYPES.DUPLICATED,
              newTimeRange
            );
         }
    }
    return true;

  },
  ERROR_TYPES:{
    DUPLICATED: {message: 'Duplicated time range'},
    FOLDED: {message: 'partely duplicated time range'},
    LATER_START: {message: 'start time can not be later then end time'},
    INVALIDATE: {message: 'invalidate data type to convert momentjs obj'}
  },
  ValidationError: function(errorType, timeRange){
    this.errorType = errorType;
    this.timeRange = timeRange;
    this.isErrorObj = true;
  }
}

module.exports = TimeRangeValidator;
