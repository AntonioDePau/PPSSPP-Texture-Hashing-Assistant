import './Button.css';

export default function Button(props){
  return (
    <div className={`Button ${props.type ?? ''}`} title={props.title} onClick={props.onClick}>
      {props.children}
    </div>
  )
}