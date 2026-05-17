import React from "react";
import { Link } from "react-router-dom";
import ApiService from "../service/ApiService";

const logout = () => {
  ApiService.logout();
};

const Sidebar = () => {
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();

  return (
    <div className="fixed w-[13%] h-screen bg-gradient-to-br from-[#1c1e21] to-[#3a3f44] text-[#f1f1f1] flex flex-col justify-between py-[30px] px-0 shadow-[5px_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 ease md:w-[220px]">
      <h1 className="ml-[20%] text-[#008080] p-0 mb-0 font-[900] text-3xl md:text-[1.5rem]">IMS</h1>
      <ul className="list-none p-0 m-0">
        {isAuth && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/dashboard" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Dashboaard</Link>
          </li>
        )}

        {isAuth && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/transaction" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Transactions</Link>
          </li>
        )}

        {isAdmin && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/category" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Category</Link>
          </li>
        )}

        {isAdmin && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/product" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Product</Link>
          </li>
        )}

        {isAdmin && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/supplier" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Supplier</Link>
          </li>
        )}

        {isAuth && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/purchase" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Purchase</Link>
          </li>
        )}

        {isAuth && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/sell" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Sell</Link>
          </li>
        )}

        {isAuth && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link to="/profile" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">Profile</Link>
          </li>
        )}

        {isAuth && (
          <li className="my-[15px] mx-0 transition-transform duration-200 ease-in-out group">
            <Link onClick={logout} to="/login" className="block text-[#f1f1f1] no-underline py-2.5 px-[15px] rounded-lg bg-transparent transition-all duration-300 ease text-base font-medium tracking-[0.5px] hover:text-[#008080] group-hover:bg-[rgba(37,117,252,0.2)] md:text-[0.9rem] before:content-['→_'] before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100 group-hover:before:-ml-[10px]">
              Logout
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;