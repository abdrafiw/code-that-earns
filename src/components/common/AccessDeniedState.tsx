type AccessDeniedStateProps = {
  message: string;
};

export const AccessDeniedState = ({ message }: AccessDeniedStateProps) => {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-yellow-800">Access denied: {message}</p>
    </div>
  );
};
