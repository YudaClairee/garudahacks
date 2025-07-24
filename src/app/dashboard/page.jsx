import { TotalRevenueChart } from "@/components/total-revenue-chart"
import { BestSellingChart } from "@/components/best-selling-chart"
import { SectionCards } from "@/components/section-cards"
import { OpportunityTable } from "@/components/opportunitytable";

export default function Page() {
  return (
    <>
      <h1 className="px-4 lg:px-6 font-bold text-2xl">Dashboard</h1>
      <SectionCards />
      <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 lg:grid-cols-2">
        <TotalRevenueChart />
        <BestSellingChart />
      </div>
      <div className="px-4 lg:px-6">
        <OpportunityTable />
      </div>
    </>
  );
}
