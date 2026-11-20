import { useState, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username/employee ID and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await login(username.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || "Invalid User Name and Password");
    }
  };


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden" id="login-page">
      {/* Nature bokeh blurred background matching Screenshot 1 */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 25%, rgba(134, 239, 172, 0.45) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.6) 0%, rgba(6, 78, 59, 0.95) 100%),
            linear-gradient(135deg, #064e3b 0%, #022c22 100%)
          `
        }}
      >
        {/* Soft floating bokeh circles */}
        <div className="absolute w-72 h-72 rounded-full bg-emerald-300/20 blur-2xl top-10 left-10 pointer-events-none"></div>
        <div className="absolute w-96 h-96 rounded-full bg-yellow-200/15 blur-3xl bottom-10 right-20 pointer-events-none"></div>
        <div className="absolute w-60 h-60 rounded-full bg-teal-200/20 blur-xl top-1/2 left-2/3 pointer-events-none"></div>
      </div>

      {/* Centered White Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-white/40 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-250">
        {/* CIWMCPL Swirl Emblem matching Screenshot 1 */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 shadow-xs p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer teal/blue swirl */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0284c7"
                strokeWidth="7"
                strokeDasharray="160 80"
                strokeLinecap="round"
                transform="rotate(-20 50 50)"
              />
              {/* Middle green swirl */}
              <circle
                cx="50"
                cy="50"
                r="26"
                fill="none"
                stroke="#10b981"
                strokeWidth="7"
                strokeDasharray="110 50"
                strokeLinecap="round"
                transform="rotate(65 50 50)"
              />
              {/* Inner orange/gold swirl */}
              <circle
                cx="50"
                cy="50"
                r="14"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeDasharray="60 30"
                strokeLinecap="round"
                transform="rotate(160 50 50)"
              />
            </svg>
          </div>

          <h1 className="text-sm font-extrabold text-[#00675b] tracking-wider uppercase leading-snug">
            CCMC SWM WASTE TRUCK MONITORING
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Role-Based Terminal & Central Operations
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="common-login-form">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username or Employee ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Your Username or employee id here..."
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#00675b] focus:ring-2 focus:ring-[#00675b]/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                id="input-username"
                autoComplete="username"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password here..."
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#00675b] focus:ring-2 focus:ring-[#00675b]/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                id="input-password"
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg bg-[#00675b] hover:bg-[#005249] active:bg-[#00423a] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70"
            id="btn-sign-in"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with MSSQL...</span>
              </>
            ) : (
              <span>SIGN IN</span>
            )}
          </button>

          {/* Error Message Area matching Screenshot 1 */}
          {errorMessage && (
            <div
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in"
              id="login-error-message"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>



        {/* Footer Branding matching Screenshot 1 */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Powered by <strong className="text-slate-900 font-semibold">Netpaze Solutions</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
