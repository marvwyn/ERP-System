import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductList from "./pages/products/ProductList";
import SalesList from "./pages/sales/SalesList";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import LedgerReport from "./pages/ledger/LedgerReport";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/sales" element={<SalesList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/ledger" element={<LedgerReport />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}