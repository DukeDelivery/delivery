import TimeSetter from "./TimeSetter";
import AdminSetter from "./AdminSetter";
import GateSetter from './GateSetter';
import CompanySetter from "./CompanySetter";

const Config = () => {
  return (
    <div style={{textAlign: 'center'}}>
      <h2>Gates</h2>
      <GateSetter/>
      <h2>Companies</h2>
      <CompanySetter/>
      <h2>Delivery Hours</h2>
      <TimeSetter/>
      <h2>Admin Information</h2>
      <AdminSetter/>
    </div>
  )
}
export default Config;