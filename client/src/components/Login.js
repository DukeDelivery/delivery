import Popup from "reactjs-popup";
import { useState, useContext } from "react";
import db from "../utils/request";
import AdminContext from "../contexts/AdminContext";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const { setAdmin } = useContext(AdminContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    db.post('login', {username: username, password: password})
      .then(res => {
        if (res.data === 'valid') setAdmin(true);
        else {
          setUsername("");
          setPassword("");
          alert('incorrect username or password');
        }
      });
    setOpen(false);
  }
  
  return (
    <div>
      <h3 id="adminLogin" onClick={() => setOpen(true)}>Admin Login</h3>
      <Popup
      modal
      nested
      open={open}
      onClose={() => setOpen(false)}
      >
        <button onClick={() => setOpen(false)} >&times;</button>
        <form onSubmit={handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>Username:</td>
                <td><input label="Username" type="text" value={username} onChange={x => setUsername(x.target.value)} required/></td>
              </tr>
              <tr>
                <td>Password:</td>
                <td><input label="Password" type="text" value={password} onChange={x => setPassword(x.target.value)} required/></td>
              </tr>
            </tbody>
          </table>
          <input type="submit" label="login" />
        </form>
      </Popup>
    </div>
  )
}

export default Login;