import './ProgressBar.css';

export default function ProgressBar(props){
  const mainColor = props.color ?? '#0299fd';

  return (
    <div
      className='ProgressBar'
    >
      <div
        className='ProgressBar-background'
        style={{
        }}
      ></div>
      <div
        className='ProgressBar-progress'
        style={{
          background: mainColor,
          width: `${props.progress}%`
        }}
      ></div>
      <div className='ProgressBar-percent'>
        {`${props.progress}%`}
      </div>
    </div>
  )
}