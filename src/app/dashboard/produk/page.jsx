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

export default function ProdukPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
  
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file (.csv)');
    }
  };

  // Function untuk fetch items dari API
  const getItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/items/get-all');
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        console.log(`Berhasil load ${data.total_items} items`);
      } else {
        console.error('Gagal fetch items:', response.statusText);
        alert('Gagal load data produk');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Error koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  // Load items saat component mount
  useEffect(() => {
    getItems();
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
      formData.append('csv_file', selectedFile); // Ganti dari 'file' ke 'csv_file'

      try {
        const response = await fetch('https://nabung-backend-931967398441.asia-southeast1.run.app/api/v1/items/upload-csv', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          alert(`File ${selectedFile.name} berhasil diupload! ${result.items_added || 0} produk ditambahkan.`);
          setSelectedFile(null);
          setIsDialogOpen(false);
          
          // Refresh data setelah upload berhasil
          await getItems();
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

  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
        <p className="text-gray-600 mt-2">Kelola produk dan inventory kamu</p>
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">

            
            {/* Import CSV Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="border bg-indigo-100 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Produk dari CSV</DialogTitle>
                  <DialogDescription>
                    Upload file CSV untuk menambahkan produk secara bulk. File harus berformat CSV dengan kolom: nama, kategori, harga, stok.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {selectedFile ? (
                      // File Selected State
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      // Upload Area
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop CSV file disini
                          </p>
                          <p className="text-sm text-gray-500">atau</p>
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
                        <p className="text-xs text-gray-500 mt-3">
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
            
            <Button className="border bg-indigo-100 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
              Input from Your POS
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 overflow-hidden overflow-x-auto ">
          <table className="w-full">
            <thead className="bg-indigo-50 dark:bg-indigo-950/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Produksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm ">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">{item.stock}</td>
                    <td className="px-6 py-4 text-sm">
                      Rp {item.production_price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Hapus</button>
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