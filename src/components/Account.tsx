import { useState, useEffect } from 'react';
import { ChevronLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, Address } from '../types';

interface AccountProps {
  onClose: () => void;
}

export const Account = ({ onClose }: AccountProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersData) {
      setOrders(ordersData);

      for (const order of ordersData) {
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('order_id', order.id);

        if (items) {
          setOrderItems((prev) => ({ ...prev, [order.id]: items as OrderItem[] }));
        }
      }
    }
    setLoading(false);
  };

  const fetchAddresses = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (data) {
      setAddresses(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-700 bg-green-100';
      case 'shipped':
        return 'text-blue-700 bg-blue-100';
      case 'processing':
        return 'text-orange-700 bg-orange-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-gray-600 mb-8">{user?.email}</p>

        <div className="flex gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="inline-block mr-2" size={20} />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'addresses'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="inline-block mr-2" size={20} />
            Addresses
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 mb-2">No orders yet</p>
                <p className="text-gray-500">Your orders will appear here</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">ORDER PLACED</p>
                        <p className="font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">TOTAL</p>
                        <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">STATUS</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">ORDER ID</p>
                        <p className="font-mono text-sm">{order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {orderItems[order.id]?.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product?.image_url}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-900 font-medium mt-1">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 mb-2">No addresses saved</p>
                <p className="text-gray-500">Add an address during checkout</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        {address.full_name}
                        {address.is_default && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-700">{address.address_line1}</p>
                      {address.address_line2 && (
                        <p className="text-gray-700">{address.address_line2}</p>
                      )}
                      <p className="text-gray-700">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-gray-700">{address.country}</p>
                      <p className="text-gray-600 mt-2">Phone: {address.phone}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
