const InputField = (props) => {
    return (
        <span className="form-element">
            <label className="tag" htmlFor={props.label}>{props.label}</label>
            <input value={props.value} id={props.label} type={props.type} onInput={props.onInput}></input>
        </span>
    )
}

export default InputField