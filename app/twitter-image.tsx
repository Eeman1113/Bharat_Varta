import OGImage from "./opengraph-image";

// Route segment config — must be inlined (Next won't parse re-exported config).
export const runtime = "nodejs";
export const alt = "Bharat Varta — India's daily wire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OGImage;
