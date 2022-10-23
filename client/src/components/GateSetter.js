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
      <ul>
        {gates.map(gate => {
          return (
            <li key={gate.name}>
              {gate.name}
              <button onClick={() => handleGateDelete(gate.id)}>Delete</button>
            </li> 
          )
        })}
      </ul>
      <form onSubmit={handleGateSubmit}>
        <input type='text' value={name} onChange={x => setName(x.target.value)} required/>
        <input type='submit' value='Submit'/>
      </form>
    </>
  )
}
export default GateSetter;