"use client";
import AssetPieChart from "@/components/assetPieChart";
import AssetTable from "@/components/assetTable";
import ChangeInterval, { Interval } from "@/components/changeInterval";
import PerformanceMetrics from "@/components/performanceMetrics";
import PortfolioLineChart from "@/components/portfolioLineChart";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useCurrency } from "@/contexts/currency-context";
import { useData } from "@/contexts/data-context";
import {
  ProfitLoss,
  calculateRealisedProfitLoss,
} from "@/helper/realisedValueCalculator";
import { getUnrealisedProfitLossArray } from "@/helper/unrealisedValueCalculator";
import { useEffect, useState } from "react";
import jaayedaad_logo from "@/public/jaayedaad_logo.svg";
import Image from "next/image";

function Dashboard() {
  const { conversionRates } = useCurrency();
  const [realisedProfitLoss, setRealisedProfitLoss] = useState<string>();
  const [timeInterval, setTimeInterval] = useState<Interval>("All");
  const [unrealisedProfitLossArray, setUnrealisedProfitLossArray] = useState<
    {
      type: string;
      symbol: string;
      compareValue: string;
      currentValue: string;
      prevClose: string;
      interval: string;
      unrealisedProfitLoss: string;
    }[]
  >();
  const [realisedProfitLossArray, setRealisedProfitLossArray] =
    useState<ProfitLoss[]>();
  const { assets, historicalData } = useData();

  useEffect(() => {
    if (assets && conversionRates) {
      if (historicalData?.length) {
        const unrealisedResults = getUnrealisedProfitLossArray(
          historicalData,
          assets,
          conversionRates
        );
        setUnrealisedProfitLossArray(unrealisedResults);
      }
      const realisedProfitLossResults = calculateRealisedProfitLoss(
        assets,
        conversionRates
      );
      if (timeInterval === "All") {
        setRealisedProfitLoss(
          realisedProfitLossResults.filter(
            (profitLoss) => profitLoss.interval === "All"
          )[0].realisedProfitLoss
        );
      }
      setRealisedProfitLossArray(realisedProfitLossResults);
    }
  }, [assets, timeInterval, historicalData, conversionRates]);

  // Get today's date
  const today = new Date();

  // Subtract one day
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const onChange = (value: Interval) => {
    setTimeInterval(value);
    const profitLoss = realisedProfitLossArray?.filter(
      (profitLoss) => profitLoss.interval === value
    )[0].realisedProfitLoss;
    setRealisedProfitLoss(profitLoss);
  };

  return assets ? (
    <div className="px-6 sm:px-8 pt-6 pb-20 md:pb-24 lg:py-6 w-full lg:h-screen xl:h-screen flex flex-col">
      <div className="inline-flex justify-between lg:justify-end items-center">
        <Image
          src={jaayedaad_logo}
          alt="Jaayedaad logo"
          className="h-10 lg:hidden"
        />
        <ChangeInterval onChange={onChange} />
      </div>
      <div className="min-h-[85vh] h-full mt-4">
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-6 lg:gap-4 lg:grid lg:grid-rows-7 lg:grid-cols-3 lg:h-full text-foreground">
          {/* Asset distribution pie chart */}
          <div className="col-span-1 row-span-3 bg-card border rounded-xl p-4">
            <AssetPieChart view="dashboard" />
          </div>
          {/* Portfolio line chart */}
          <div className="col-span-2 row-span-3 bg-card border rounded-xl p-4">
            {historicalData ? (
              historicalData.length ? (
                <PortfolioLineChart
                  data={historicalData}
                  view="dashboard"
                  timeInterval={timeInterval}
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
          {/* Asset Table */}
          <div className="col-span-2 row-span-4 bg-card border rounded-xl p-4">
            <div className="flex justify-between">
              <div className="xl:flex xl:items-center xl:gap-1">
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
              {assets ? (
                <AssetTable
                  data={assets}
                  timelineInterval={timeInterval}
                  intervalChangeData={unrealisedProfitLossArray}
                />
              ) : (
                <div className="h-64 flex items-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
          {/* Performance metrics */}
          <div className="col-span-1 row-span-4 bg-card border rounded-xl p-4 mb-4 md:mb-6 lg:mb-0">
            <h3 className="font-semibold">Performance Metrics</h3>
            <p className="text-muted-foreground text-xs xl:text-sm">
              Analyze investment performance
            </p>
            {assets && unrealisedProfitLossArray ? (
              <PerformanceMetrics
                assets={assets}
                realisedProfitLoss={realisedProfitLoss}
                unrealisedProfitLossArray={unrealisedProfitLossArray}
                timeInterval={timeInterval}
              />
            ) : (
              <div className="h-72 w-full flex items-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center gap-2 w-full h-auto">
      <LoadingSpinner />
      <div>Loading your dashboard...</div>
    </div>
  );
}

export default Dashboard;
