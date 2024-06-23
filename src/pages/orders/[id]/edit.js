import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Layout from '@/components/Layout';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  customer_name: Yup.string().required('Customer name is required'),
  products: Yup.array().of(
    Yup.object().shape({
      product_id: Yup.string().required('Product is required'),
      quantity: Yup.number().required('Quantity is required').positive('Quantity must be positive')
    })
  ).min(1, 'At least one product is required')
});

export default function AddOrder() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    fetchOrderDetail(id);
    console.log('order', order)
    fetchProducts();
  }, [id]);

  const fetchOrderDetail = async (id) => {
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

  async function fetchProducts() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);
      const data = await response.json();
      setAvailableProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async function handleSubmit(values, { setSubmitting }) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push('/');
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleProductChange(setFieldValue, index, product_id) {
    const selectedProduct = availableProducts.filter((p) => p.id === parseInt(product_id))[0];
    setFieldValue(`products.${index}.product_id`, product_id);
    setFieldValue(`products.${index}.price`, selectedProduct.price || 0);
  }

  function calculateTotalPrice(products) {
    // return products.reduce((sum, item) => {
    //   const product = availableProducts.find(p => p.id === parseInt(item.product_id));
    //   return sum + (product?.price || 0) * (item.quantity || 0);
    // }, 0);
  }

  return (
    <Layout>
      <h2 className="text-2xl text-center font-bold mb-6">Edit Order</h2>
      <Formik
        initialValues={{
          // customer_name: '',
          // products: [{ product_id: '', quantity: '' }],
          customer_name: order.customer_name,
          products: order.products
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className='bg-white shadow-md rounded-lg p-6'>
            <div className="mb-4">
              <label className="block mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Field
                name="customer_name"
                type="text"
                value={order.customer_name}
                className="w-full p-2 border rounded"
                placeholder="Input customer name"
              />
              <ErrorMessage name="customer_name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <FieldArray name="products">
              {
                ({ push, remove }) => (
                  <>
                    {order.products && order.products.map((item, index) => (
                      <div key={index} className="mb-6 border-t pt-4">
                        <h3 className="font-semibold mb-2">Product Detail</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2">
                              Product Name <span className="text-red-500">*</span>
                            </label>
                            <Field
                              as="select"
                              name={`products.${index}.product_id`}
                              value={item.product_id}
                              className="w-full p-2 border rounded"
                              onChange={(e) => handleProductChange(setFieldValue, index, e.target.value)}
                            >
                              <option value="">Select product name</option>
                              {availableProducts.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                              ))}
                            </Field>
                            <ErrorMessage name={`products.${index}.product_id`} component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="block mb-2">Price</label>
                            <input
                              type="text"
                              name={`products.${index}.price`}
                              value={availableProducts.find(p => p.id === parseInt(item.product_id))?.price || ''}
                              className="w-full p-2 border rounded bg-gray-100"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block mb-2">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <Field
                              name={`products.${index}.quantity`}
                              type="number"
                              value={item.quantity}
                              className="w-full p-2 border rounded"
                              placeholder="Input quantity"
                            />
                            <ErrorMessage name={`products.${index}.quantity`} component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div>
                            <label className="block mb-2">Total Product Price</label>
                            <input
                              type="text"
                              value={(availableProducts.find(p => p.id === parseInt(item.product_id))?.price || 0) * (item.quantity || 0)}
                              className="w-full p-2 border rounded bg-gray-100"
                              readOnly
                            />
                          </div>
                        </div>
                        {order.products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-2 text-red-500"
                          >
                            Remove Product
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push({ product_id: '', quantity: '' })}
                      className="bg-blue-900 text-white px-4 py-2 rounded mb-4"
                    >
                      Add More Product
                    </button>
                  </>
                )
              }
            </FieldArray>

            <div className="mb-6">
              <label className="block mb-2">Total Order Price</label>
              <input
                type="text"
                value={calculateTotalPrice(values.products)}
                className="w-full p-2 border rounded bg-gray-100"
                readOnly
              />
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-blue-300"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-300 px-6 py-2 rounded"
              >
                Back
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}