export default function ProdukPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
        <p className="text-gray-600 mt-2">Kelola produk dan inventory kamu</p>
      </div>
      
      <div className="px-4 lg:px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Tambah Produk
            </button>
            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Import CSV
            </button>
          </div>
          <div className="flex gap-2">
            <input 
              type="search" 
              placeholder="Cari produk..." 
              className="border border-gray-300 px-3 py-2 rounded-lg w-64"
            />
            <button className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50">
              Filter
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                    <div>
                      <div className="font-medium">Nasi Gudeg Special</div>
                      <div className="text-sm text-gray-500">SKU: GDG001</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">Makanan Utama</td>
                <td className="px-6 py-4 text-sm text-gray-900">Rp 25,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">150</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aktif</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                    <div>
                      <div className="font-medium">Sate Ayam Bumbu Kacang</div>
                      <div className="text-sm text-gray-500">SKU: SAT002</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">Makanan Utama</td>
                <td className="px-6 py-4 text-sm text-gray-900">Rp 30,000</td>
                <td className="px-6 py-4 text-sm text-gray-900">89</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Aktif</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 