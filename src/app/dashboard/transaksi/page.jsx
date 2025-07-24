export default function TransaksiPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-gray-600 mt-2">Kelola dan pantau semua transaksi</p>
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Transaksi Hari Ini</h3>
            <p className="text-2xl font-bold text-green-600">Rp 2,450,000</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Jumlah Order</h3>
            <p className="text-2xl font-bold text-blue-600">47</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">8</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Selesai</h3>
            <p className="text-2xl font-bold text-green-600">39</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
              <div className="flex gap-2">
                <select className="border border-gray-300 px-3 py-2 rounded-lg text-sm">
                  <option>Semua Status</option>
                  <option>Pending</option>
                  <option>Selesai</option>
                  <option>Dibatalkan</option>
                </select>
                <input 
                  type="search" 
                  placeholder="Cari transaksi..." 
                  className="border border-gray-300 px-3 py-2 rounded-lg w-48 text-sm"
                />
              </div>
            </div>
          </div>
          
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-indigo-600">#ORD-2024-001</td>
                <td className="px-6 py-4 text-sm text-gray-900">Budi Santoso</td>
                <td className="px-6 py-4 text-sm text-gray-900">Nasi Gudeg Special x2</td>
                <td className="px-6 py-4 text-sm text-gray-900">Rp 50,000</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Selesai</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">10:30 AM</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-indigo-600">#ORD-2024-002</td>
                <td className="px-6 py-4 text-sm text-gray-900">Sari Dewi</td>
                <td className="px-6 py-4 text-sm text-gray-900">Sate Ayam x1, Es Teh x1</td>
                <td className="px-6 py-4 text-sm text-gray-900">Rp 35,000</td>
                <td className="px-6 py-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">11:15 AM</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-indigo-600">#ORD-2024-003</td>
                <td className="px-6 py-4 text-sm text-gray-900">Ahmad Wijaya</td>
                <td className="px-6 py-4 text-sm text-gray-900">Gado-gado x1</td>
                <td className="px-6 py-4 text-sm text-gray-900">Rp 20,000</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Selesai</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">11:45 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 