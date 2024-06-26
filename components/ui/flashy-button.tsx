import React from "react";
import { Button as AnimatedButton } from "./moving-border";
import { Button } from "./button";
import { cn } from "@/lib/helper";

type FlashyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  containerClassName?: string;
  notActive?: boolean;
};

function FlashyButton({
  children,
  className,
  containerClassName,
  notActive = false,
  ...props
}: FlashyButtonProps) {
  return !notActive ? (
    <AnimatedButton
      {...props}
      duration={3000}
      containerClassName={cn("h-[42px] w-auto", containerClassName)}
      className={cn(
        "h-10 font-medium px-4 py-2 border-0 bg-gradient-to-r from-[#1a1a1a] to-[#292929] opacity-90",
        className
      )}
    >
      {children}
    </AnimatedButton>
  ) : (
    <Button
      variant="ghost"
      className="rounded-full text-zinc-400 hover:bg-violet-950/40"
      {...props}
    >
      {children}
    </Button>
  );
}

export default FlashyButton;
