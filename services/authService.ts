
import { User, UserPlan } from '../types';

const USERS_KEY = 'malawi_bank_users';
const SESSION_KEY = 'malawi_bank_session';

// Simulate API delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Get all users from local storage (Mock Database)
  getUsers: (): any[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  // Get current session
  getCurrentUser: async (): Promise<User | null> => {
    // Simulate network check
    await delay(500);
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // Register
  signUp: async (email: string, password: string, name: string): Promise<User> => {
    await delay(1000); 

    const users = authService.getUsers();
    
    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("This email is already registered.");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      plan: 'FREE'
    };

    // Store user with password (mock db)
    const dbEntry = { ...newUser, password }; 
    const updatedUsers = [...users, dbEntry];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    // Set Session
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  // Login
  signIn: async (email: string, password: string): Promise<User> => {
    await delay(1000);

    const users = authService.getUsers();
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      subscription: user.subscription
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  // Logout
  signOut: async () => {
    await delay(500);
    localStorage.removeItem(SESSION_KEY);
  },

  // Mock Password Reset
  resetPassword: async (email: string): Promise<void> => {
    await delay(1000);
    const users = authService.getUsers();
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    // In a real app, we wouldn't reveal if the email exists for security, 
    // but for this mock we'll just succeed if the format is valid.
    if (!email.includes('@')) {
        throw new Error("Invalid email address.");
    }
    
    // Logic to send email would go here
    return;
  },

  // Update Plan with Subscription (Simulate Payment Gateway Webhook)
  updateUserPlan: async (userId: string, plan: UserPlan, paymentMethod?: string): Promise<User> => {
    await delay(1500); // Simulate payment verification delay
    const users = authService.getUsers();
    
    // Logic: Calculate next billing date (30 days from now)
    const nextBillingDate = Date.now() + (30 * 24 * 60 * 60 * 1000); 

    const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
            return { 
              ...u, 
              plan,
              subscription: plan === 'PRO' && paymentMethod ? {
                method: paymentMethod,
                status: 'ACTIVE',
                nextBillingDate: nextBillingDate
              } : undefined
            };
        }
        return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    // Update session if it matches the current user
    let updatedUserResult: User | null = null;
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
        const sessionUser = JSON.parse(sessionStr);
        if (sessionUser.id === userId) {
            updatedUserResult = { 
              ...sessionUser, 
              plan,
              subscription: plan === 'PRO' && paymentMethod ? {
                method: paymentMethod,
                status: 'ACTIVE',
                nextBillingDate: nextBillingDate
              } : undefined 
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUserResult));
        }
    }
    
    if (!updatedUserResult) {
         const user = updatedUsers.find((u: any) => u.id === userId);
         updatedUserResult = { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            plan: user.plan,
            subscription: user.subscription
          };
    }
    
    return updatedUserResult;
  }
};
