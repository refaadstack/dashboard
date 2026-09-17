import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function DashboardCard({ title, count, icon, description = null, to = null, loading = false }) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-600 p-2 text-white">{icon}</div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className="mt-3">
        {count === null || count === undefined ? (
          loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" aria-label="Memuat" />
          ) : null
        ) : (
          <span className="text-3xl font-bold tabular-nums text-gray-900">
            {Number(count).toLocaleString("id-ID")}
          </span>
        )}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
    </>
  );

  const cls =
    "block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md";
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  icon: PropTypes.node.isRequired,
  description: PropTypes.string,
  to: PropTypes.string,
  loading: PropTypes.bool,
};
