type PageErrorStateProps = {
  message: string;
};

export const PageErrorState = ({ message }: PageErrorStateProps) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-red-600">Error: {message}</p>
    </div>
  );
};
