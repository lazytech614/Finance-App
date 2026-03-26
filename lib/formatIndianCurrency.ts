export function formatIndianCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0.00";

  // Split integer and decimal parts
  const [integerPart, decimalPart] = num.toFixed(2).split(".");

  // Format integer part in Indian system
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formattedInteger = otherNumbers ? formattedOther + "," + lastThree : lastThree;

  return `${formattedInteger}.${decimalPart}`;
}