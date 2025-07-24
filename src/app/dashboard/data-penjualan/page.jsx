export default function DataPenjualanPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Penjualan</h1>
        <p className="text-gray-600 mt-2">Lihat dan analisis data penjualan kamu</p>
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Penjualan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Total Penjualan</h3>
              <p className="text-2xl font-bold text-blue-600">Rp 150,000,000</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Produk Terjual</h3>
              <p className="text-2xl font-bold text-green-600">1,240</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Rata-rata Order</h3>
              <p className="text-2xl font-bold text-purple-600">Rp 120,000</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Grafik Penjualan</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Grafik penjualan akan tampil di sini</p>
          </div>
        </div>
      </div>
    </div>
  );
} 