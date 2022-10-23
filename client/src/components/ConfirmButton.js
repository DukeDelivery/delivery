import Popup from 'reactjs-popup'

const ConfirmButton = ({ text, action, confirmText }) => {
  return (
    <Popup
      trigger={<button className="button">{text}</button>}
      position="top center"
      nested
    >
      {close => (<span>
        {confirmText}<br/>
        <button onClick={action}>yes</button>
        <button onClick={close}>no</button>
      </span>)}
    </Popup>
  )
}

export default ConfirmButton;