"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import TransactionForm from "./transactionForm";
import { cn } from "@/lib/helper";
import { TTwelveDataResult } from "@/lib/types";
import { getAssetQuoteFromApiBySymbol } from "@/services/thirdParty/twelveData";

type searchResultProps = {
  results: TTwelveDataResult[];
  handleModalState: React.Dispatch<React.SetStateAction<boolean>>;
  defaultCurrency: string;
};

const SearchResults = ({
  results,
  handleModalState,
  defaultCurrency,
}: searchResultProps) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<TTwelveDataResult>();
  const [assetPreviousClose, setAssetPreviousClose] = useState<string>("0");

  const handleAddClick = async (result: TTwelveDataResult) => {
    const assetQuote = await getAssetQuoteFromApiBySymbol(result.symbol);
    const assetPreviousClose = Number(assetQuote.previous_close);
    setAssetPreviousClose(assetPreviousClose.toFixed(2));
    setShowForm(true);
    setSelectedAsset(result);
  };

  return results.length > 0 && !showForm ? (
    <ScrollArea className={cn("mb-4", showForm ? "h-[16vh]" : "h-[24vh]")}>
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px] text-right">Exchange</TableHead>
            <TableHead className="w-[100px] text-right">Symbol</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-y-hidden">
          {results.map((result, index) => {
            return (
              result.instrument_name && (
                <TableRow key={index}>
                  <TableCell>{result?.instrument_name}</TableCell>
                  <TableCell className="text-right">
                    {result?.exchange}
                  </TableCell>
                  <TableCell className="text-right">{result?.symbol}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleAddClick(result)}
                      className="w-full"
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              )
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  ) : (
    selectedAsset && (
      <TransactionForm
        previousClose={assetPreviousClose}
        selectedAsset={selectedAsset}
        modalOpen={handleModalState}
        defaultCurrency={defaultCurrency}
      />
    )
  );
};

export default SearchResults;
