import { CorsOptions } from "cors";

const whitelist: string[] = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://www.google.com",
  "https://api-medimap.onrender.com",
  "https://medimap-pharmacy.vercel.app",
  "https://medimap-admin.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

export default corsOptions;
