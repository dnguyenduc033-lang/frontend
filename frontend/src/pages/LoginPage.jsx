import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [failCount, setFailCount] = useState(() => {
    return parseInt(sessionStorage.getItem("loginFailCount") || "0", 10);
  });
  const [lockUntil, setLockUntil] = useState(() => {
    return parseInt(sessionStorage.getItem("loginLockUntil") || "0", 10);
  });
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Countdown timer khi đang bị khóa
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        setCountdown(0);
        setFailCount(0);
        setLockUntil(0);
        sessionStorage.removeItem("loginFailCount");
        sessionStorage.removeItem("loginLockUntil");
        showMessage("Bạn có thể thử đăng nhập lại.", "success");
        clearInterval(timerRef.current);
      }
    };

    if (lockUntil > Date.now()) {
      updateCountdown();
      timerRef.current = setInterval(updateCountdown, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [lockUntil]);

  const isLocked = countdown > 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      const loginData = { email, password };
      const res = await ApiService.loginUser(loginData);

      if (res.status === 200) {
        // Đăng nhập thành công → reset bộ đếm
        setFailCount(0);
        setLockUntil(0);
        sessionStorage.removeItem("loginFailCount");
        sessionStorage.removeItem("loginLockUntil");

        ApiService.saveToken(res.token);
        ApiService.saveRole(res.role);
        showMessage(res.message, "success");
        navigate("/dashboard");
      }
    } catch (error) {
      const newCount = failCount + 1;
      setFailCount(newCount);
      sessionStorage.setItem("loginFailCount", newCount);

      if (newCount >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockUntil(until);
        sessionStorage.setItem("loginLockUntil", until);
        showMessage(
          `Bạn đã nhập sai ${MAX_ATTEMPTS} lần. Form bị khóa ${LOCKOUT_SECONDS} giây.`,
          "error"
        );
      } else {
        const remaining = MAX_ATTEMPTS - newCount;
        showMessage(
          (error.response?.data?.message || "Email hoặc mật khẩu không đúng.") +
            ` (còn ${remaining} lần thử)`,
          "error"
        );
      }
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    if (type !== "error" || !isLocked) {
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const messageStyle = {
    success: "bg-[#d4edda] text-[#155724]",
    error: "bg-[#f8d7da] text-[#721c24]",
    info: "bg-[#d1ecf1] text-[#0c5460]",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-400 p-5">
      <div className="bg-white p-6 md:p-10 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] w-full max-w-[400px]">
        <h2 className="text-center text-[#2F4F4F] text-3xl font-bold mb-8">Đăng nhập</h2>

        {message.text && (
          <p className={`${messageStyle[message.type]} p-2.5 rounded-md text-center mb-5 text-sm`}>
            {message.text}
          </p>
        )}

        {/* Thanh countdown khi bị khóa */}
        {isLocked && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="font-medium text-red-600">Form bị khóa</span>
              <span className="font-semibold text-red-600">{countdown}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / LOCKOUT_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className={`p-3 border rounded-md text-base w-full box-border outline-none transition-all duration-300
              ${isLocked
                ? "border-red-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                : "border-[#ccc] hover:border-[#008080] hover:shadow-[0_0_8px_rgba(0,128,128,0.2)] focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
              }`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLocked}
          />

          <div className="relative w-full">
            <input
              className={`p-3 pr-10 border rounded-md text-base w-full box-border outline-none transition-all duration-300
                ${isLocked
                  ? "border-red-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-[#ccc] hover:border-[#008080] hover:shadow-[0_0_8px_rgba(0,128,128,0.2)] focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                }`}
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLocked}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#008080] focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLocked}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>

          <button
            className={`p-3 text-white border-none rounded-md text-lg font-semibold transition-colors duration-300 mt-2
              ${isLocked
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#008080] cursor-pointer hover:bg-[#2F4F4F]"
              }`}
            type="submit"
            disabled={isLocked}
          >
            {isLocked ? `Chờ ${countdown}s...` : "Đăng nhập"}
          </button>
        </form>

        {/* Chỉ báo số lần thử còn lại */}
        {!isLocked && failCount > 0 && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Số lần thử còn lại:{" "}
            <span className="font-semibold text-orange-500">{MAX_ATTEMPTS - failCount}</span>
            /{MAX_ATTEMPTS}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;