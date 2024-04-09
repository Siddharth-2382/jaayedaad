"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon } from "lucide-react";
import { TAsset, TConversionRates, TInterval, TPreference } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/helper";
import { useEffect, useState } from "react";
import ViewAsset from "./viewAsset";
import { Button } from "./ui/button";
import AssetTableCaption from "./assetTableCaption";
import { useRouter } from "next/navigation";

interface AssetTableProps {
  data: TAsset[];
  view?: string; // "stocks" | "crypto" | "funds" | "property"
  historicalData?: any[];
  isPublic?: boolean;
  timelineInterval?: TInterval;
  intervalChangeData?: {
    category: string;
    symbol: string;
    compareValue: string;
    currentValue: string;
    prevClose: string;
    interval: string;
    unrealisedProfitLoss: string;
  }[];
  conversionRates: TConversionRates;
  preferences: TPreference;
}

function AssetTable({
  data,
  view,
  historicalData,
  isPublic,
  timelineInterval,
  intervalChangeData,
  conversionRates,
  preferences,
}: AssetTableProps) {
  const { defaultCurrency } = preferences;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [assetToView, setAssetToView] = useState<TAsset>();
  const [groupedAsset, setGroupedAsset] = useState<
    {
      category: string;
      currentValue: number;
      compareValue: number;
    }[]
  >();
  const [manualAsset, setManualAsset] = useState<TAsset>();
  const [filteredAsset, setFilteredAsset] = useState<TAsset[]>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const assetTypeMappings: Record<string, string> = {
    "Common Stock": "Stocks",
    "Digital Currency": "Crypto",
    // Add other mappings here
  };

  const filters: Record<string, (asset: TAsset) => boolean> = {
    "common stock": (asset) => asset.category === "Common Stock",
    "digital currency": (asset) => asset.category === "Digital Currency",
    "mutual fund": (asset) => asset.category === "Mutual Fund",
    property: (asset) => asset.category === "Property",
    jewellery: (asset) => asset.category === "Jewellery",
    deposits: (asset) => asset.category === "Deposits",
    others: (asset) => asset.category === "Others",
  };

  useEffect(() => {
    async function fetchData() {
      if (view) {
        if (filters.hasOwnProperty(view)) {
          setFilteredAsset(data.filter(filters[view]));
        } else {
          const param = decodeURIComponent(view);
          setFilteredAsset(
            data?.filter(
              (asset) => asset.category.toUpperCase() === param.toUpperCase()
            )
          );
        }
      } else {
        let groupedAssets: {
          category: string;
          currentValue: number;
          compareValue: number;
        }[] = [];

        const intervalData = intervalChangeData?.filter(
          (data) => data.interval === timelineInterval
        );

        const currentValueSumByType = intervalData?.reduce((acc: any, data) => {
          const { category, currentValue } = data;
          acc[category] = (acc[category] || 0) + parseFloat(currentValue);
          return acc;
        }, {});

        const compareValueSumByType = intervalData?.reduce((acc: any, data) => {
          const { category, compareValue } = data;
          acc[category] = (acc[category] || 0) + parseFloat(compareValue);
          return acc;
        }, {});

        data.forEach((asset) => {
          if (asset.quantity !== "0") {
            const assetCurrency = asset.buyCurrency.toLowerCase();
            const currencyConversion = conversionRates[assetCurrency];
            const multiplier = 1 / currencyConversion;
            const existingType = groupedAssets.find(
              (data) => data.category === asset.category
            );

            if (existingType) {
              existingType.currentValue += asset.currentValue * multiplier;
              existingType.compareValue += asset.compareValue * multiplier;
            } else {
              groupedAssets.push({
                category: asset.category,
                currentValue: asset.symbol
                  ? asset.currentValue * multiplier
                  : asset.currentValue * multiplier,
                compareValue: asset.compareValue * multiplier,
              });
            }
          }
        });
        if (intervalData && intervalData.length > 0) {
          groupedAssets = groupedAssets.map((asset) => ({
            ...asset,
            currentValue:
              currentValueSumByType[asset.category] !== undefined
                ? currentValueSumByType[asset.category]
                : asset.currentValue,
            compareValue:
              compareValueSumByType[asset.category] !== undefined
                ? compareValueSumByType[asset.category]
                : asset.compareValue,
          }));
        }

        setGroupedAsset(groupedAssets);
        setFilteredAsset(data);
      }
    }
    fetchData();
  }, [data, timelineInterval, defaultCurrency]);

  const handleSort = (sortBy: string) => {
    if (!view) {
      if (sortBy === "Invested Amount") {
        setGroupedAsset(
          groupedAsset?.sort((a, b) =>
            sortOrder === "asc"
              ? a.compareValue - b.compareValue
              : b.compareValue - a.compareValue
          )
        );
      } else if (sortBy === "Current Value") {
        setGroupedAsset(
          groupedAsset?.sort((a, b) =>
            sortOrder === "asc"
              ? a.currentValue - b.currentValue
              : b.currentValue - a.currentValue
          )
        );
      } else if (sortBy === "Profit/Loss") {
        setGroupedAsset(
          groupedAsset?.sort((a, b) =>
            sortOrder === "asc"
              ? ((a.currentValue - a.compareValue) * 100) / a.compareValue -
                ((b.currentValue - b.compareValue) * 100) / b.compareValue
              : ((b.currentValue - b.compareValue) * 100) / b.compareValue -
                ((a.currentValue - a.compareValue) * 100) / a.compareValue
          )
        );
      }
    } else {
      if (sortBy === "Quantity") {
        setFilteredAsset(
          filteredAsset?.sort((a, b) =>
            sortOrder === "asc"
              ? +a.quantity - +b.quantity
              : +b.quantity - +a.quantity
          )
        );
      } else if (sortBy === "Invested Value") {
        setFilteredAsset(
          filteredAsset?.sort((a, b) =>
            sortOrder === "asc"
              ? a.compareValue - b.compareValue
              : b.compareValue - a.compareValue
          )
        );
      } else if (sortBy === "Current Value") {
        setFilteredAsset(
          filteredAsset?.sort((a, b) =>
            sortOrder === "asc"
              ? a.currentValue - b.currentValue
              : b.currentValue - a.currentValue
          )
        );
      }
    }
  };

  const handleGroupRowClick = (assetType: string) => {
    router.push(`/dashboard/${assetType.toLowerCase()}`);
  };
  return (
    filteredAsset &&
    filteredAsset.length > 0 && (
      <>
        <Table>
          {!isPublic && <AssetTableCaption preferences={preferences} />}
          <ScrollArea className="w-full lg:h-[30vh]">
            <TableHeader className="bg-secondary sticky top-0">
              {view ? (
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right w-[128px]">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        handleSort("Quantity");
                      }}
                    >
                      {filteredAsset.find(
                        (asset) => asset.category === "DEPOSITS"
                      )
                        ? "Interest rate (%)"
                        : "Quantity"}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right w-[128px]">
                    Avg. Buying Price
                  </TableHead>
                  {filteredAsset[0].symbol !== null && (
                    <TableHead className="text-right w-[128px]">
                      Exchange
                    </TableHead>
                  )}
                  <TableHead className="text-right w-[136px]">
                    {filteredAsset[0].symbol !== null
                      ? "Previous close"
                      : "Last updated price"}
                  </TableHead>
                  <TableHead className="text-right w-[128px]">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        handleSort("Invested Value");
                      }}
                    >
                      Invested Value
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right w-[128px]">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        handleSort("Current Value");
                      }}
                    >
                      Current Value
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              ) : (
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right lg:w-16 xl:w-auto">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        handleSort("Invested Amount");
                      }}
                    >
                      Invested Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        handleSort("Current Value");
                      }}
                    >
                      Current Value
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        handleSort("Profit/Loss");
                      }}
                    >
                      Profit/Loss %
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {view
                ? filteredAsset.map((asset, index) => {
                    return (
                      +asset.quantity > 0 && (
                        <TableRow
                          key={index}
                          className="cursor-pointer"
                          onClick={() => {
                            setOpen(true);
                            asset.symbol !== null
                              ? setAssetToView(asset)
                              : setManualAsset(asset);
                          }}
                        >
                          <TableCell>{asset.name}</TableCell>
                          <TableCell className="text-right px-8">
                            {preferences.dashboardAmountVisibility
                              ? parseFloat(asset.quantity).toLocaleString(
                                  "en-IN"
                                )
                              : "* ".repeat(5)}
                          </TableCell>
                          <TableCell className="text-right">
                            {conversionRates &&
                              parseFloat(
                                (
                                  +asset.buyPrice /
                                  conversionRates[
                                    asset.buyCurrency.toLowerCase()
                                  ]
                                ).toFixed(2)
                              ).toLocaleString("en-IN")}
                          </TableCell>
                          {filteredAsset[0].symbol !== null && (
                            <TableCell className="text-right">
                              {asset.exchange}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            {filteredAsset[0].symbol !== null
                              ? conversionRates &&
                                (
                                  parseFloat(asset.prevClose) /
                                  conversionRates[
                                    asset.buyCurrency.toLowerCase()
                                  ]
                                ).toLocaleString("en-IN")
                              : parseFloat(
                                  filteredAsset[0].currentPrice
                                ).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex flex-col">
                              {preferences.dashboardAmountVisibility
                                ? conversionRates &&
                                  (
                                    asset.compareValue /
                                    conversionRates[
                                      asset.buyCurrency.toLowerCase()
                                    ]
                                  ).toLocaleString("en-IN")
                                : "* ".repeat(5)}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-right px-8 ${
                              +asset.currentValue > +asset.compareValue
                                ? "text-green-400"
                                : +asset.currentValue < +asset.compareValue
                                ? "text-red-400"
                                : ""
                            }`}
                          >
                            <div className="flex flex-col">
                              {preferences.dashboardAmountVisibility
                                ? conversionRates &&
                                  (
                                    asset.currentValue /
                                    conversionRates[
                                      asset.buyCurrency.toLowerCase()
                                    ]
                                  ).toLocaleString("en-IN")
                                : "* ".repeat(5)}
                              {+asset.currentValue > +asset.compareValue ? (
                                <span className="flex items-center justify-end">
                                  (
                                  {(
                                    ((+asset.currentValue -
                                      +asset.compareValue) *
                                      100) /
                                    +asset.compareValue
                                  ).toFixed(2)}
                                  %
                                  <ArrowUpIcon className="h-4 w-4 ml-2" />)
                                </span>
                              ) : +asset.currentValue < +asset.compareValue ? (
                                <span className="flex items-center justify-end">
                                  (
                                  {(
                                    ((+asset.compareValue -
                                      +asset.currentValue) *
                                      100) /
                                    +asset.compareValue
                                  ).toFixed(2)}
                                  %
                                  <ArrowDownIcon className="h-4 w-4 ml-2" />)
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    );
                  })
                : groupedAsset &&
                  groupedAsset.map((asset, index) => {
                    return (
                      <TableRow
                        className="cursor-pointer"
                        onClick={() =>
                          !isPublic &&
                          handleGroupRowClick(
                            assetTypeMappings[asset.category] || asset.category
                          )
                        }
                        key={index}
                      >
                        <TableCell>
                          {assetTypeMappings[asset.category] || asset.category}
                        </TableCell>
                        <TableCell className="text-right px-8">
                          {preferences.dashboardAmountVisibility
                            ? parseFloat(
                                asset.compareValue.toFixed(2)
                              ).toLocaleString("en-IN")
                            : "* ".repeat(5)}
                        </TableCell>
                        <TableCell className="text-right px-8">
                          {preferences.dashboardAmountVisibility
                            ? parseFloat(
                                asset.currentValue.toFixed(2)
                              ).toLocaleString("en-IN")
                            : "* ".repeat(5)}
                          <div
                            className={cn(
                              "flex justify-end items-center",
                              asset.currentValue > asset.compareValue
                                ? "text-green-400"
                                : asset.currentValue < asset.compareValue
                                ? "text-red-400"
                                : "hidden"
                            )}
                          >
                            (
                            {preferences.dashboardAmountVisibility
                              ? (+(
                                  asset.currentValue - asset.compareValue
                                ).toFixed(2)).toLocaleString("en-IN")
                              : "* ".repeat(5)}
                            {asset.currentValue > asset.compareValue ? (
                              <ArrowUpIcon className="h-4 w-4 ml-2" />
                            ) : asset.currentValue < asset.compareValue ? (
                              <ArrowDownIcon className="h-4 w-4 ml-2" />
                            ) : (
                              ""
                            )}
                            )
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right px-8",
                            asset.currentValue > asset.compareValue
                              ? "text-green-400"
                              : asset.currentValue < asset.compareValue
                              ? "text-red-400"
                              : ""
                          )}
                        >
                          <div className="flex justify-end items-center">
                            (
                            {(
                              ((asset.currentValue - asset.compareValue) *
                                100) /
                              asset.compareValue
                            ).toFixed(2)}
                            %
                            {asset.currentValue > asset.compareValue ? (
                              <ArrowUpIcon className="h-4 w-4 ml-2" />
                            ) : asset.currentValue < asset.compareValue ? (
                              <ArrowDownIcon className="h-4 w-4 ml-2" />
                            ) : (
                              ""
                            )}
                            )
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </ScrollArea>
        </Table>
        {historicalData && open && conversionRates && (
          <ViewAsset
            open={open}
            setOpen={setOpen}
            assetToView={assetToView}
            manualAsset={manualAsset}
            historicalData={historicalData}
            conversionRates={conversionRates}
            numberSystem={preferences.numberSystem}
            defaultCurrency={preferences.defaultCurrency}
          />
        )}
      </>
    )
  );
}

export default AssetTable;
