import { Construction, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Settings() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center">
            <Construction className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Coming Soon</h1>
          <p className="text-lg text-[#6b7280]">
            This page is under development
          </p>
          <p className="text-[#9ca3af]">
            We are working hard to develop this feature. Stay tuned!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Progress indicator (optional) */}
        <div className="pt-8">
          <div className="text-sm text-[#9ca3af] mb-2">
            Progress Development
          </div>
          <div className="w-full bg-[#e5e7eb] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] h-2 rounded-full transition-all duration-500"
              style={{ width: "0%" }}
            ></div>
          </div>
          <div className="text-xs text-[#9ca3af] mt-1">0% completed</div>
        </div>
      </div>
    </div>
  );
}
