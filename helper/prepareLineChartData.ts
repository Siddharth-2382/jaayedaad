import { THistoricalData, TInterval } from "@/types/types";
import { accumulateLineChartData } from "./lineChartDataAccumulator";

export function prepareLineChartData(
  timeRange: TInterval,
  data: {
    name: string;
    amt: number;
  }[],
  setDataToShow: (
    value: React.SetStateAction<
      | {
          name: string;
          amt: number;
        }[]
      | undefined
    >
  ) => void
) {
  // Calculate start and end dates based on the selected time range
  const today = new Date(data[0].name);

  let startDate: Date, endDate: Date;
  if (data.length === 1) {
    startDate = new Date(data[0].name);
    startDate.setDate(startDate.getDate());
    endDate = today;
  } else if (timeRange === "1d") {
    startDate = new Date(data[1].name);
    startDate.setDate(startDate.getDate());
    endDate = today;
  } else if (timeRange === "1w") {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    endDate = today;
  } else if (timeRange === "1m") {
    startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1);
    endDate = today;
  } else if (timeRange === "1y") {
    startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    endDate = today;
  } else if (timeRange === "All") {
    startDate = new Date(data[data.length - 1].name);
    endDate = today;
  }
  // Fetch data based on the calculated start and end dates
  const fetchedData = data.filter((item) => {
    const itemDate = new Date(item.name);
    return (
      itemDate.getTime() >= startDate.getTime() &&
      itemDate.getTime() <= endDate.getTime()
    );
  });

  // Adjust date format if timeRange is not "1d"
  const formattedData = fetchedData.map((item) => {
    const itemDate = new Date(item.name);
    if (timeRange === "1y") {
      const month = (itemDate.getMonth() + 1).toString().padStart(2, "0");
      const year = itemDate.getFullYear().toString().slice(-2);
      return {
        ...item,
        name: `${month}-${year}`,
      };
    } else {
      const day = itemDate.getDate().toString().padStart(2, "0");
      const month = (itemDate.getMonth() + 1).toString().padStart(2, "0");
      return {
        ...item,
        name: `${day}-${month}`,
      };
    }
  });

  setDataToShow(formattedData.reverse());
}

export const getLineChartData = async (
  historicalData: THistoricalData[]
): Promise<
  {
    interval: string;
    data: {
      name: string;
      amt: number;
      timestamp: number;
    }[];
  }[]
> => {
  const data = accumulateLineChartData(historicalData);
  const intervals = ["1d", "1w", "1m", "1y", "All"];

  const lineChartData = intervals.map((interval) => {
    // Calculate start and end dates based on the selected time range
    const today = new Date(data[0].name);

    let startDate: Date, endDate: Date;
    if (data.length === 1) {
      startDate = new Date(data[0].name);
      startDate.setDate(startDate.getDate());
      endDate = today;
    } else if (interval === "1d") {
      startDate = new Date(data[1].name);
      startDate.setDate(startDate.getDate());
      endDate = today;
    } else if (interval === "1w") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      endDate = today;
    } else if (interval === "1m") {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      endDate = today;
    } else if (interval === "1y") {
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      endDate = today;
    } else if (interval === "All") {
      startDate = new Date(data[data.length - 1].name);
      endDate = today;
    }
    // Fetch data based on the calculated start and end dates
    const fetchedData = data.filter((item) => {
      const itemDate = new Date(item.name);
      return (
        itemDate.getTime() >= startDate.getTime() &&
        itemDate.getTime() <= endDate.getTime()
      );
    });

    // Adjust date format if timeRange is not "1d"
    const formattedData = fetchedData.map((item) => {
      const itemDate = new Date(item.name);
      if (interval === "1y") {
        const month = (itemDate.getMonth() + 1).toString().padStart(2, "0");
        const year = itemDate.getFullYear().toString().slice(-2);
        return {
          ...item,
          name: `${month}-${year}`,
        };
      } else {
        const day = itemDate.getDate().toString().padStart(2, "0");
        const month = (itemDate.getMonth() + 1).toString().padStart(2, "0");
        return {
          ...item,
          name: `${day}-${month}`,
        };
      }
    });

    return { interval: interval, data: formattedData.reverse() };
  });

  return lineChartData;
};
