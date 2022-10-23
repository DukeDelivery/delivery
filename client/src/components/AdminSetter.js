import { useState } from "react";
import db from '../utils/request';
const AdminSetter = ({}) => {
  const [admin, setAdmin] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    db.post('admin', admin);
    alert('admin information updated');
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="table">
        <div className='table-row'>
          <p className='table-cell'>new username:</p>
          <input className='table-cell' type='text' value={admin.username || ''} onChange={x => setAdmin({...admin, username: x.target.value})} required/>
        </div>
        <div className='table-row'>
          <p className='table-cell'>new password:</p>
          <input className='table-cell' type='text' value={admin.password || ''} onChange={x => setAdmin({...admin, password: x.target.value})} required/>
        </div>
        <div className='table-row'>
          <p className='table-cell'>new phone number:</p>
          <input className='table-cell' type='tel' value={admin.number || ''} onChange={x => setAdmin({...admin, number: x.target.value})} required/>
        </div>
      </div>
      <input type='submit' value='update information' />
    </form>
  )
}
export default AdminSetter;