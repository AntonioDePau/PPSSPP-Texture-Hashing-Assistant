import { useRef } from 'react';
import Button from './Button';

export default function FileSelector(props){
  const inputRef = useRef(null);

  const handleClick = (event) => {
    inputRef.current.click();
  }

  const handleChange = (event) => {
    const files = Array.from(event.target.files);
    props.onChange(files);
    event.target.value = null;
  }

  return (
    <div>
      <label>
        <input
          type="file"
          style={{display: 'none'}}
          ref={inputRef}
          webkitdirectory={props.directory === true ? 'true' : null}
          directory={props.directory === true ? 'true' : null}
          multiple={props.multiple ?? null}
          title="empty"
          placeholder='empty'
          onChange={handleChange}
        />
      </label>
      <Button onClick={handleClick}>{props.text ?? `Select file(s)`}</Button>
    </div>
  )
}