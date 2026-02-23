import { AlertCircle, CheckCircle, Lock, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/context/AuthContext';
import { UserRole } from '@/lib/permissions';

interface AuthAlertProps {
  type: 'unauthorized' | 'insufficient_permissions' | 'session_expired' | 'access_denied' | 'info';
  message?: string;
  action?: string;
  requiredRole?: UserRole;
  currentUser?: User | null;
}

/**
 * Component to display authorization-related alerts
 */
export const AuthAlert = ({
  type,
  message,
  action,
  requiredRole,
  currentUser,
}: AuthAlertProps) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'unauthorized':
        return {
          icon: LogIn,
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-500',
          title: 'Authentication Required',
          message: message || 'You must log in to perform this action.',
        };
      case 'insufficient_permissions':
        return {
          icon: Lock,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-800',
          borderColor: 'border-red-500',
          title: 'Permission Denied',
          message:
            message ||
            `This action requires ${requiredRole ? requiredRole + ' ' : ''}privileges. Your current role is ${currentUser?.role || 'unknown'}.`,
        };
      case 'session_expired':
        return {
          icon: AlertCircle,
          bgColor: 'bg-amber-500/10',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-500',
          title: 'Session Expired',
          message: message || 'Your session has expired. Please log in again.',
        };
      case 'access_denied':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-800',
          borderColor: 'border-red-500',
          title: 'Access Denied',
          message:
            message || `You do not have permission to ${action || 'perform this action'}.`,
        };
      case 'info':
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-500',
          title: 'Information',
          message: message || 'Please note the following information.',
        };
    }
  };

  const config = getAlertConfig();
  const IconComponent = config.icon;

  return (
    <Alert className={`${config.borderColor} ${config.bgColor}`}>
      <div className="flex gap-3">
        <IconComponent className={`h-5 w-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor}`}>{config.title}</h3>
          <AlertDescription className={config.textColor}>{config.message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default AuthAlert;
