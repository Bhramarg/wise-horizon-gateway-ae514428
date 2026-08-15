import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { verifyToken, AuthContext } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

// Authentication Middleware for protected routes
export const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
};

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

// We will mount routes here
// app.use("/api/v1/students", requireAuth, studentRoutes);

app.listen(PORT, () => {
  console.log(`WISE Backend running on port ${PORT}`);
});
