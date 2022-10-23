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
      <table style={{marginLeft: 'auto', marginRight: 'auto'}}>
        <tbody>
          <tr>
            <td>new username:</td>
            <td><input type='text' value={admin.username || ''} onChange={x => setAdmin({...admin, username: x.target.value})} required/></td>
          </tr>
          <tr>
            <td>new password:</td>
            <td><input type='text' value={admin.password || ''} onChange={x => setAdmin({...admin, password: x.target.value})} required/></td>
          </tr>
          <tr>
            <td>new phone number:</td>
            <td><input type='tel' value={admin.number || ''} onChange={x => setAdmin({...admin, number: x.target.value})} required/></td>
          </tr>
        </tbody>
      </table>
      <input type='submit' value='update information' />
    </form>
  )
}
export default AdminSetter;