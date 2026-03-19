const SuccessMessage = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-success alert-dismissible fade show ${className}`} role="alert">
      {message}
      {onDismiss && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default SuccessMessage;

