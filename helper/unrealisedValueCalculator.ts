import { Asset } from "@/actions/getAssetsAction";
import { calculateTotalQuantity } from "./transactionValueCalculator";

type AssetHistory = {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    mic_code: string;
    type: string;
  };
  values: {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    previous_close: string;
    date: number;
    value: number;
  }[];
  status: string;
  assetType: string;
  assetSymbol: string;
};

// Function to calculate unrealized profit/loss for each asset
export function calculateUnrealisedProfitLoss(assets: Asset[]) {
  const value = (
    +assets?.reduce((acc, asset) => acc + (asset.currentValue || 0), 0) -
    +assets?.reduce((acc, asset) => acc + (asset.compareValue || 0), 0)
  ).toFixed(2);

  return parseFloat(value);
}

export function getUnrealisedProfitLossArray(
  historicalData: AssetHistory[],
  assets: Asset[],
  conversionRate: string
) {
  const results: {
    type: string;
    currentValue: string;
    prevClose: string;
    interval: string;
    unrealisedProfitLoss: string;
  }[] = [];

  const intervals = [
    { label: "1d", days: 1 },
    { label: "1w", days: 7 },
    { label: "1m", days: 30 },
    { label: "1y", days: 365 },
  ];

  intervals.forEach(({ label, days }) => {
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - days);

    assets.forEach((asset, index) => {
      const transactions = asset.transactions.filter(
        (transaction) => new Date(transaction.date) <= pastDate
      );

      const quantityTillInterval = calculateTotalQuantity(transactions);

      if (asset.symbol) {
        const assetHistory = historicalData.filter(
          (history) => history.assetSymbol === asset.symbol
        );

        const populatedHistory = populateMissingDates(assetHistory[0]);
        const valueOfInterval = populatedHistory.values.filter((value) => {
          return (
            new Date(pastDate).getTime() / 1000 < new Date(value.date).getTime()
          );
        });

        const result = {
          type: asset.type,
          currentValue: (
            parseFloat(valueOfInterval[0].close) *
            quantityTillInterval *
            (asset.buyCurrency === "USD" ? +conversionRate : 1)
          ).toFixed(2),
          prevClose: valueOfInterval[0].close,
          interval: label,
          unrealisedProfitLoss: (
            (parseFloat(valueOfInterval[0].close) -
              parseFloat(asset.buyPrice)) *
            quantityTillInterval *
            (asset.buyCurrency === "USD" ? +conversionRate : 1)
          ).toFixed(2),
        };

        results.push(result);
      }
    });
  });

  return results;
}

function populateMissingDates(rawData: AssetHistory) {
  // Extract the values array from raw data
  const values = rawData.values.sort((a, b) => a.date - b.date);

  // Iterate through the values array to identify missing dates
  for (let i = 1; i < values.length; i++) {
    const currentDate = new Date(values[i].datetime);
    const previousDate = new Date(values[i - 1].datetime);

    // Calculate the difference in days between current and previous dates
    const dayDiff =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);

    // If there is a gap of more than 1 day, populate missing dates
    if (dayDiff > 1) {
      for (let j = 1; j < dayDiff; j++) {
        const missingDate = new Date(previousDate);
        missingDate.setDate(previousDate.getDate() + j);

        // Create a new data object using data from the previous date
        const newData = {
          datetime: missingDate.toISOString().slice(0, 10), // Format date as YYYY-MM-DD
          open: values[i - 1].open,
          high: values[i - 1].high,
          low: values[i - 1].low,
          close: values[i - 1].close,
          volume: values[i - 1].volume,
          previous_close: values[i - 1].previous_close,
          date: Math.floor(missingDate.getTime() / 1000), // Convert date to timestamp
          value: values[i - 1].value,
        };

        // Insert the new data object into the values array at the appropriate position
        values.splice(i + (j - 1), 0, newData);
      }
    }
  }

  // Update rawData with the modified values array
  rawData.values = values.sort((a, b) => a.date - b.date);

  return rawData;
}
