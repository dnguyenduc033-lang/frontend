import axios from "axios";
import CryptoJS from "crypto-js";

// --- BỔ SUNG: BỘ ĐÁNH CHẶN LỖI (INTERCEPTOR) ---
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu server báo lỗi 401 (Hết hạn Token) hoặc 403 (Không có quyền)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            ApiService.clearAuth(); // Xóa token cũ
            window.location.href = "/login"; // Đá về trang đăng nhập
        }
        return Promise.reject(error);
    }
);

export default class ApiService {

    static BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
    static ENCRYPTION_KEY = "nguyendai-dev-inventory";

    //encrypt data using cryptoJs
    static encrypt(data) {
        return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY.toString());
    }

    //decrypt data using cryptoJs
    static decrypt(data) {
        const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    //save token with encryption
    static saveToken(token) {
        const encryptedToken = this.encrypt(token).toString();
        localStorage.setItem("token", encryptedToken);
    }

    // retreive the token
    static getToken() {
        const encryptedToken = localStorage.getItem("token");
        if (!encryptedToken) return null;
        return this.decrypt(encryptedToken);
    }

    //save Role with encryption
    static saveRole(role) {
        const encryptedRole = this.encrypt(String(role)).toString();
        localStorage.setItem("role", encryptedRole);
    }

    // retreive the role
    static getRole() {
        const encryptedRole = localStorage.getItem("role");
        if (!encryptedRole) return null;
        return this.decrypt(encryptedRole);
    }

    static clearAuth() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }

    static getHeader() {
        const token = this.getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    /** AUTH && USERS API */

    static async registerUser(registerData) {
        const response = await axios.post(`${this.BASE_URL}/auth/register`, registerData);
        return response.data;
    }

    static async loginUser(loginData) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginData);
        return response.data;
    }

    static async getAllUsers() {
        const response = await axios.get(`${this.BASE_URL}/users/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUserOrgTree() {
        const response = await axios.get(`${this.BASE_URL}/users/org-tree`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUserChildren(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/${userId}/children`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getLoggedInUserInfo() {
        const response = await axios.get(`${this.BASE_URL}/users/current`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUserById(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateUser(userId, userData) {
        const response = await axios.put(`${this.BASE_URL}/users/update/${userId}`, userData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteUser(userId) {
        const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /** PRODUCT ENDPOINTS */

    static async addProduct(imageFile, productDTO) {
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productDTO)], { type: "application/json" }));
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }
        const response = await axios.post(`${this.BASE_URL}/products/add`, formData, {
            headers: {
                ...this.getHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    static async updateProduct(imageFile, productDTO) {
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productDTO)], { type: "application/json" }));
        if (imageFile) {
            formData.append("imageFile", imageFile); 
        }
        const response = await axios.put(`${this.BASE_URL}/products/update`, formData, {
            headers: {
                ...this.getHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    static async getAllProducts() {
        const response = await axios.get(`${this.BASE_URL}/products/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getProductById(productId) {
        const response = await axios.get(`${this.BASE_URL}/products/${productId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async searchProduct(searchValue) {
        const response = await axios.get(`${this.BASE_URL}/products/search`, {
            headers: this.getHeader(),
            params: { input: searchValue }
        });
        return response.data;
    }

    static async deleteProduct(productId) {
        const response = await axios.delete(`${this.BASE_URL}/products/delete/${productId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    //Thêm tính năng mới
    static async getProductsByDate(date) {
        const response = await axios.get(`${this.BASE_URL}/products/by-date`, {
            headers: this.getHeader(),
            params: { date }
        });
        return response.data;
    }

    /** CATEGORY ENDPOINTS */

    static async createCategory(category) {
        const response = await axios.post(`${this.BASE_URL}/categories/add`, category, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getAllCategory() {
        const response = await axios.get(`${this.BASE_URL}/categories/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getCategoryById(categoryId) {
        const response = await axios.get(`${this.BASE_URL}/categories/${categoryId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateCategory(categoryId, categoryData) {
        const response = await axios.put(`${this.BASE_URL}/categories/update/${categoryId}`, categoryData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteCategory(categoryId) {
        const response = await axios.delete(`${this.BASE_URL}/categories/delete/${categoryId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /** SUPPLIER ENDPOINTS */

    static async addSupplier(supplierData) {
        const response = await axios.post(`${this.BASE_URL}/suppliers/add`, supplierData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getAllSuppliers() {
        const response = await axios.get(`${this.BASE_URL}/suppliers/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getSupplierById(supplierId) {
        const response = await axios.get(`${this.BASE_URL}/suppliers/${supplierId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateSupplier(supplierId, supplierData) {
        const response = await axios.put(`${this.BASE_URL}/suppliers/update/${supplierId}`, supplierData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteSupplier(supplierId) {
        const response = await axios.delete(`${this.BASE_URL}/suppliers/delete/${supplierId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /** TRANSACTIONS ENDPOINTS */

    static async purchaseProduct(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/purchase`, body, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async sellProduct(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/sell`, body, {
            headers: this.getHeader()
        });
        return response.data;
    }
    
    static async returnToSupplier(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/return`, body, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async returnFromCustomer(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/return-from-customer`, body, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getAllTransactions(page = 0, size = 10, filter = "") {
        const response = await axios.get(`${this.BASE_URL}/transactions/all`, {
            headers: this.getHeader(),
            params: { page, size, filter }
        });
        return response.data;
    }

    static async getTransactionsByMonthAndYear(month, year) {
        const response = await axios.get(`${this.BASE_URL}/transactions/by-month-year`, {
            headers: this.getHeader(),
            params: { month, year }
        });
        return response.data;
    }

    static async getTransactionById(transactionId) {
        // Ép đường dẫn tuyệt đối chạy qua cổng 5050 của Spring Boot Backend
        const response = await axios.get(`http://localhost:5050/api/transactions/${transactionId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateTransactionStatus(transactionId, status) {
        const response = await axios.put(`${this.BASE_URL}/transactions/${transactionId}`, status, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateTransactionStatusOnly(id, status) {
        const response = await axios.patch(`${this.BASE_URL}/transactions/${id}/status?status=${status}`, null, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async downloadTransactionPDF(transactionId) {
        const response = await axios.get(`${this.BASE_URL}/transactions/${transactionId}/export-pdf`, {
            headers: this.getHeader(),
            responseType: 'blob' 
        });
        return response.data;
    }

    /** AUTHENTICATION CHECKER */

    static logout() {
        this.clearAuth();
    }

    static isAuthenticated() {
        const token = this.getToken();
        return !!token;
    }

    static isAdmin() {
        const role = this.getRole();
        return role === "ADMIN";
    }

    static isManager() {
        const role = this.getRole();
        return role === "MANAGER";
    }

    static isStaff() {
    const role = this.getRole();
    return role === "STAFF";
    }

    static isAdminOrManager() {
        const role = this.getRole();
        return role === "ADMIN" || role === "MANAGER";
    }

    static isAdminOrManagerOrStaff() {
        const role = this.getRole();
        return role === "ADMIN" || role === "MANAGER" || role === "STAFF";
    }

    /** PURCHASE REQUEST ENDPOINTS */

    static async createPurchaseRequest(data) {
        const response = await axios.post(`${this.BASE_URL}/purchase-requests/create`, data, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getAllPurchaseRequests() {
        const response = await axios.get(`${this.BASE_URL}/purchase-requests/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getMyPurchaseRequests() {
        const response = await axios.get(`${this.BASE_URL}/purchase-requests/my`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async approvePurchaseRequest(id) {
        const response = await axios.put(`${this.BASE_URL}/purchase-requests/${id}/approve`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async bulkApprovePurchaseRequests(ids) {
        const response = await axios.put(`${this.BASE_URL}/purchase-requests/bulk-approve`, { ids }, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async rejectPurchaseRequest(id, reason) {
        const response = await axios.put(`${this.BASE_URL}/purchase-requests/${id}/reject`, { reason }, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async completePurchaseRequest(id, serialNumbers) {
        const response = await axios.put(`${this.BASE_URL}/purchase-requests/${id}/complete`, serialNumbers, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /** NOTIFICATION ENDPOINTS */
    
    static async getMyNotifications() {
        const response = await axios.get(`${this.BASE_URL}/notifications/my`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUnreadCount() {
        const response = await axios.get(`${this.BASE_URL}/notifications/unread-count`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async markNotificationAsRead(id) {
        const response = await axios.put(`${this.BASE_URL}/notifications/${id}/read`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async markAllNotificationsAsRead() {
        const response = await axios.put(`${this.BASE_URL}/notifications/read-all`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }
    /** NEWS ENDPOINTS */

    static async getAllNews() {
        const response = await axios.get(`${this.BASE_URL}/news`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async createNews(newsData) {
        const response = await axios.post(`${this.BASE_URL}/news`, newsData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /** EXTENSIONS & UTILS */

    static async checkWarranty(serialNumber) {
        const response = await axios.get(`${this.BASE_URL}/transactions/warranty-check/${serialNumber}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getLowStockProducts() {
        const response = await axios.get(`${this.BASE_URL}/products/low-stock`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async addProductSpecification(productId, specData) {
        const response = await axios.post(`${this.BASE_URL}/products/${productId}/specs`, specData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async extractSerialsFromExcel(file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(`${this.BASE_URL}/transactions/extract-serials`, formData, {
            headers: {
                ...this.getHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }
}