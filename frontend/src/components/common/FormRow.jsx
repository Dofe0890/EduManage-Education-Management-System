import React from "react";

const FormRow = ({
  type,
  name,
  labelText,
  defaultValue = "",
  placeHolder = "",
  onChange = () => {},
}) => {
  return (
    <div className="form-row">
      <label htmlFor={name} className="form-label">
        {labelText || name}
      </label>
      <input
        onChange={onChange}
        required
        defaultValue={defaultValue}
        className="form-input"
        name={name}
        id={name}
        type={type}
        placeholder={placeHolder}
      />
    </div>
  );
};

export default FormRow;
