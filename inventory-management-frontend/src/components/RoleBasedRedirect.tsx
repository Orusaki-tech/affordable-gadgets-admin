import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService } from '../api/index';

export const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  const { data: adminProfile, isLoading } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user?.is_staff,
  });

  // Check if this is the first login for Marketing Manager
  useEffect(() => {
    if (adminProfile && !hasRedirected) {
      const isSuperuser = adminProfile?.user?.is_superuser === true;
      const hasRole = (roleName: string) => {
        if (isSuperuser) return true;
        if (!adminProfile?.roles) return false;
        return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
      };
      const isMarketingManager = hasRole('MM') && !isSuperuser;
      
      if (isMarketingManager) {
        const hasRedirectedBefore = localStorage.getItem('marketing_manager_redirected');
        if (!hasRedirectedBefore) {
          localStorage.setItem('marketing_manager_redirected', 'true');
          setHasRedirected(true);
        }
      }
    }
  }, [adminProfile, hasRedirected]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const isSuperuser = adminProfile?.user?.is_superuser === true;

  const hasRole = (roleName: string) => {
    if (isSuperuser) return true;
    if (!adminProfile?.roles) return false;
    return adminProfile.roles.some((role) => role.name === roleName || role.role_code === roleName);
  };

  const isSalesperson = hasRole('SP') && !isSuperuser;
  const isContentCreator = hasRole('CC') && !isSuperuser;
  const isMarketingManager = hasRole('MM') && !isSuperuser;

  // Check if Marketing Manager has been redirected before (first login only)
  const marketingManagerFirstLogin = isMarketingManager && !localStorage.getItem('marketing_manager_redirected');

  // Redirect based on role
  if (isContentCreator) {
    return <Navigate to="/content-creator/dashboard" replace />;
  }
  if (isSalesperson) {
    return <Navigate to="/products" replace />;
  }
  if (marketingManagerFirstLogin) {
    return <Navigate to="/products" replace />;
  }
  // Default to main dashboard for Inventory Managers and Superusers
  return <Navigate to="/dashboard" replace />;
};


