import { useAuth } from '../contexts/AuthContext';
import { useApiGet } from './useApi';
import { useBusinessId } from './useBusinessId';
import { SERVICES_CONFIG } from '../configs/services';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export const usePermissions = () => {
  const { businessId, loading: businessLoading } = useBusinessId();
  const { user: globalUser } = useAuth();

  // Fetch roles for the current user in this business
  const { data: roleData, isLoading: roleLoading } = useApiGet<any>(
    ['user-business-role', businessId || ''],
    `${SERVICES_CONFIG.admin.url}/user-business-roles`,
    { businessId, limit: 1 },
    { enabled: !!businessId }
  );

  const loading = businessLoading || roleLoading;

  // 1. Check workspace-specific role from DB
  // Note: apiClient automatically unwraps the response, so roleData is the array of roles
  const roles = Array.isArray(roleData) ? roleData : (roleData as any)?.data || [];
  let userRole: WorkspaceRole = (roles?.[0]?.role?.name?.toLowerCase() || 'viewer') as WorkspaceRole;

  // 2. If the user is a Global Admin (from JWT), elevate their permissions to 'admin'
  // even if they don't have a specific role assigned in this business yet.
  const isGlobalAdmin = 
    globalUser?.roles?.includes('Admin') || 
    globalUser?.role?.toLowerCase() === 'admin' ||
    globalUser?.role === 'Admin' ||
    globalUser?.permissions?.includes('admin');

  if (isGlobalAdmin && userRole === 'viewer') {
    userRole = 'admin';
  }

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';
  const isViewer = userRole === 'viewer';

  const canEdit = isOwner || isAdmin || isEditor;
  const canRegenerate = isOwner || isAdmin || isEditor;
  const canView = true;
  const canExport = true;

  return {
    role: userRole,
    loading,
    isOwner,
    isAdmin,
    isEditor,
    isViewer,
    canEdit,
    canRegenerate,
    canView,
    canExport
  };
};
