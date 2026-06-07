import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute, AdminManagerRoute, ManagerRoute } from "./service/Guard";
import WelcomePage from "./pages/WelcomePage";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CategoryPage from "./pages/CategoryPage";
import SupplierPage from "./pages/SupplierPage";
import SupplierDetailPage from "./pages/SupplierDetailPage";
import AddEditSupplierPage from "./pages/AddEditSupplierPage";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddEditProductPage from "./pages/AddEditProductPage";
import PurchasePage from "./pages/PurchasePage";
import SellPage from "./pages/SellPage";
import ReturnPage from "./pages/ReturnPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import UserPage from "./pages/UserPage";
import AddEditCategoryPage from "./pages/AddEditCategoryPage"; 
import WarrantyCheckPage from './pages/WarrantyCheckPage';
import NewsPage from './pages/NewsPage';
import PurchaseRequestPage from './pages/PurchaseRequestPage';
import PurchaseApprovalPage from './pages/PurchaseApprovalPage';
import NotificationPage from './pages/NotificationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<AdminRoute element={<RegisterPage/>}/>}/>
        <Route path="/login" element={<LoginPage/>}/>

        {/* ADMIN AND MANAGER ROUTES */}
        <Route path="/category" element={<AdminManagerRoute element={<CategoryPage/>}/>}/>
        
        <Route path="/category/add" element={<AdminManagerRoute element={<AddEditCategoryPage/>}/>}/>
        <Route path="/category/edit/:categoryId" element={<AdminManagerRoute element={<AddEditCategoryPage/>}/>}/>

        <Route path="/supplier" element={<AdminManagerRoute element={<SupplierPage/>}/>}/>
        <Route path="/supplier-detail/:id" element={<AdminManagerRoute element={<SupplierDetailPage/>}/>}/>
        <Route path="/add-supplier" element={<AdminManagerRoute element={<AddEditSupplierPage/>}/>}/>
        <Route path="/edit-supplier/:supplierId" element={<AdminManagerRoute element={<AddEditSupplierPage/>}/>}/>
        <Route path="/product" element={<AdminManagerRoute element={<ProductPage/>}/>}/>
        <Route path="/add-product" element={<AdminManagerRoute element={<AddEditProductPage/>}/>}/>
        <Route path="/edit-product/:productId" element={<AdminManagerRoute element={<AddEditProductPage/>}/>}/>
        <Route path="/product-detail/:productId" element={<AdminManagerRoute element={<ProductDetailPage/>}/>}/>
        <Route path="/purchase" element={<ManagerRoute element={<PurchasePage/>}/>}/>
        <Route path="/sell" element={<ManagerRoute element={<SellPage/>}/>}/>
        <Route path="/return" element={<AdminManagerRoute element={<ReturnPage/>}/>}/>
        <Route path="/transaction" element={<AdminManagerRoute element={<TransactionsPage/>}/>}/>
        <Route path="/transaction-detail/:transactionId" element={<AdminManagerRoute element={<TransactionDetailsPage/>}/>}/>
        <Route path="/dashboard" element={<AdminManagerRoute element={<DashboardPage/>}/>}/>
        <Route path="/purchase-request" element={<ManagerRoute element={<PurchaseRequestPage />}/>} />
        <Route path="/purchase-approval" element={<AdminRoute element={<PurchaseApprovalPage />}/>} />

        {/* PROTECTED ROUTES */}
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage/>}/>}/>
        <Route path="/users" element={<AdminRoute element={<UserPage/>}/>}/>

        <Route path="/warranty-check" element={<ManagerRoute element={<WarrantyCheckPage />}/>} />
        <Route path="/news" element={<AdminManagerRoute element={<NewsPage />}/>} />
        <Route path="/notifications" element={<ManagerRoute element={<NotificationPage />} />} />

        {/* FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/login" replace />}/>
      </Routes>
    </Router>
  )
}

export default App;