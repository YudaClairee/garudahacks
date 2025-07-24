import { Button } from "@/components/ui/button";
import { CashflowForecast } from "@/components/cashflow-forecast";

export default function insightAiPage() {
  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Insight AI</h1>
      </div>

      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 p-6 border border-gray-200 rounded-lg flex flex-col gap-4">
            <CashflowForecast />
            <CashflowForecast />
          </div>
          {/* <div className="col-span-2 p-6 border border-gray-200 rounded-lg">
            <CashflowForecast />
          </div> */}

          <div className="col-span-1 flex flex-col gap-10 border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Cashflow Analysis</h2>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-700">Revenue</h3>
                  <p className="text-lg font-medium text-gray-700">Rp86.000.000</p>
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-700">Profit</h3>
                  <p className="text-lg font-medium text-gray-700">Rp40.000.000</p>
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-700">Expenses</h3>
                  <p className="text-lg font-medium text-gray-700">Rp46.000.000</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 text-center bg-indigo-100 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900">AI Tips</h2>
              <div className="flex items-center gap-3 text-left">
                <div className="bg-indigo-500 rounded-full p-2 w-5 h-5">
                </div>
                <p className="text-lg text-gray-900 text-left">Take Loans 10% from revenue to expanding your business</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="bg-indigo-500 rounded-full p-2 w-5 h-5">
                </div>
                <p className="text-lg text-gray-900 text-left">Investing in spending Asset and Increase Oppex to increase Productivity</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="bg-indigo-500 rounded-full p-2 w-5 h-5">
                </div>
                <p className="text-lg text-gray-900 text-left">Maintain the Cashflow and raise the price to prevent any loses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}