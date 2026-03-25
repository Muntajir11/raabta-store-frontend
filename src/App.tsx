import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
