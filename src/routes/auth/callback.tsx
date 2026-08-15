import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { neon } from "../../lib/neon";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We received a callback. The neon client handles neon_auth_session_verifier automatically
    // when we call a method like getSession() or just initialize it on the page.
    // Let's call getSession() to force it to exchange the verifier.
    
    neon.auth.getSession().then(({ data, error }) => {
      // DEBUG LOG OUTPUT
      setError(`Session Data: ${JSON.stringify(data)}, Cookies: ${document.cookie}`);
    }).catch(err => {
      setError("Error getting session: " + err.message);
    });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white shadow rounded-lg max-w-md w-full text-center">
        {error ? (
          <div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate({ to: "/my-wise" })}
              className="mt-4 px-4 py-2 bg-navy text-white rounded-[3px] text-sm"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-navy mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Signing you in...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we verify your credentials.</p>
          </div>
        )}
      </div>
    </div>
  );
}
