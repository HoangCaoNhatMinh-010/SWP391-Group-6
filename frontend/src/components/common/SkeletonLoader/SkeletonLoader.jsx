const SkeletonLoader = ({ type = 'text', lines = 1, className = '' }) => {
  if (type === 'card') {
    return (
      <div className={`card ${className}`}>
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-7 placeholder-lg"></span>
            <span className="placeholder col-4 placeholder-lg"></span>
            <span className="placeholder col-4 placeholder-lg"></span>
            <span className="placeholder col-6 placeholder-lg"></span>
            <span className="placeholder col-8 placeholder-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`table-responsive ${className}`}>
        <table className="table">
          <thead>
            <tr>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i}>
                  <span className="placeholder col-6"></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5].map((col) => (
                  <td key={col}>
                    <span className="placeholder col-8"></span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className={`placeholder ${index === lines - 1 ? 'col-6' : 'col-12'} ${index < lines - 1 ? 'mb-2' : ''}`}
        ></span>
      ))}
    </div>
  );
};

export default SkeletonLoader;

