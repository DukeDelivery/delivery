import { useState, useEffect } from "react";
import { toMilliseconds } from "../utils/time";
import db from '../utils/request'
const TimeSetter = ({}) => {
  const [workTime, setWorkTime] = useState(null);
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const handleSubmit = (e) => {
    e.preventDefault();
    for (const x in workTime) {
      if (workTime[x].active && workTime[x].end < workTime[x].start) {
        alert('End times must be after start times.');
        return;
      }
    }
    db.post('time', workTime);
    alert('work times updated');
  }

  const onActiveChange = (day) => {
    setWorkTime({
      ...workTime,
      [day]: {
        ...workTime[day],
        active: !workTime[day].active
      }
    })
  };
  const onStartChange = (day, start) => {
    setWorkTime({
      ...workTime,
      [day]: {
        ...workTime[day],
        start: toMilliseconds(start)
      }
    })
  }
  const onEndChange = (day, end) => {
    setWorkTime({
      ...workTime,
      [day]: {
        ...workTime[day],
        end: toMilliseconds(end)
      }
    })
  }
  const offOn = (day, value) => {
    if (workTime[day].active) return value;
    return '';
  }
  const toInputTimeString = (time) => {
    let minutes = time / 60000;
    let hours = 0;
    while (minutes >= 60) {
      minutes -= 60;
      hours++;
    }
    if (minutes === 0) minutes = '00';
    if (hours < 10) hours = '0' + hours.toString();
    return hours + ':' + minutes;
  }
  useEffect(() => {
    db.get('time')
      .then(x => setWorkTime(x.data));
  },[]);
  return (
    <form onSubmit={handleSubmit}>
      <table style={{margin:'auto', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <td>Day of Week</td>
            <td>Work Days</td>
            <td>Start Time</td>
            <td>End Time</td>
          </tr>
        </thead>
        <tbody>
          {workTime !== null ?
            weekdays.map(day => {
              return (
                <tr>
                  <td>{day}:</td>
                  <td><input type='checkbox' onChange={() => onActiveChange(day)} checked={workTime[day].active}/></td>
                  <td><input type='time' disabled={!workTime[day].active} value={offOn(day, toInputTimeString(workTime[day].start))} onChange={x => onStartChange(day, x.target.value)}/></td>
                  <td><input type='time'disabled={!workTime[day].active} value={offOn(day, toInputTimeString(workTime[day].end))} onChange={x => onEndChange(day, x.target.value)}/></td>
                </tr>
              )
            }):
            weekdays.map(day => {
              return (
                <tr>
                  <td>{day}:</td>
                  <td><input type='checkbox' disabled={true} /></td>
                  <td><input type='time' disabled={true} /></td>
                  <td><input type='time' disabled={true} /></td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <input type='submit' value='update information'/>
    </form>
  )
}
export default TimeSetter;