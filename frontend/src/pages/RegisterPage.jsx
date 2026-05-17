import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const registerData = { name, email, password, phoneNumber };
      await ApiService.registerUser(registerData);
      setMessage("Registration Successfull");
      navigate("/login");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Registering a User: " + error
      );
      console.log(error);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f7f6] p-5">
      <div className="bg-white p-10 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] w-full max-w-[450px]">
        <h2 className="text-center text-[#2F4F4F] text-3xl font-bold mb-8">Register</h2>

        {message && (
          <p className="bg-[#d4edda] text-[#155724] p-2.5 rounded-md text-center mb-5 text-sm border border-[#c3e6cb]">
            {message}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="p-3 border border-[#ccc] rounded-md text-base w-full box-border focus:border-[#008080] outline-none transition-all"
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />

          <button 
            className="p-3 bg-[#008080] text-white border-none rounded-md cursor-pointer text-lg font-semibold transition-colors duration-300 hover:bg-[#2F4F4F] mt-2"
            type="submit"
          >
            Register
          </button>
        </form>
        
        <p className="text-center mt-6 text-[#666]">
          Already have an account?{" "}
          <a href="/login" className="text-[#008080] font-bold no-underline hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;