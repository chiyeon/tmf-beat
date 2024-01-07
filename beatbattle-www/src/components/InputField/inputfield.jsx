import "./inputfield.css"

const InputField = (props) => {
    return (
        <span className={"form-element"}>
            <label className="tag" htmlFor={props.label}>{props.label}</label>
            {props.type == "textarea"
               ? <textarea value={props.value} id={props.label} onInput={props.onInput}></textarea>
               : <input value={props.value} id={props.label} type={props.type} onInput={props.onInput}></input>}
        </span>
    )
}

export default InputField
