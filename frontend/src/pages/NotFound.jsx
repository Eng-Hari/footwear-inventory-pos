
import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10 max-w-md w-full text-center">

        {/* ICON */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
          <ExclamationTriangleIcon className="w-7 h-7 text-white" />
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          404
        </h1>

        {/* MESSAGE */}
        <p className="text-sm text-gray-400 mt-1">
          Page not found
        </p>

        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          The page you're looking for doesn’t exist or may have been moved.
        </p>

        {/* ACTION BUTTON */}
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium
            bg-blue-50 text-blue-700 border-blue-200
            hover:bg-blue-600 hover:text-white hover:border-blue-600
            transition-all duration-150"
        >
          Go Back Home
        </Link>

      </div>
    </div>
  );
}