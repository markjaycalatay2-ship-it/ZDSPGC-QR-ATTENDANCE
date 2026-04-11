interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  purple: "bg-purple-50 border-purple-200",
  orange: "bg-orange-50 border-orange-200",
};

const valueColorClasses = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
};

export function StatCard({ title, value, icon, color = "blue" }: StatCardProps) {
  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${valueColorClasses[color]}`}>{value}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
