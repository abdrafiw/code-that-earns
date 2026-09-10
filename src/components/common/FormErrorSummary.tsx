type FormErrorSummaryProps<T extends object> = {
  errors: Partial<Record<keyof T, string>>;
};

export function FormErrorSummary<T extends object>({
  errors,
}: FormErrorSummaryProps<T>) {
  const messages = [
    ...new Set(
      Object.values(errors as Record<string, string | undefined>).filter(
        (message): message is string => Boolean(message),
      ),
    ),
  ];
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 p-3"
    >
      <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
