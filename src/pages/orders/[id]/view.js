import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FileText } from 'react-feather';
import Layout from '@/components/Layout';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${id}`);
      const orderData = response.data;

      // Calculate total order price
      const totalOrderPrice = orderData.products.reduce((sum, product) =>
        sum + (product.price * product.quantity), 0
      );

      setOrder({ ...orderData, totalOrderPrice });
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
    setLoading(false);
  };

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <Layout>
      {(loading) => <div>Loading ...</div>}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Order Detail</h2>

        <div className="mb-6">
          <p className="text-sm text-gray-600">Order ID</p>
          <p className="text-lg font-semibold">{order.id}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">Customer Name</p>
          <p className="text-lg font-semibold">{order.customer_name}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">Total Order Price</p>
          <p className="text-lg font-semibold">Rp {order.totalOrderPrice.toLocaleString()}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Product Detail</p>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Product Name</th>
                <th className="py-2 px-4 text-left">Quantity</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Total Product Price</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((product, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{product.product_id}</td>
                  <td className="py-2 px-4">{product.quantity}</td>
                  <td className="py-2 px-4">Rp {product.product_price.toLocaleString()}</td>
                  <td className="py-2 px-4">Rp {(product.product_price * product.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}