const SEC = 1000;
const MIN = 60000;
const HOUR = 3600000;
const DAY = 86400000;

const toMilliseconds = (timeString) => {
  const t = timeString.split(':');
  return parseInt(t[0])*HOUR + parseInt(t[1])*MIN;
}
const toDateString = (date) => {
  return new Date(date).toLocaleString('en-US', {dateStyle: 'medium'});
}
const toDateTimeString = (date) => {
  return new Date(date).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'});
}

const toTimeString = (time)  => {
  const today = new Date();
  today.setHours(0,0,0,0);
  today.setMilliseconds(time);
  return today.toLocaleTimeString('en-US', {timeStyle: 'short'});
}

const getTime = (date) => {
  return (date - new Date(date).getTimezoneOffset()*MIN) % DAY;
}
const getWeekday = (date) => {
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  return weekdays[new Date(date).getUTCDay()];
}

const parseTime = (string) => {
  if (string == '') return null;
  var time = string.match(/(\d+)(:(\d\d))?\s*(p?)/i);	
  if (time == null) return null;
  
  var hours = parseInt(time[1],10);	 
  if (hours == 12 && !time[4]) {
      hours = 0;
  }
  else {
    hours += (hours < 12 && time[4])? 12 : 0;
  }
  return (hours*3600000) + (parseInt(time[3],10) || 0)*60000;
}
const parseDate = (string) => {
  const monthLength = [31,28,31,30,31,30,30,31,30,31,30,31];
  let month = 0;
  let day = 0;
  let year = new Date().getFullYear();
  if (string === 'today') {
    date = new Date()
    date.setHours(0, 0, 0, 0);
    return date.valueOf();
  }
  else if (string === 'yesterday') {
    date = new Date()
    date.setHours(0, 0, 0, 0);
    return date.valueOf() - DAY;
  }
  else if (string === 'tomorrow') {
    date = new Date()
    date.setHours(0, 0, 0, 0);
    return date.valueOf() + DAY;
  }
  else {
    const arr = string.split('/');
    if (arr.length != 2) throw 100;
    try {
      month = parseInt(arr[0]-1);
      day = parseInt(arr[1]);
    } catch {
      throw 100;
    }
    if (month < 0 || month > 11) {
      throw 100;
    }
    if (day < 0 || day > monthLength[month]) {
      throw 100;
    }
  }
  if(new Date().getMonth() > month) year++;
  return new Date(year, month, day).valueOf();
}

module.exports = { SEC, MIN, HOUR, DAY, toDateString, toDateTimeString, toTimeString, getTime, getWeekday, toMilliseconds, parseDate, parseTime };
