import { useState, useEffect } from 'react';
import db from '../utils/request'
const CompanySetter = ({}) => {
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    const company = {name: name};
    db.post('company', company);
    setCompanies([...companies, company]);
    setName('');
  }
  const handleDelete = (id) => {
    db.remove('gate', id);
    setCompanies(gates => gates.filter(gate => gate.id !== id ? gate:  null));
  }
  useEffect(() => {
    db.get('company')
      .then(x => setCompanies(x.data));
  },[]);
  return (
    <>
      <ul>
        {companies.map(company => {
          return (
            <li key={company.id}>
              {company.name}
              <button onClick={() => handleDelete(company.id)}>Delete</button>
            </li> 
          )
        })}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type='text' value={name} onChange={x => setName(x.target.value)} required/>
        <input type='submit' value='Submit'/>
      </form>
    </>
  )
}
export default CompanySetter;