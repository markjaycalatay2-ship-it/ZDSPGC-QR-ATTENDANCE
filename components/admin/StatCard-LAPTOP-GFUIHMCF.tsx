interface StatCardProps {
  title: string;
  value: string | number;
  icon: "users" | "staff" | "events" | "attendance";
  color: "blue" | "green" | "purple" | "orange" | "pink" | "cyan";
  trend?: string;
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
  green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
  purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
  orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
  pink: "from-pink-500 to-pink-600 shadow-pink-500/25",
  cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/25",
};

const iconPaths = {
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  staff: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  attendance: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
};

export function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Background gradient blob */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${colorClasses[color]} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trend}
            </p>
          )}
        </div>
        
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon]} />
          </svg>
        </div>
      </div>
      
      {/* Progress bar decoration */}
      <div className="mt-4 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${colorClasses[color]}`} />
      </div>
    </div>
  );
}
