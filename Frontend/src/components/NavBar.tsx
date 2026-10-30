import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { logoutUser } from "../api/user.api";
import { logout } from "../store/slice/authSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getErrorMessage } from "../utils/helper";

export default function Navbar() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      await logoutUser();
      dispatch(logout());
      queryClient.clear();
      await navigate({ to: "/" });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <nav aria-label="Main navigation" className="site-nav">
      <div className="nav-inner">
        <Link to="/" className="wordmark" aria-label="URL Shortener home">
          URL Shortener
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-blue-600">
                Dashboard
              </Link>
              <span className="text-gray-700">{user?.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Logout"}
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-login">
              Sign in ↗
            </Link>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="px-4 py-2 text-red-700">
          {error}
        </p>
      )}
    </nav>
  );
}
