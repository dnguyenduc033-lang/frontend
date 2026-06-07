import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";

// 1. Cho phép tất cả những ai đã đăng nhập
export const ProtectedRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isAuthenticated() ? (
        Component
    ):(
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

// 2. Chỉ cho phép ADMIN
export const AdminRoute = ({element:Component}) => {
    const location = useLocation();
    return ApiService.isAdmin() ? (
        Component
    ):(
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

// 3. Cho phép ADMIN và MANAGER
export const AdminManagerRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isAdminOrManager() ? (
        Component
    ) : (
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

// 4. Chỉ cho phép MANAGER
export const ManagerRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isManager() ? (
        Component
    ) : (
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

// 5. Chỉ cho phép STAFF
export const StaffRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isStaff() ? (
        Component
    ) : (
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

// 6. Cho phép MANAGER và STAFF (Bán hàng, Đổi trả, Bảo hành)
export const ManagerOrStaffRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isManager() || ApiService.isStaff() ? (
        Component
    ) : (
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

// 7. Cho phép tất cả ADMIN, MANAGER, STAFF
export const AllRolesRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isAdminOrManagerOrStaff() ? (
        Component
    ) : (
        <Navigate to="/login" replace state={{from: location}}/>
    );
};