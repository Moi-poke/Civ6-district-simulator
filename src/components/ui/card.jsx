export function Card({ className = "", children, ...props }) {
  return <div className={`rounded-xl border ${className}`} {...props}>{children}</div>;
}
export function CardHeader({ className = "", children, ...props }) {
  return <div className={`p-4 border-b border-slate-700 ${className}`} {...props}>{children}</div>;
}
export function CardTitle({ className = "", children, ...props }) {
  return <h3 className={`text-lg font-bold ${className}`} {...props}>{children}</h3>;
}
export function CardContent({ className = "", children, ...props }) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
}
