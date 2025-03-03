


import { User } from "../user"; 
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
