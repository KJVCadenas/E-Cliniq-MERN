import { UserRole } from '../../modules/auth/auth.types'; // adjust path as needed

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}
