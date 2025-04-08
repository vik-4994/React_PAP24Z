export const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

export const CardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-4 ${className}`}>{children}</div>;
