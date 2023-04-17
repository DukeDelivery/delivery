import { useState, useEffect, useContext } from 'react';
import AdminContext from '../contexts/AdminContext';
import db from '../utils/request';
import { toTimeString, toMilliseconds, DAY, MIN } from '../utils/time';

const Form = () => {
  const [delivery, setDelivery] = useState({duration: 30});
  const [gates, setGates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [times, setTimes] = useState({});
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const durations = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480];
  const {admin} = useContext(AdminContext);

  const handleChange = (data, field) => {
    setDelivery({
      ...delivery,
      [field]: data,
    });
  }

  const submitForm = (event) => {
    event.preventDefault();
    delivery.start = toMilliseconds(delivery.start);
    delivery.end = parseInt(delivery.start) + parseInt(delivery.duration)*MIN;
    for (const field in delivery) {
      if (delivery[field] === '') delivery[field] = null;
    }
    if (delivery.start > delivery.end) {
      alert('End time must be after start time');
      window.scrollTo(0, 0);
      return;
    }
    if (!admin) {
      if (delivery.end + new Date(delivery.date).valueOf() - new Date().valueOf() < DAY) {
      alert('Deliveries must be scheduled 24 hours in advance.');
      return;
      }
      const day = weekdays[new Date(delivery.date).getUTCDay()];
      if (!times[day].active) {
        alert(`Deliveries cannot be scheduled on ${day}s`);
        window.scrollTo(0, 0);
        return;
      }
      if (delivery.start < times[day].start || delivery.end > times[day].end) {
        console.log(delivery.end);
        console.log(times[day].end);
        alert(`Deliveries on ${day}s must be between ${toTimeString(times[day].start)} and ${toTimeString(times[day].end)}.`);
        window.scrollTo(0, 0);
        return;
      }
    }
    delivery.start = new Date(delivery.date).valueOf() + delivery.start + new Date(delivery.date).getTimezoneOffset()*MIN;
    delivery.end = new Date(delivery.date).valueOf() + delivery.end + new Date(delivery.date).getTimezoneOffset()*MIN;

    delivery.approved = false;
    delivery.duration = undefined;
    delivery.date = undefined;
    setDelivery({});
    window.location.reload();
    db.post('delivery', delivery).then(() => {
      alert('Your delivery has been saved.');
    });
  }

  useEffect(() => {
    db.get('time').then(x => setTimes(x.data));
    db.get('gate').then(x => setGates(x.data));
    db.get('company').then(x => setCompanies(x.data));
  }, []);
  
  return (
    <form id='deliveryForm' onSubmit={submitForm}>
      <h2>Required Fields</h2>
      <div className="table">
        <div className="table-row">
          <p className="table-cell"> Date:</p>
          <input className='table-cell' type='date' value={delivery.date || ''} onChange={x => handleChange(x.target.value, 'date')} required />
        </div> 
        <div className="table-row">
          <p className='table-cell'>Time:</p>
          <input className='table-cell' type='time' value={delivery.start || ''} onChange={x => handleChange(x.target.value, 'start')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Duration:</p>
          <select className='table-cell' onChange={x => handleChange(x.target.value, 'duration')} required>
            <option selected value={30}>0.5 hours</option>
            {durations.map(len => <option value={len}>{len / 60.0} hours</option>)}
          </select>
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
            <option value="" key='default' disabled selected>Choose gate</option>
            {gates.map(gate => <option  key={gate.name} value={gate.name}>{gate.name}</option>)}
          </select>
        </div>
        <div className='table-row'>
          <p className='table-cell'>Number of Trucks:</p>
          <input type='number' value={delivery.trucks || ''} onChange={x => handleChange(x.target.value, 'trucks')} required/>
        </div>
        <div className="table-row">
          <p className='table-cell'>Drop-off Location:</p>
          <input className='table-cell' type='text' value={delivery.location || ''} onChange={x => handleChange(x.target.value, 'location')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Contact Name:</p>
          <input className='table-cell' type='text' value={delivery.contactName || ''} onChange={x => handleChange(x.target.value, 'contactName')} required />
        </div>
        <div className="table-row">
          <p className='table-cell'>Contact Number:</p>
          <input className='table-cell' type='tel' value={delivery.contactNumber || ''} onChange={x => handleChange(x.target.value, 'contactNumber')} required />
        </div>
      </div>
      <h2>Optional Fields</h2>
      <div className="table-row">
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
          <p className='table-cell'>Extra Notes</p>
          <textarea value={delivery.notes || ''} onChange={x => handleChange(x.target.value, 'notes')} />
        </div>
      </div>
      <input type="submit" value="Submit Delivery" />
    </form>
  )
}
export default Form;