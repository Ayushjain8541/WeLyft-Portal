import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { storage } from './storage';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// TypeScript session declaration
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Simple session-based authentication
export function setupSimpleAuth(app: Express) {

  // Session middleware
  app.use(session({
    secret: 'visualization-tool-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
  }));

  // Login route
  app.post('/api/login', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if user exists first
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      
      let user;
      
      if (existingUsers.length > 0) {
        // Use existing user
        user = existingUsers[0];
        console.log('Using existing user:', user.id);
      } else {
        // Create new user with unique ID based on email
        const userId = `user-${Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}-${Date.now()}`;
        
        // Create new user
        user = await db
          .insert(users)
          .values({
            id: userId,
            email,
            role: 'user',
            firstName: 'Demo',
            lastName: 'User',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
          .then(users => users[0]);
        
        console.log('Created new user:', user.id);
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      // Save session
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        // Return user info
        return res.json({
          id: user.id,
          email: user.email,
          role: user.role || 'user',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
        });
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed', error: error.message || 'Unknown error' });
    }
  });
  
  // Logout route
  app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      
      res.redirect('/');
    });
  });
  
  // Current user route
  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
      });
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
}