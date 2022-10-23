import Schedule from './Schedule';
import Map from './Map';
import Form from './Form';
import Config from './Config';
import RogueDelivery from './RogueDelivery';

const Modes = ({ mode }) => {
  switch(mode) {
    case 'calendar':
      return <Schedule/>
    case 'map':
      return <Map/>
    case 'form':
      return <Form/>
    case 'settings':
      return <Config/>
    case 'rogue': 
      return <RogueDelivery/>
  }
}

export default Modes;