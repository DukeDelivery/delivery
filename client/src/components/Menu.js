import { Tab, Tabs } from '@mui/material';
import  AdminContext  from '../contexts/AdminContext';
import { useContext } from 'react';

const Menu = ({ current, setCurrent}) => {
  
  const handleChange = (event, value) => {
    setCurrent(value);
  }
  const { admin } = useContext(AdminContext);
  return (
    <Tabs value={current} onChange={handleChange} variant="fullWidth">
      <Tab label="Delivery Calendar" value="calendar"  />
      <Tab label="Map" value="map" />
      <Tab label="Schedule Delivery" value="form"/>
      {admin && <Tab label="Settings" value="settings"/>}
      {admin && <Tab label="Log Rogue Delivery" value='rogue'/>}
    </Tabs>
  )
}

export default Menu;