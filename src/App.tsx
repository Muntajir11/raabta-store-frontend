import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import CartPage from './pages/Cart/CartPage';
import CustomiseEditorPage from './pages/Customisation/CustomiseEditorPage';

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
    <BrowserRouter>
      <Toaster position="top-center" />
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/customisation/design" element={<CustomiseEditorPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
