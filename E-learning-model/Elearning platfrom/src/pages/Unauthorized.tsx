import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 p-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">403</h1>
          <h2 className="text-2xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this resource. Your current role doesn't have the required permissions.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Dashboard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
