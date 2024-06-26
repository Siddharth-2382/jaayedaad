"use client";
import React from "react";
import { Button } from "../ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import JaayedaadLogo from "@/public/branding/jaayedaadLogo";
import XLogo from "@/public/branding/XLogo";
import { signIn } from "next-auth/react";

function Footer() {
  return (
    <div className="text-center mt-16 md:mt-16 mb-20 md:mb-10">
      <div className="flex flex-wrap-reverse md:flex-wrap gap-6 justify-center my-8">
        <Button
          variant="outline"
          className="h-12 text-base px-6 rounded-full"
          asChild
        >
          <Link href="https://github.com/jaayedaad/jaayedaad" target="_blank">
            <Github className="mr-2 h-4 w-4 stroke-[#6039B5]" /> GitHub
          </Link>
        </Button>
        <Button
          onClick={() => signIn("google")}
          className="order-last md:order-[0] h-12 text-base px-6 bg-gradient-to-r from-violet-950 to-primary rounded-full"
        >
          Sign Up
        </Button>
        <Button
          variant="outline"
          className="h-12 text-base px-6 rounded-full"
          asChild
        >
          <Link href="https://x.com/jaayedaad" target="_blank">
            <XLogo className="mr-2 h-4 w-4" /> Twitter
          </Link>
        </Button>
      </div>
      <div className="w-full flex justify-center">
        <JaayedaadLogo />
      </div>
    </div>
  );
}

export default Footer;
