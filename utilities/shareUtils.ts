
// Example in utilities/shareUtils.ts
export const generateShareLink = (baseURL: string, walletAddress: string | null): string => {
  const uniqueToken = walletAddress ? walletAddress : Math.random().toString(36).substring(7); 
  return `${baseURL}/client-dashboard/${uniqueToken}`;  // Unique link to the client-facing dashboard
};

export const generateQRCode = (link: string) => {
  // You can either return the link directly or modify it to generate a QR code
  return link;
};
  