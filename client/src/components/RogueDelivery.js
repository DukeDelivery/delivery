import { useState, useEffect } from 'react';
import db from '../utils/request';
import { toMilliseconds, DAY, MIN } from '../utils/time';

const RogueDelivery = () => {
  const [delivery, setDelivery] = useState({});
  const [date, setDate] = useState('');

  const handleChange = (data, field) => {
    setDelivery({
      ...delivery,
      [field]: data,
    });
  }

  const submitForm = (event) => {
    event.preventDefault();
    delivery.start = toMilliseconds(delivery.start);
    delivery.end = toMilliseconds(delivery.end);
    for (const field in delivery) {
      if (delivery[field] === '') delivery[field] = null;
    }
    if (delivery.start > delivery.end) {
      alert('End time must be after start time');
      window.scrollTo(0, 0);
      return;
    }
    delivery.start = new Date(date).valueOf() + delivery.start + new Date(date).getTimezoneOffset()*MIN;
    delivery.end = new Date(date).valueOf() + delivery.end + new Date(date).getTimezoneOffset()*MIN;
    delivery.approved = false;
    delivery.completed = true;
    db.post('delivery', delivery).then(() => {
      alert('Your delivery has been saved.');
    }).catch(() => {
      alert('There was an error saving your delivery');
    });
    setDelivery({});
    window.scrollTo(0, 0);
  }
  
  return (
    <form onSubmit={submitForm}>
      <h2>Log Rogue Delivery</h2>
      <table >
        <tbody>
          <tr>
            <td>Date:</td>
            <td><input type='date' value={date} onChange={x => setDate(x.target.value)} required /></td>
          </tr> 
          <tr>
            <td> Start Time:</td>
            <td><input type='time' value={delivery.start || ''} onChange={x => handleChange(x.target.value, 'start')} required /></td>
          </tr>
          <tr>
            <td>End Time:</td>
            <td><input type='time' value={delivery.end || ''} onChange={x => handleChange(x.target.value, 'end')} required /></td>
          </tr>
          <tr>
            <td>Company:</td>
            <td><input type='text' value={delivery.company || ''} onChange={x => handleChange(x.target.value, 'company')} required /></td>
          </tr>
          <tr>
            <td>Description:</td>
            <td><textarea value={delivery.description || ''} onChange={x => handleChange(x.target.value, 'description')} required /></td>
          </tr>
          <tr>
            <td>Gate:</td>
            <td><input type='number' value={delivery.gate || ''} onChange={x => handleChange(x.target.value, 'gate')} required /></td>
          </tr>
          <tr>
            <td>Contact Name:</td>
            <td><input type='text' value={delivery.contactName || ''} onChange={x => handleChange(x.target.value, 'contactName')} required /></td>
          </tr>
          <tr>
            <td>Contact Number</td>
            <td><input type='tel' value={delivery.contactNumber || ''} onChange={x => handleChange(x.target.value, 'contactNumber')} required /></td>
          </tr>
          <tr>
            <td>Location:</td>
            <td><input type='text' value={delivery.location || ''} onChange={x => handleChange(x.target.value, 'location')} required /></td>
          </tr>
          <tr>
            <td>Scheduler Name:</td>
            <td><input type='text' value={delivery.schedName || ''} onChange={x => handleChange(x.target.value, 'schedName')} /></td>
          </tr>
          <tr>
            <td>Scheduler Number:</td>
            <td><input type='tel' value={delivery.schedNumber || ''} onChange={x => handleChange(x.target.value, 'schedNumber')} /></td>
          </tr>
          <tr>
            <td>Supplier:</td>
            <td><input type='text' value={delivery.supplier || ''} onChange={x => handleChange(x.target.value, 'supplier')} /></td>
          </tr>
          <tr>
            <td>Hoist Method:</td>
            <td><input type='text' value={delivery.hoistMethod || ''} onChange={x => handleChange(x.target.value, 'hoistMethod')} /></td>
          </tr>
          <tr>
            <td>Number of Trucks:</td>
            <td><input type='number' value={delivery.trucks || ''} onChange={x => handleChange(x.target.value, 'trucks')} /></td>
          </tr>
          <tr>
            <td>Extra Notes</td>
            <td><textarea value={delivery.notes || ''} onChange={x => handleChange(x.target.value, 'notes')} /></td>
          </tr>
        </tbody>
      </table>
      <input type="submit" value="Submit Delivery" />
    </form>
  )
}
export default RogueDelivery;