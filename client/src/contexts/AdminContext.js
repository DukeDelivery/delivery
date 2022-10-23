import { createContext } from "react";
const AdminContext = createContext({
  admin: false,
  setAdmin: () => {},
});
export default AdminContext;