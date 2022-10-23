import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import db from '../utils/request';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'
import EventsContext from '../contexts/EventsContext';

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    db.get('delivery').then(x => setEvents(x.data));
  }, []);
  const eventPropGetter = (event) => {
    if (event.approved && event.completed) {
      return {style: {backgroundColor: '#0B9304', borderColor: '#036903'}}; // green
    } else if (event.approved && !event.completed) {
      return {style: {backgroundColor: '#021EBA', borderColor: '#090458'}}; // blue
    } else if (!event.approved && event.completed) {
      return {style: {backgroundColor: '#B30101', borderColor: '#780000'}}; // red
    } else {
      return {style: {backgroundColor: '#D5A702', borderColor: '#B88A02'}}; //yellow
    }
  }
  const localizer = momentLocalizer(moment);
  return (
    <EventsContext.Provider value={{events, setEvents}}>
      <button onClick={() => setApproved(approved => !approved)} >{approved ? "Show All" : "Show Approved"} </button>
      <div id="calendar">
        {delivery !== null && <Modal delivery={delivery} setDelivery={setDelivery}/>}
        <Calendar localizer={localizer} defaultView={'week'} onSelectEvent={x => setDelivery(x)} views={['day','week','month']}
        step={7.5} scrollToTime={new Date('2003-11-30T13:00:00.000Z')} eventPropGetter={eventPropGetter}
        events={approved ? 
          events.filter(event => event.approved).map(event => {
            return {
              ...event,
              title: event.company + ": " + event.description,
              start: new Date(event.start),
              end: new Date(event.end),
            }

          }):
          events.map(event => {
            return {
              ...event,
              title: event.company + ": " + event.description,
              start: new Date(event.start),
              end: new Date(event.end),
            }
          })
        } />
      </div>
    </EventsContext.Provider>
    
  );
};

export default Schedule;