import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../user"; // Adjust path accordingly

export const checkUserActiveStatus = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret") as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user || !user.active) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    // Attach user information to req.body (instead of req.user)
    req.body.user = user; // Store user information in req.body
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};