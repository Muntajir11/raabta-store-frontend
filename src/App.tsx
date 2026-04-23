import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Header from './components/Header/Header';
import CategorySelector from './components/CategorySelector/CategorySelector';
import ProductCards from './components/ProductCards/ProductCards';
import FAQ from './components/FAQ/FAQ';
import Footer from './components/Footer/Footer';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import CategoryPage from './pages/Category/CategoryPage';
import ProductPage from './pages/Product/ProductPage';
import WishlistPage from './pages/Wishlist/WishlistPage';
import MyAccountPage from './pages/Account/MyAccountPage';
import SettingsPage from './pages/Account/SettingsPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';
import CartPage from './pages/Cart/CartPage';
import CustomiseEditorPage from './pages/Customisation/CustomiseEditorPage';
import ContactPage from './pages/Contact/ContactPage';
import PrivacyPolicyPage from './pages/Policy/PrivacyPolicyPage';
import ReturnPolicyPage from './pages/Policy/ReturnPolicyPage';
import ShippingPolicyPage from './pages/Policy/ShippingPolicyPage';
import TermsConditionsPage from './pages/Policy/TermsConditionsPage';

function Home() {
  const [activeCategory, setActiveCategory] = useState<'normal' | 'islamic'>('normal');

  return (
    <>
      <CategorySelector
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      <ProductCards category={activeCategory} />
      <FAQ />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 2147483647 }}
        toastOptions={{
          duration: 2600,
          style: { background: '#0b1220', color: '#e2e8f0', fontWeight: 600 },
        }}
      />
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/customisation/design" element={<CustomiseEditorPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/account" element={<MyAccountPage />} />
          <Route path="/address" element={<Navigate to="/account#address" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/shipping" element={<ShippingPolicyPage />} />
          <Route path="/terms" element={<TermsConditionsPage />} />
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
