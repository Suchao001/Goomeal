import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

interface CustomRequest extends Request {
    user?: JwtPayload | string;
}

const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
 
    
    // Check for token in Authorization header first, then cookies
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies.authToken;
    
    
        
    if (!token) {
        console.log('No token provided');
        res.status(401).json({ message: 'Access denied - No token provided' });
        return;
    }
    if (!jwtSecret) {
        console.log('JWT secret not configured');
        res.status(500).json({ message: 'JWT secret not configured' });
        return;
    }
    try {
        console.log('=== AUTHENTICATING TOKEN ===');
        console.log('Token received:', token.substring(0, 20) + '...');
        
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        console.log('Decoded token payload:', decoded);
        
        const currentTime = Math.floor(Date.now() / 1000);
        console.log('Current time:', currentTime, 'Token exp:', decoded.exp);
       
        if (decoded.exp && decoded.exp < currentTime) {
            console.log('TOKEN EXPIRED');
            res.status(401).json({ message: 'Token has expired' });
            return;
        }
        
        req.user = decoded;
        console.log('User set on request:', req.user);
        console.log('=== TOKEN AUTH SUCCESS ===');
        next();
    } catch (error) {
        console.log('=== TOKEN AUTH FAILED ===');
        console.log('Token verification failed:', error);
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

export default authenticateToken;
