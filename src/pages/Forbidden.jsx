import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <FaLock className="text-red-600 text-9xl mb-6" />
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Forbidden</h2>
      <p className="text-gray-700 mb-4">You do not have permission to access this page.</p>
      <div className="space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">Go to Login</Link>
        <Link to="/register" className="text-blue-600 hover:underline">Go to Register</Link>
      </div>
    </div>
  );
}
