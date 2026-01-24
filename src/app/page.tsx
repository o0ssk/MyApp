"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
// تم حذف استدعاء Testimonials من هنا
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";
import { pageTransition } from "@/lib/motion";

export default function LandingPage() {
    return (
        <motion.main
            initial="hidden"
            animate="visible"
            variants={pageTransition}
            className="min-h-screen"
        >
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            {/* تم حذف مكون <Testimonials /> من هنا */}
            <CTABanner />
            <Footer />
        </motion.main>
    );
}