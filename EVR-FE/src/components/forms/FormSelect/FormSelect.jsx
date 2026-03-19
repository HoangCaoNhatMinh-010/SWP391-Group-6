import { useState } from 'react';
import { getValidationError } from '@utils/validation';

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  helperText,
  rules,
  onBlur,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleBlur = (e) => {
    setTouched(true);
    if (rules) {
      const validationError = getValidationError(label || name, value, rules);
      setLocalError(validationError);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    if (touched && rules) {
      const validationError = getValidationError(label || name, e.target.value, rules);
      setLocalError(validationError);
    }
    onChange(e);
  };

  const displayError = error || (touched && localError);

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <select
        className={`form-select ${displayError ? 'is-invalid' : ''} ${touched && !displayError && value ? 'is-valid' : ''}`}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value || option.id || option}
            value={option.value || option.id || option}
          >
            {option.label || option.name || option}
          </option>
        ))}
      </select>
      {displayError && (
        <div className="invalid-feedback d-block">
          {displayError}
        </div>
      )}
      {helperText && !displayError && (
        <div className="form-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FormSelect;

