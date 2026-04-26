import React from "react";

export interface PriceDisplayProps {
  price?: number | null;
  currency?: "USD" | "KHR";
  pricingType?: "FIXED" | "NO_PRICE" | "STARTING_FROM" | "CONTACT_FOR_PRICE";
}

const formatPrice = (price: number, currency: "USD" | "KHR") => {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }
  
  const rounded = Math.round(price);
  return `៛${new Intl.NumberFormat("en-US").format(rounded)}`;
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  currency = "USD",
  pricingType = "FIXED",
}) => {

  const hasPrice = price !== null && price !== undefined && !Number.isNaN(price);

  if (pricingType === "NO_PRICE") {
    return <span className="text-gray-500 text-sm md:text-base font-medium">Price not shown</span>;
  }

  if (pricingType === "CONTACT_FOR_PRICE" || !hasPrice) {
    return <span className="text-blue-600 text-sm md:text-base font-medium">Ask for price</span>;
  }

  const formatted = formatPrice(price as number, currency);

  if (pricingType === "STARTING_FROM") {
    return <span className="text-gray-900 text-sm md:text-base font-semibold">From {formatted}</span>;
  }

  return <span className="text-gray-900 text-sm md:text-base font-semibold">{formatted}</span>;
};

export default PriceDisplay;