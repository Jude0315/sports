import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SupplierTable from './SupplierTable';
import SupplierForm from './SupplierForm';
import SupplierSearch from './SupplierSearch';
import { API_ENDPOINTS } from '../../config/api';
import * as XLSX from 'xlsx';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [generatingReport, setGeneratingReport] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_ENDPOINTS.SUPPLIERS);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to fetch suppliers. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const generateExcelReport = async () => {
    try {
      setGeneratingReport(true);
      
      // Create worksheet data
      const worksheetData = suppliers.map(supplier => ({
        'Supplier Name': supplier.name,
        'Email': supplier.email,
        'Product Category': supplier.product,
        'Quantity Capacity': supplier.quantity,
        'Email Sent': supplier.emailSent ? 'Yes' : 'No',
        'Email Sent Date': supplier.emailSentAt ? new Date(supplier.emailSentAt).toLocaleDateString() : 'N/A',
        'Registration Date': new Date(supplier.createdAt).toLocaleDateString(),
        'Status': supplier.emailSent ? 'Active' : 'Pending'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // Supplier Name
        { wch: 25 }, // Email
        { wch: 20 }, // Product Category
        { wch: 15 }, // Quantity Capacity
        { wch: 10 }, // Email Sent
        { wch: 15 }, // Email Sent Date
        { wch: 15 }, // Registration Date
        { wch: 10 }  // Status
      ];
      worksheet['!cols'] = colWidths;
      
      // Generate Excel file
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `suppliers_report_${currentDate}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      
      // Show success message
      setError('');
      setTimeout(() => {
        alert(`✅ Report generated successfully: ${fileName}`);
      }, 100);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportToCSV = () => {
    if (suppliers.length === 0) {
      alert('No suppliers data to export');
      return;
    }

    // Create CSV content
    const headers = ['Name,Email,Product,Quantity,Email Sent,Email Sent Date,Registration Date,Status'];
    
    const csvContent = suppliers.map(supplier => 
      `"${supplier.name.replace(/"/g, '""')}",${supplier.email},"${supplier.product}",${supplier.quantity},${supplier.emailSent ? 'Yes' : 'No'},"${supplier.emailSentAt ? new Date(supplier.emailSentAt).toLocaleDateString() : 'N/A'}","${new Date(supplier.createdAt).toLocaleDateString()}",${supplier.emailSent ? 'Active' : 'Pending'}`
    ).join('\n');

    const fullCSV = headers.join('\n') + '\n' + csvContent;
    
    // Create download link
    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || user.role !== "admin") {
    return <p className="text-center p-6">Access denied. Admin rights required.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Supplier Management</h2>
        
        <div className="flex space-x-3">
          {/* CSV Export Button */}
          <button
            onClick={exportToCSV}
            disabled={suppliers.length === 0 || generatingReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            title="Export to CSV"
          >
            <span className="mr-2">📊</span>
            Export CSV
          </button>
          
          {/* Excel Report Button */}
          <button
            onClick={generateExcelReport}
            disabled={suppliers.length === 0 || generatingReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {generatingReport ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span className="mr-2">📈</span>
                Generate Excel Report
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {!error && suppliers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded mb-4">
          📋 Found {suppliers.length} suppliers. Ready to generate reports.
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'view' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('view')}
        >
          View Suppliers
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'add' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('add')}
        >
          Add Supplier
        </button>
        <button
          className={`py-3 px-6 font-medium ${activeTab === 'search' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'view' && <SupplierTable suppliers={suppliers} loading={loading} onUpdate={fetchSuppliers} />}
      {activeTab === 'add' && <SupplierForm onSuccess={fetchSuppliers} />}
      {activeTab === 'search' && <SupplierSearch />}
    </div>
  );
};

export default SupplierManagement;