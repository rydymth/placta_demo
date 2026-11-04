import { Request, Response } from "express"

// Req needed to load in appuse
export const getHealth = (req: Request, res: Response): void => {
    res.status(200).json({ status: 'OK', message: 'API backend working OK' });
};
