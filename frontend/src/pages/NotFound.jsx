import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-600">404</h1>
      <p className="text-lg text-gray-700 mt-2">Page Not Found</p>
      <Link
        to="/"
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
      >
        Go Back Home
      </Link>
    </div>
  );
}
