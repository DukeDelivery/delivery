import { createContext } from "react";
const EventsContext = createContext({
  events: [],
  setEvents: () => {},
})
export default EventsContext;