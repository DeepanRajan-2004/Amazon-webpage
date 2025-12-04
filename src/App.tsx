import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Account } from './components/Account';
import { Product } from './types';

type View = 'products' | 'product-detail' | 'checkout' | 'account' | 'order-success';

function App() {
  const [currentView, setCurrentView] = useState<View>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('products');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setCurrentView('products');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  const handleCartClick = () => {
    setCartOpen(true);
  };

  const handleAccountClick = () => {
    setCurrentView('account');
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    setCurrentView('checkout');
  };

  const handleCheckoutSuccess = () => {
    setCurrentView('order-success');
    setTimeout(() => {
      setCurrentView('products');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
        onCartClick={handleCartClick}
        onAccountClick={handleAccountClick}
      />

      <main className="flex-1">
        {currentView === 'products' && (
          <ProductList
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onProductClick={handleProductClick}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setCurrentView('products')}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            onClose={() => setCurrentView('products')}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        {currentView === 'account' && (
          <Account onClose={() => setCurrentView('products')} />
        )}

        {currentView === 'order-success' && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You will receive a confirmation email shortly.
              </p>
              <p className="text-sm text-gray-500">Redirecting to home page...</p>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckoutClick}
      />
    </div>
  );
}

export default App;
