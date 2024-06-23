import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Edit2, FileText, Trash2, Search, Calendar, ChevronDown } from 'react-feather';
import Layout from '@/components/Layout';
import { currencyFormat } from '@/helpers/global';
import Link from 'next/link';

export default function OrderManagement() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`, {
        params: {
          page,
          per_page: perPage,
          customerName: customerNameFilter,
          date: dateFilter ? dateFilter.toISOString().split('T')[0] : undefined,
        }
      });
      setOrders(response.data.list);
      setTotalRows(response.data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(1);
  }, [perPage, customerNameFilter, dateFilter]);

  const handlePageChange = page => {
    fetchOrders(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
  };

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${orderId}`);
      fetchOrders(1);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const openDeleteModal = (order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const columns = [
    {
      name: 'Order Id',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Customer',
      selector: row => row.customer_name,
      sortable: true,
    },
    {
      name: 'Total Products',
      selector: row => row.total_products.toLocaleString(),
      sortable: true,
    },
    {
      name: 'Total Price',
      selector: row => row.total_price.toLocaleString(),
      sortable: true,
    },
    {
      name: 'Order Date',
      selector: row => new Date(row.created_at).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link href={`/orders/${row.id}/edit`}>
            <button className="text-blue-500 hover:text-blue-700">
              <Edit2 size={18} />
            </button>
          </Link>
          <Link href={`/orders/${row.id}/view`}>
            <button className="text-gray-500 hover:text-gray-700">
              <FileText size={18} />
            </button>
          </Link>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => openDeleteModal(row)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const subHeaderComponent = useMemo(() => {
    return (
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Input customer name"
              className="pl-10 pr-4 py-2 border rounded"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <DatePicker
              selected={dateFilter}
              onChange={(date) => setDateFilter(date)}
              placeholderText="Select date"
              className="pl-10 pr-4 py-2 border rounded"
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        <button
          onClick={() => router.push('/orders/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Order
        </button>
      </div>
    );
  }, [customerNameFilter, dateFilter]);

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Order Management</h2>

        <DataTable
          columns={columns}
          data={orders}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          subHeader
          subHeaderComponent={subHeaderComponent}
        />
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this order?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(orderToDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}