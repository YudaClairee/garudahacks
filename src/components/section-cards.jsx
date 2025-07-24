import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import { Box, Coins, ConciergeBell, TrendingUpDown } from "lucide-react";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-4">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <Coins className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">Rp2.680.000</p>
          </div>
          
        </CardHeader>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <Box className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">990</p>
          </div>
          
        </CardHeader>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <ConciergeBell className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cashflow Status</p>
            <p className="text-2xl font-bold">Good</p>
          </div>
          
        </CardHeader>
      </Card>
      
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-start space-y-0 pb-3 gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <TrendingUpDown className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sales Forecasting</p>
            <p className="text-2xl font-bold">1125</p>
          </div>
          
        </CardHeader>
      </Card>
    </div>
  );
}
