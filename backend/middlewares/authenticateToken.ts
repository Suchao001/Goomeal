import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

interface CustomRequest extends Request {
    user?: JwtPayload | string;
}

const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }
    if (!jwtSecret) {
        return res.status(500).json({ message: 'JWT secret not configured' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({ message: 'Token has expired' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authenticateToken;
