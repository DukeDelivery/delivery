import { useState, useEffect } from 'react';
import Modes from './components/Modes'
import Menu from './components/Menu'
import Login from './components/Login';
import db from './utils/request';
import AdminContext from './contexts/AdminContext';

const App = () => {
  const [admin, setAdmin] = useState(false);
  const [mode, setMode] = useState('calendar');
  const [number, setNumber] = useState('');
  useEffect(() => {
    db.get('phone').then(x => setNumber(x.data));
  }, []);

  return (
    <AdminContext.Provider value={{admin, setAdmin}}>
      <h2 id="title">
        {!admin && <>Delivery Scheduling Application</>}
        {admin && <>Delivery Scheduling Application -Admin</>}
        {!admin && <Login/>}
      </h2>
      <Menu current={mode} setCurrent={setMode}/>
      <Modes mode={mode}/>
    </AdminContext.Provider>
  )
}
export default App;