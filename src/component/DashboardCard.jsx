// src/component/DashboardCard.jsx
import PropTypes from 'prop-types';

export default function DashboardCard({ 
  title, 
  count, 
  icon, 
  color = "blue", 
  trend = null,
  description = null 
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-500",
      light: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    green: {
      bg: "bg-green-500",
      light: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    purple: {
      bg: "bg-purple-500",
      light: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200"
    },
    orange: {
      bg: "bg-orange-500",
      light: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200"
    },
    red: {
      bg: "bg-red-500",
      light: "bg-red-50",
      text: "text-red-600",
      border: "border-red-200"
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${currentColor.light} ${currentColor.border} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`${currentColor.bg} p-2 rounded-lg`}>
              <div className="text-white text-xl">
                {icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {count.toLocaleString()}
            </span>
            
            {trend && (
              <span className={`text-sm font-medium flex items-center gap-1 ${
                trend.type === 'up' ? 'text-green-600' : 
                trend.type === 'down' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {trend.type === 'up' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                )}
                {trend.type === 'down' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                  </svg>
                )}
                {trend.value}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-500 mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'red']),
  trend: PropTypes.shape({
    type: PropTypes.oneOf(['up', 'down', 'neutral']),
    value: PropTypes.string
  }),
  description: PropTypes.string
};