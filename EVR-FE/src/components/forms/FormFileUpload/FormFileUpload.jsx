import { useState } from 'react';
import { validateFile } from '@utils/validation';

const FormFileUpload = ({
  label,
  name,
  onChange,
  accept,
  multiple = false,
  required = false,
  error,
  helperText,
  maxSize,
  allowedTypes = [],
  ...props
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileError(null);

    if (files.length === 0) {
      setSelectedFiles([]);
      onChange({ target: { name, value: null, files: [] } });
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of files) {
      const validation = validateFile(file, { maxSize, allowedTypes });
      if (validation.valid) {
        validFiles.push(file);
      } else {
        setFileError(validation.message || 'Invalid file');
        break;
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      const event = {
        target: {
          name,
          value: multiple ? validFiles : validFiles[0],
          files: validFiles,
        },
      };
      onChange(event);
    }
  };

  const displayError = error || fileError;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        type="file"
        className={`form-control ${displayError ? 'is-invalid' : ''}`}
        id={name}
        name={name}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        required={required}
        {...props}
      />
      {selectedFiles.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            Selected: {selectedFiles.map((f) => f.name).join(', ')}
          </small>
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

export default FormFileUpload;

