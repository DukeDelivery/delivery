import { useState, useEffect } from 'react';
import db from '../utils/request';
import { toMilliseconds, DAY, MIN } from '../utils/time';

const RogueDelivery = () => {
  const [delivery, setDelivery] = useState({});
  const [date, setDate] = useState('');
  const [gates, setGates] = useState([]);
  const [companies, setCompanies] = useState([]);

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
  useEffect(() => {
    db.get('gate').then(x => setGates(x.data));
    db.get('company').then(x => setCompanies(x.data));
  }, []);
  
  return (
    <form id='deliveryForm' onSubmit={submitForm}>
      <h2>Log Rogue Delivery</h2>
      <div className="table">
        <div className="table-row">
          <p className="table-cell"> Date:</p>
          <input className='table-cell' type='date' value={date} onChange={x => setDate(x.target.value)} required />
        </div> 
        <div className="table-row">
          <p className='table-cell'>Start Time:</p>
          <input className='table-cell' type='time' value={delivery.start || ''} onChange={x => handleChange(x.target.value, 'start')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>End Time:</p>
          <input className='table-cell' type='time' value={delivery.end || ''} onChange={x => handleChange(x.target.value, 'end')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Company:</p>
          <select className='table-cell' onChange={x => handleChange(x.target.value, 'company')} required>
            <option value="" disabled selected>Choose company</option>
            {companies.map(company => <option value={company.name}>{company.name}</option>)}
          </select>
        </div>
        <div className="table-row">
          <p className='table-cell'>Description:</p>
          <textarea className='table-cell' value={delivery.description || ''} onChange={x => handleChange(x.target.value, 'description')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Gate:</p>
          <select className='table-cell' onChange={x => handleChange(x.target.value, 'gate')} required>
            <option value="" disabled selected>Choose gate</option>
            {gates.map(gate => <option value={gate.name}>{gate.name}</option>)}
          </select>
        </div>
        <div className="table-row">
          <p className='table-cell'>Contact Name:</p>
          <input className='table-cell' type='text' value={delivery.contactName || ''} onChange={x => handleChange(x.target.value, 'contactName')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Contact Number:</p>
          <input className='table-cell' type='tel' value={delivery.contactNumber || ''} onChange={x => handleChange(x.target.value, 'contactNumber')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Location:</p>
          <input className='table-cell' type='text' value={delivery.location || ''} onChange={x => handleChange(x.target.value, 'location')} required />
        </div>
        <div className='table-row'>
          <p className='table-cell'>Scheduler Name:</p>
          <input type='text' value={delivery.schedName || ''} onChange={x => handleChange(x.target.value, 'schedName')} />
        </div>
        <div className='table-row'>
          <p className='table-cell'>Scheduler Number:</p>
          <input type='tel' value={delivery.schedNumber || ''} onChange={x => handleChange(x.target.value, 'schedNumber')} />
        </div>
        <div className='table-row'>
          <p className='table-cell'>Supplier:</p>
          <input type='text' value={delivery.supplier || ''} onChange={x => handleChange(x.target.value, 'supplier')} />
        </div>
        <div className='table-row'>
          <p className='table-cell'>Hoist Method:</p>
          <input type='text' value={delivery.hoistMethod || ''} onChange={x => handleChange(x.target.value, 'hoistMethod')} />
        </div>
        <div className='table-row'>
          <p className='table-cell'>Number of Trucks:</p>
          <input type='number' value={delivery.trucks || ''} onChange={x => handleChange(x.target.value, 'trucks')} />
        </div>
        <div className='table-row'>
          <p className='table-cell'>Extra Notes</p>
          <textarea value={delivery.notes || ''} onChange={x => handleChange(x.target.value, 'notes')} />
        </div>
      </div>
      <input type="submit" value="Submit Delivery" />
    </form>
  )
}
export default RogueDelivery;