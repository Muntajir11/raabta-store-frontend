import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './lib/cart.tsx'
import { ProductsProvider } from './lib/products.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <ProductsProvider>
        <App />
      </ProductsProvider>
    </CartProvider>
  </StrictMode>,
)
