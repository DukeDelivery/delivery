import { useState, useEffect } from "react";
import db from '../utils/request';
const GateSetter = ({}) => {
  const [gates, setGates] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    db.get('gate')
      .then(x => setGates(x.data));
  },[]);

  const handleGateSubmit = (e) => {
    e.preventDefault();
    const gate = {name: name};
    db.post('gate', gate);
    setGates([...gates, gate]);
    setName('');
  }
  const handleGateDelete = (id) => {
    console.log(id);
    db.remove('gate', id);
    setGates(gates => gates.filter(gate => gate.id !== id ? gate:  null));
    
  }
  return (
    <>
      <div className="table">
        {gates.map(gate => {
          return (
            <div className="table-row">
              <p className='table-cell'>{gate.name}</p>
              <button className='table-cell' onClick={() => handleGateDelete(gate.id)}>Delete</button>
            </div> 
          )
        })}
      </div>
      <form onSubmit={handleGateSubmit}>
        <input type='text' value={name} onChange={x => setName(x.target.value)} required/>
        <input type='submit' value='Submit'/>
      </form>
    </>
  )
}
export default GateSetter;