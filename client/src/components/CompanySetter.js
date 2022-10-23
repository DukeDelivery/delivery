import { useState, useEffect } from 'react';
import db from '../utils/request'
const CompanySetter = () => {
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    const company = {name: name};
    db.post('company', company);
    setCompanies([...companies, company]);
    setName('');
  }
  useEffect(() => {
    db.get('company')
      .then(x => setCompanies(x.data));
  },[]);
  return (
    <>
      <div className='table'>
        {companies.map(company => <Company company={company} setCompanies={setCompanies} />)}
      </div>
      <form onSubmit={handleSubmit}>
        <input type='text' value={name} onChange={x => setName(x.target.value)} required/>
        <input type='submit' value='Submit'/>
      </form>
    </>
  )
}

const Company = ({ company, setCompanies }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  const handleContactSubmit = () => {
    const c = {
      ...company,
      contacts: [...company.contacts, {name: name, number: number}],
    }
    db.update('company', c);
    setCompanies(companies => companies.map(comp => comp.id === c.id ? c : comp));
    setName('');
    setNumber('');
  }
  const handleContactDelete = (name, number) => {
    const c = {
      ...company,
      contacts: company.contacts.filter(contact => contact.name !== name || contact.number !== number),
    }
    db.update('company', c);
    setCompanies(companies => companies.map(comp => comp.id === c.id ? c : comp));
    setName('');
    setNumber('');
  }
  const handleDelete = () => {
    db.remove('company', company.id);
    setCompanies(companies => companies.filter(x => x.id !== company.id));
  }
  return (
    <>
      <div className='table-row'>
        <p className='table-cell'>{company.name}</p>
        <div className='table-cell'><button onClick={() => setOpen(open => !open)}>{!open ? <>View Contacts</>:<>Hide Contacts</>}</button></div>
        <div className='table-cell'><button onClick={() => handleDelete(company.id)}>Delete</button></div>
      </div>
      {open && 
        <>
          <div className='table-row'>
            <p className='table-cell'>Name:</p>
            <p className='table-cell'>Number:</p>
            <p className='table-cell'>Delete:</p>
          </div>
          {company.contacts.map(contact => {
            return (
              <div className='table-row'>
                <p className='table-cell'>{contact.name}</p>
                <p className='table-cell'>{contact.number}</p>
                <button className='table-cell' onClick={() => handleContactDelete(contact.name, contact.number)}>Delete Contact</button>
              </div>
            )
          })}
          <form className='table-row' onSubmit={handleContactSubmit}>
            <div className='table-cell'><input type='text' placeholder='Contact Name' value={name} onChange={x => setName(x.target.value)}/></div>
            <div className='table-cell'><input type='text' placeholder='Contact Number' value={number} onChange={x => setNumber(x.target.value)}/></div>
            <div className='table-cell'><input type='submit' value="Add Contact" /></div>
          </form>
        </>
      }
    </>
  )
}
export default CompanySetter;