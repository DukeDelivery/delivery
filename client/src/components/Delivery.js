import db from '../utils/request';
import ConfirmButton from './ConfirmButton';
import { useContext } from 'react';
import AdminContext from '../contexts/AdminContext';
import EventsContext from '../contexts/EventsContext';
import { toDateTimeString } from '../utils/time';

const Delivery = ( { delivery, setDelivery, setEditMode} ) => {
  const {setEvents} = useContext(EventsContext);
  const {admin} = useContext(AdminContext);

  const deleteDelivery = () => {
    db.remove('delivery', delivery.id);
    setEvents(events => events.filter(event => event.id !== delivery.id));
    setDelivery(null);
  }
  const toggleApproval = () => {
    const d = {
      ...delivery,
      approved: !delivery.approved,
    };
    setEvents(events => events.map(event => event.id === delivery.id ? d : event));
    db.update('delivery', d);
    setDelivery(null);
  }
  return (
    <div>
      Start: {toDateTimeString(delivery.start) || 'N/A'} <br/>
      End: {toDateTimeString(delivery.end) || 'N/A'}<br/>
      Company: {delivery.company || 'N/A'}<br/>
      Description: {delivery.description || 'N/A'}<br/>
      Gate: {delivery.gate || 'N/A'}<br/>
      Contact Name: {delivery.contactName || 'N/A'}<br/>
      Contact Number: {delivery.contactNumber || 'N/A'}<br/>
      Location: {delivery.location || 'N/A'}<br/>
      Scheduler Name: {delivery.schedName || 'N/A'}<br/>
      Scheduler Number: {delivery.schedNumber || 'N/A'}<br/>
      Supplier: {delivery.supplier || 'N/A'}<br/>
      Hoist Method: {delivery.hoistMethod || 'N/A'}<br/>
      Number of Trucks: {delivery.trucks || 'N/A'}<br/>
      Extra Notes: {delivery.notes || 'N/A'}<br/>
      Approved: {delivery.approved ? 'Yes':'No'}<br/>
      Completed: {delivery.completed ? 'Yes':'No'}<br/>
      {admin && <div>
        {delivery.approved ?
          <ConfirmButton 
            text='Remove Approval' action={toggleApproval}
            confirmText={'Are you sure you would like to remove approval for this delivery?'}
          /> :
          <ConfirmButton
            text = 'Approve' action={toggleApproval}
            confirmText={'Are you sure you would like to approve this delivery?'}
          />
        }
        <ConfirmButton 
          text='Delete Delivery' action={deleteDelivery}
          confirmText={'Are you sure you would like to delete delivery?'}
        />
        <button onClick={() => setEditMode(true)}>Edit Delivery</button>
      </div>}
    </div>
  );

}

export default Delivery;