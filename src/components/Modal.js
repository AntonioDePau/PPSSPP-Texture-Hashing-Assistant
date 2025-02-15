import './Modal.css';
import ErrorIcon from './ErrorIcon';

export default function Modal(props){
  const closeModal = () => {
    props.setContent(null);
  }

  return (
    <div className={`Modal ${props.data.isError ? 'error' : ''}`}>
      <div className="Modal-container">
        <div className='Modal-container-header'>
          <span className='Modal-icon'>
            {props.data.isError && <ErrorIcon />}
          </span>
          <span className='Modal-container-title'>
            <span>{props.data.title}</span>
            <div className='Modal-close-button' onClick={closeModal}>X</div>
          </span>
        </div>
        <div className='Modal-container-body'>
          {props.data.body}
        </div>
      </div>
    </div>
  )
}