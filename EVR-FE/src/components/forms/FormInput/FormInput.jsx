import { useState } from 'react';
import { getValidationError } from '@utils/validation';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon,
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
      <div className="input-group">
        {icon && (
          <span className="input-group-text">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={`form-control ${displayError ? 'is-invalid' : ''} ${touched && !displayError && value ? 'is-valid' : ''}`}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      </div>
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

export default FormInput;

