import { getConversionRate } from "@/services/thirdParty/currency";
import { getPreferenceFromUserId } from "@/services/preference";
import { Separator } from "@/components/ui/separator";
import { getUserByUsername } from "@/services/user";
import { getDeccryptedAssetsByUserId, getAssetsQuoteFromApi } from "@/services/asset";
import { getHistoricalData } from "@/services/thirdParty/twelveData";
import { getUnrealisedProfitLossArray } from "@/helper/unrealisedValueCalculator";
import { calculateRealisedProfitLoss } from "@/helper/realisedValueCalculator";
import React from "react";
import AssetPieChart from "@/components/assetPieChart";
import AssetTable from "@/components/assetTable";
import LoadingSpinner from "@/components/ui/loading-spinner";
import PortfolioLineChart from "@/components/portfolioLineChart";
import PerformanceMetrics from "@/components/performanceMetrics";

export default async function PublicProfile({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);
  if (!user) {
    throw new Error("User not found");
  }

  const preferences = await getPreferenceFromUserId(user.id);
  if (!preferences) {
    throw new Error("Preference not found");
  }
  const conversionRates = await getConversionRate(user.id);
  if (!conversionRates) {
    throw new Error("Conversion rates not found");
  }

  const assets = await getAssetsQuoteFromApi(await getDeccryptedAssetsByUserId(user.id));
  const historicalData = await getHistoricalData(user.id, assets);

  const unrealisedProfitLossArray = getUnrealisedProfitLossArray(
    historicalData,
    assets,
    conversionRates
  );

  const realisedProfitLoss = calculateRealisedProfitLoss(
    assets,
    conversionRates
  ).filter((profitLoss) => profitLoss.interval === "All")[0].realisedProfitLoss;

  const today = new Date();

  // Subtract one day
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return (
    <div className="h-screen">
      {preferences.publicVisibility ? (
        <div className="h-full">
          {preferences && (
            <div className="grid grid-cols-5 grid-rows-7 h-full gap-6 p-6">
              {preferences.showHoldingsInPublic && (
                <div className="col-span-2 row-span-3 bg-[#171326] shadow-2xl border rounded-xl p-6">
                  <AssetPieChart
                    view="dashboard"
                    assets={assets}
                    dashboardAmountVisibility={
                      preferences.dashboardAmountVisibility
                    }
                    numberSystem={preferences.numberSystem}
                    defaultCurrency={preferences.defaultCurrency}
                    conversionRates={conversionRates}
                  />
                </div>
              )}
              {/* Performance */}
              {preferences.showMetricsInPublic && (
                <div className="col-span-3 row-span-3 bg-[#171326] shadow-2xl border rounded-xl p-6">
                  {historicalData ? (
                    historicalData.length ? (
                      <PortfolioLineChart
                        data={historicalData}
                        view="dashboard"
                        timeInterval="All"
                        dashboardAmountVisibility={
                          preferences.dashboardAmountVisibility
                        }
                        numberSystem={preferences.numberSystem}
                        defaultCurrency={preferences.defaultCurrency}
                      />
                    ) : (
                      <div>
                        <h3 className="font-semibold">Portfolio Performance</h3>
                        <p className="text-muted-foreground text-xs xl:text-sm">
                          Insight into your portfolio&apos;s value dynamics
                        </p>
                        <div className="h-40 flex items-center justify-center">
                          You don&apos;t own any assets yet
                        </div>
                      </div>
                    )
                  ) : (
                    <div>
                      <h3 className="font-semibold">Portfolio Performance</h3>
                      <p className="text-muted-foreground text-xs xl:text-sm">
                        Insight into your portfolio&apos;s value dynamics
                      </p>
                      <div className="h-40 flex items-center">
                        <LoadingSpinner />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Asset Table */}
              {preferences.showHoldingsInPublic && (
                <div className="col-span-3 row-span-4 bg-[#171326] shadow-2xl border rounded-xl p-6">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <h3 className="font-semibold">Asset Overview</h3>
                      <p className="text-muted-foreground text-xs xl:text-sm">
                        Collection of your assets
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-end text-xs xl:text-sm">
                        As on ({yesterday.toLocaleDateString("en-GB")})
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <AssetTable
                      data={assets}
                      isPublic
                      conversionRates={conversionRates}
                      preferences={preferences}
                    />
                  </div>
                </div>
              )}
              {/* Metrics */}
              {preferences.showMetricsInPublic && (
                <div className="col-span-2 row-span-4 bg-[#171326] shadow-2xl border rounded-xl p-6">
                  <h3 className="font-semibold">Performance Metrics</h3>
                  <p className="text-muted-foreground text-xs xl:text-sm">
                    Analyze investment performance
                  </p>

                  <PerformanceMetrics
                    assets={assets}
                    realisedProfitLoss={realisedProfitLoss}
                    unrealisedProfitLossArray={unrealisedProfitLossArray}
                    timeInterval="All"
                    dashboardAmountVisibility={
                      preferences.dashboardAmountVisibility
                    }
                    numberSystem={preferences.numberSystem}
                    defaultCurrency={preferences.defaultCurrency}
                    conversionRates={conversionRates}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="flex gap-6 h-20 items-center">
            <h1 className="text-4xl font-mona-sans">404</h1>
            <Separator orientation="vertical" className="bg-primary/50" />
            <h1 className="text-4xl font-mona-sans">No such user exist!</h1>
          </div>
        </div>
      )}
    </div>
  );
}
