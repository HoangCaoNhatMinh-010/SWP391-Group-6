import { useState } from 'react';
import { getValidationError } from '@utils/validation';

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  rows = 4,
  maxLength,
  showCharCount = false,
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
  const charCount = value ? value.length : 0;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <textarea
        className={`form-control ${displayError ? 'is-invalid' : ''} ${touched && !displayError && value ? 'is-valid' : ''}`}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />
      {showCharCount && maxLength && (
        <div className="form-text text-end">
          {charCount} / {maxLength} characters
        </div>
      )}
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

export default FormTextarea;

