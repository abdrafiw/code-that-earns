type PageEmptyStateProps = {
  title: string;
  description: string;
};

export const PageEmptyState = ({ title, description }: PageEmptyStateProps) => {
  return (
    <div className="p-8 text-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};
