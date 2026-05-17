import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({children}) =>{
    return(
        <div className="flex overflow-hidden transition-all duration-300 ease-in-out">
            <Sidebar/>
            <div className="ml-[12%] flex-grow p-5 transition-all duration-300 ease-in-out">
                {children}
            </div>
        </div>
    );
}

export default Layout;