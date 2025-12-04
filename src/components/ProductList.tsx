import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, ChevronDown } from 'lucide-react';

interface ProductListProps {
  searchQuery: string;
  selectedCategory: string;
  onProductClick: (product: Product) => void;
}

export const ProductList = ({ searchQuery, selectedCategory, onProductClick }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    switch (sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data;

      if (minRating > 0) {
        filteredData = filteredData.filter(p => p.rating >= minRating);
      }

      if (priceRange[0] > 0 || priceRange[1] < 1000) {
        filteredData = filteredData.filter(
          p => p.price >= priceRange[0] && p.price <= priceRange[1]
        );
      }

      setProducts(filteredData);
    }
    setLoading(false);
  };

  const handleFilterChange = () => {
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between font-bold text-lg mb-4"
            >
              <span className="flex items-center gap-2">
                <Filter size={20} />
                Filters
              </span>
              <ChevronDown
                size={20}
                className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div>
                <h3 className="font-bold text-lg mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Max"
                    />
                  </div>
                  <button
                    onClick={handleFilterChange}
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={() => {
                          setMinRating(rating);
                          setTimeout(handleFilterChange, 0);
                        }}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm">{rating}+ Stars</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={0}
                      checked={minRating === 0}
                      onChange={() => {
                        setMinRating(0);
                        setTimeout(handleFilterChange, 0);
                      }}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm">All Ratings</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` :
               selectedCategory === 'all' ? 'All Products' :
               categories.find(c => c.slug === selectedCategory)?.name || 'Products'}
            </h2>
            <p className="text-gray-600 mt-1">
              {products.length} {products.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
