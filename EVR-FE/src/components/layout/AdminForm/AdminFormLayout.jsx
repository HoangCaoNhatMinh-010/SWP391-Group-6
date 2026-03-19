import './AdminFormLayout.css';

const AdminFormLayout = ({ eyebrow, title, description, actions, children }) => (
  <div className="admin-form-page">
    <section className="admin-form-page__hero">
      <div>
        {eyebrow && <span className="admin-form-page__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-form-page__hero-actions">{actions}</div>}
    </section>

    <section className="admin-form-page__body">
      <div className="admin-form-page__card">
        {children}
      </div>
    </section>
  </div>
);

export default AdminFormLayout;


