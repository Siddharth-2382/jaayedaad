"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Bitcoin,
  CandlestickChart,
  EyeIcon,
  EyeOffIcon,
  Gem,
  Home,
  LandPlot,
  Landmark,
  Plus,
  Shapes,
  SquareStack,
  UserIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Toggle } from "./ui/toggle";
import { useVisibility } from "@/contexts/visibility-context";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import AddTransaction from "./addTransaction";
import { useData } from "@/contexts/data-context";
import jaayedaad_logo from "@/public/jaayedaad_logo.svg";
import Image from "next/image";

function Sidebar() {
  const currentTab = decodeURIComponent(usePathname());
  const { user } = useData();
  const { visible, setVisible } = useVisibility();
  const [open, setOpen] = useState(false);

  const uniqueCategorySet = new Set<string>();
  user?.usersManualCategories.forEach((category) => {
    if (category.assets) {
      category.assets.forEach((asset) => {
        if (+asset.quantity !== 0) {
          uniqueCategorySet.add(asset.type);
        }
      });
    }
  });
  const manualCategoryList = Array.from(uniqueCategorySet);

  return (
    <div className="hidden lg:block py-6 px-4 border-r lg:h-screen w-fit">
      <div className="flex flex-col justify-between lg:h-full xl:h-full">
        <div className="flex flex-col gap-1 text-muted-foreground">
          <Image
            src={jaayedaad_logo}
            alt="Jaayedaad logo"
            className="h-10 mb-2"
          />
          <Button
            asChild
            variant="ghost"
            className={cn(
              `w-full justify-start pr-8`,
              currentTab === "/dashboard" &&
                "bg-secondary text-foreground hover:bg-primary/20"
            )}
          >
            <Link href="/dashboard">
              <Home className="mr-2" size={20} />
              Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className={cn(
              `w-full justify-start pr-8`,
              currentTab === "/dashboard/common stock" &&
                "bg-secondary text-foreground hover:bg-primary/20"
            )}
          >
            <Link href="/dashboard/common stock">
              <CandlestickChart className="mr-2" size={20} />
              Stocks
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className={cn(
              `w-full justify-start pr-8`,
              currentTab === "/dashboard/digital currency" &&
                "bg-secondary text-foreground hover:bg-primary/20"
            )}
          >
            <Link href="/dashboard/digital currency">
              <Bitcoin className="mr-2" size={20} />
              Crypto
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className={cn(
              `w-full justify-start pr-8`,
              currentTab === "/dashboard/mutual fund" &&
                "bg-secondary text-foreground hover:bg-primary/20"
            )}
          >
            <Link href="/dashboard/mutual fund">
              <SquareStack className="mr-2" size={20} />
              Mutual Funds
            </Link>
          </Button>
          {manualCategoryList.map((category) => {
            return (
              <Button
                key={category}
                asChild
                variant="ghost"
                className={cn(
                  `w-full justify-start pr-8`,
                  currentTab === `/dashboard/${category.toLowerCase()}` &&
                    "bg-secondary text-foreground hover:bg-primary/20"
                )}
              >
                <Link href={`/dashboard/${category.toLowerCase()}`}>
                  {category === "Property" ? (
                    <LandPlot className="mr-2" size={20} />
                  ) : category === "Jewellery" ? (
                    <Gem className="mr-2" size={20} />
                  ) : category === "Deposits" ? (
                    <Landmark className="mr-2" size={20} />
                  ) : (
                    <Shapes className="mr-2" size={20} />
                  )}
                  {category.charAt(0).toUpperCase() +
                    category.slice(1).toLowerCase()}
                </Link>
              </Button>
            );
          })}
          <Button
            asChild
            variant="ghost"
            className={cn(
              `w-full justify-start pr-8`,
              currentTab === "/dashboard/settings" &&
                "bg-secondary text-foreground hover:bg-primary/20"
            )}
          >
            <Link href={"/dashboard/settings"}>
              <UserIcon className="mr-2" size={20} /> Settings
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm">{visible ? "Public" : "Private"} mode</p>
            <Toggle onPressedChange={() => setVisible(!visible)}>
              {visible ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeOffIcon className="h-4 w-4" />
              )}
            </Toggle>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="justify-start w-fit xl:pr-8">
                <Plus className="mr-2" size={20} /> Add transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] md:max-w-[50vw] md:max-h-[80vh]">
              <div className="md:flex md:gap-2">
                <DialogTitle>Make transactions</DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Add transactions to your portfolio
                </p>
              </div>
              <AddTransaction handleModalState={setOpen} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
