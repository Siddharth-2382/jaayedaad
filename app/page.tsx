import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import ClaimUsername from "@/components/landing/claim-username";
import React from "react";
import ProductShowcase from "@/components/landing/productShowcase";
import Features from "@/components/landing/features";
import Supporters from "@/components/landing/supporters";
import Footer from "@/components/landing/footer";
import StickyNavbarTabs from "@/components/landing/stickyNavbarTabs";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <TracingBeam>
        <div
          id="home"
          className="section min-h-screen font-mona-sans bg-background"
        >
          <div
            id="sticky-Nav"
            className="z-10 bottom-4 md:bottom-auto fixed md:absolute md:top-8 left-1/2 -translate-x-1/2"
          >
            <StickyNavbarTabs />
          </div>
          <Navbar userSignedIn={session?.user} />
          <div className="w-full dark:bg-background bg-white dark:bg-grid-[#2F2F36] bg-grid-[#2F2F36] relative">
            <div className="z-2 absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-background bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_10%,hsl(var(--background))_60%)]"></div>
            <div className="p-6 pt-20 md:p-8 md:pb-36 md:pt-32 relative z-3">
              <Hero />
              <ClaimUsername />
            </div>
          </div>
          <ProductShowcase />
          <div className="px-4 md:px-8">
            <Features />
            <Supporters />
            <Footer />
          </div>
        </div>
      </TracingBeam>
    </>
  );
}

export default Home;
