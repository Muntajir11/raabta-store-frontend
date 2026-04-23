import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './lib/cart.tsx'
import { ProductsProvider } from './lib/products.tsx'
import { WishlistProvider } from './lib/wishlist.tsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <ProductsProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </ProductsProvider>
      </CartProvider>
    </ErrorBoundary>
  </StrictMode>,
)
