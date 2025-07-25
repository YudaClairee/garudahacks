"use client"

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Upload, FileText, X } from "lucide-react";

export default function DataPenjualanPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [orders, setOrders] = useState([]); // Ganti dari items ke orders
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
  
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file (.csv)');
    }
  };

  // Function untuk fetch orders dari API
  const getOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/orders/get-all');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []); // Sesuai dengan response structure
        console.log(`Berhasil load ${data.total_orders} orders`);
      } else {
        console.error('Gagal fetch orders:', response.statusText);
        alert('Gagal load data orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  // Load orders saat component mount
  useEffect(() => {
    getOrders();
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Please drop a valid CSV file (.csv)');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('csv_file', selectedFile);

      try {
        const response = await fetch('https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/orders/upload-csv', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          alert(`File ${selectedFile.name} berhasil diupload! ${result.orders_added || 0} orders ditambahkan.`);
          setSelectedFile(null);
          setIsDialogOpen(false);
          
          // Refresh data setelah upload berhasil
          await getOrders();
        } else {
          const error = await response.json();
          alert(`Upload gagal: ${error.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Upload gagal. Cek koneksi internet.');
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // Function untuk download CSV template
  const downloadTemplate = async () => {
    try {
      const response = await fetch('https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/orders/csv-template');
      
      if (response.ok) {
        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'orders_template.csv'; // Filename untuk download
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Template berhasil didownload');
      } else {
        alert('Gagal download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error download template');
    }
  };

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function untuk format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Data Penjualan</h1>
        <p className="text-muted-foreground mt-2">Kelola data penjualan kamu</p>
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            {/* Import CSV Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="border bg-indigo-100 dark:bg-indigo-950/20 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                  Input CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Orders dari CSV</DialogTitle>
                  <DialogDescription>
                    Upload file CSV untuk menambahkan orders secara bulk. File harus berformat CSV dengan kolom yang sesuai.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {selectedFile ? (
                      // File Selected State
                      <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-1 hover:bg-muted-foreground/20 rounded-full"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      // Upload Area
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-lg font-medium">
                            Drop CSV file disini
                          </p>
                          <p className="text-sm text-muted-foreground">atau</p>
                        </div>
                        <label className="cursor-pointer">
                          <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block">
                            Pilih File
                          </span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground mt-3">
                          Maksimal ukuran file 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Upload CSV
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button className="border bg-indigo-100 dark:bg-indigo-950/20 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
              Input from Your POS
            </Button>

            <Button 
              onClick={downloadTemplate}
              className="border bg-green-100 dark:bg-green-950/20 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
            >
              Download Template
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg border overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-indigo-50 dark:bg-zinc-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-muted-foreground">
                    Belum ada data penjualan
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {order.items && order.items.length > 0 ? (
                          <div>
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="text-muted-foreground">
                                Item ID: {item.item_id} (x{item.quantity})
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{order.items.length - 2} items lainnya
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(order.completed_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 