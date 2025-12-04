import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategoryClick: (category: string) => void;
  onCartClick: () => void;
  onAccountClick: () => void;
}

export const Header = ({ onSearch, onCategoryClick, onCartClick, onAccountClick }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const categories = ['Electronics', 'Books', 'Fashion', 'Home & Kitchen', 'Sports & Outdoors'];

  return (
    <>
      <header className="bg-gray-900 text-white sticky top-0 z-40">
        <div className="bg-gray-800 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="hidden sm:inline">Deliver to United States</span>
              <span className="sm:hidden">Deliver</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button onClick={onAccountClick} className="hover:underline">
                    <span className="hidden sm:inline">Hello, {user.email?.split('@')[0]}</span>
                    <span className="sm:hidden">Account</span>
                  </button>
                  <button onClick={handleSignOut} className="hover:underline">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthModalTab('signin');
                      setAuthModalOpen(true);
                    }}
                    className="hover:underline"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('signup');
                      setAuthModalOpen(true);
                    }}
                    className="hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <h1
              onClick={() => onCategoryClick('all')}
              className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="hidden sm:inline">ShopHub</span>
              <span className="sm:hidden">SH</span>
            </h1>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 text-gray-900 rounded-l-md focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-orange-500 px-4 py-2 rounded-r-md hover:bg-orange-600 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            <button
              onClick={user ? onAccountClick : () => setAuthModalOpen(true)}
              className="hidden sm:flex flex-col items-start hover:opacity-80 transition-opacity"
            >
              <span className="text-xs">Hello, {user ? user.email?.split('@')[0] : 'Guest'}</span>
              <span className="font-bold text-sm">Account</span>
            </button>

            <button
              onClick={onCartClick}
              className="relative hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <ShoppingCart size={28} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:inline font-bold">Cart</span>
            </button>
          </div>
        </div>

        <nav className="bg-gray-800 py-2 px-4 hidden lg:block">
          <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">
            <button onClick={() => onCategoryClick('all')} className="hover:underline font-medium">
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryClick(category.toLowerCase().replace(' & ', '-'))}
                className="hover:underline"
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        {mobileMenuOpen && (
          <nav className="lg:hidden bg-gray-800 py-4 px-4 border-t border-gray-700">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onCategoryClick('all');
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:underline font-medium"
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryClick(category.toLowerCase().replace(' & ', '-'));
                    setMobileMenuOpen(false);
                  }}
                  className="text-left hover:underline"
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};
