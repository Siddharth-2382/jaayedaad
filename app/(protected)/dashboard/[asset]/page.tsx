"use client";
import { Asset } from "@/actions/getAssetsAction";
import AssetPieChart from "@/components/assetPieChart";
import AssetTable from "@/components/assetTable";
import ManualTransactionChart from "@/components/manualTransactionChart";
import PortfolioLineChart from "@/components/portfolioLineChart";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { defaultCategories } from "@/constants/category";
import { useData } from "@/contexts/data-context";
import React, { useEffect, useState } from "react";

function Page({ params }: { params: { asset: string } }) {
  const { assets, historicalData } = useData();
  const [manualCategoryAssets, setManualCategoryAssets] = useState<Asset[]>();

  useEffect(() => {
    if (!defaultCategories.includes(params.asset) && assets) {
      setManualCategoryAssets(
        assets.filter((asset) => asset.type === params.asset.toUpperCase())
      );
    }
  }, [assets]);

  // Get today's date
  const today = new Date();

  // Subtract one day
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return (
    <div className="px-6 py-6 w-full h-screen flex flex-col">
      <div className="h-[6vh]"></div>
      <div className="min-h-[85vh] h-full mt-4">
        <div className="grid grid-rows-7 grid-cols-3 gap-4 h-full">
          <div className="row-span-3 col-span-1 border rounded-xl p-4">
            <AssetPieChart view={params.asset} />
          </div>
          <div className="row-span-3 col-span-2 border rounded-xl p-4">
            {historicalData ? (
              defaultCategories.includes(params.asset) ? (
                <PortfolioLineChart data={historicalData} view={params.asset} />
              ) : (
                manualCategoryAssets && (
                  <ManualTransactionChart
                    manualCategoryAssets={manualCategoryAssets}
                  />
                )
              )
            ) : (
              <div>
                <h3 className="font-semibold">Portfolio Performance</h3>
                <p className="text-muted-foreground text-sm">
                  Insight into your portfolio&apos;s value dynamics
                </p>
                <div className="h-40 flex items-center">
                  <LoadingSpinner />
                </div>
              </div>
            )}
          </div>
          <div className="row-span-4 flex flex-col col-span-3 border rounded-xl p-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold">Asset Overview</h3>
                <p className="text-muted-foreground text-sm">
                  (Comprehensive list of your owned {params.asset})
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Last update on ({yesterday.toLocaleDateString("en-GB")})
                </p>
              </div>
            </div>
            <div className="mt-6">
              {assets ? (
                <AssetTable data={assets} view={params.asset} />
              ) : (
                <div className="h-56 flex items-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
