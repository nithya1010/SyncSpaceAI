const PageHeader = ({ title, description, actions }) => (
  <div className="page-header flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 className="section-title">{title}</h1>
      {description && <p className="section-sub">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)

export default PageHeader
