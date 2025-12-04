import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Check, X, ChevronLeft } from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetail = ({ product, onClose }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setReviews(data);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const allImages = [product.image_url, ...product.images].filter(
    (img, index, self) => self.indexOf(img) === index
  );

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} />
          Back to products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`bg-gray-100 rounded-lg overflow-hidden aspect-square border-2 transition-colors ${
                      selectedImage === img ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">{product.brand}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.floor(product.rating)
                        ? 'fill-orange-400 text-orange-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-gray-600">
                {product.review_count.toLocaleString()} ratings
              </span>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                {discount > 0 && (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                    -{discount}%
                  </span>
                )}
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              {product.original_price && (
                <div className="text-gray-600">
                  List Price:{' '}
                  <span className="line-through">${product.original_price.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">About this item</h3>
              <p className="text-gray-700 mb-4">{product.description}</p>
              {product.features.length > 0 && (
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="mb-4">
                <span className={`font-bold text-lg ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.stock > 0 && product.stock < 20 && (
                  <span className="text-red-600 ml-2">Only {product.stock} left!</span>
                )}
              </div>

              {product.stock > 0 && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity:
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-bold text-lg"
                  >
                    <ShoppingCart size={24} />
                    Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < review.rating
                              ? 'fill-orange-400 text-orange-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-sm">{review.title}</span>
                    {review.verified_purchase && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
