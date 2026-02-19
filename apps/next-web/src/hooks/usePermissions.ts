import { useAuth } from '../contexts/AuthContext';
import { useApiGet } from './useApi';
import { useBusinessId } from './useBusinessId';
import { SERVICES_CONFIG } from '../configs/services';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export const usePermissions = () => {
  const { businessId, loading: businessLoading } = useBusinessId();
  const { user: globalUser } = useAuth();

  // Fetch roles for the current user in this business without limit
  const { data: roleData, isLoading: roleLoading } = useApiGet<any>(
    ['user-business-role', businessId || ''],
    `${SERVICES_CONFIG.admin.url}/user-business-roles`,
    { businessId }, // Removed limit: 1 to get ALL roles
    { enabled: !!businessId }
  );

  const loading = businessLoading || roleLoading;

  // 1. Check workspace-specific role from DB
  // Note: apiClient automatically unwraps the response, so roleData is the array of roles
  const rolesRaw = Array.isArray(roleData) ? roleData : (roleData as any)?.data || [];

  // Map roles to permission levels (higher is better)
  const roleLevels: Record<string, number> = {
    'owner': 4,
    'admin': 3,
    'editor': 2,
    'manager': 2, // Manager = Editor level
    'viewer': 1
  };

  let maxLevel = 0;
  let userRole: WorkspaceRole = 'viewer';

  // Iterate through all roles to find the highest permission
  if (rolesRaw && rolesRaw.length > 0) {
    rolesRaw.forEach((r: any) => {
      const roleName = r.role?.name?.toLowerCase() || 'viewer';
      const level = roleLevels[roleName] || 1;

      if (level > maxLevel) {
        maxLevel = level;

        // Map manager to editor for the type system
        if (roleName === 'manager') {
          userRole = 'editor';
        } else if (['owner', 'admin', 'editor', 'viewer'].includes(roleName)) {
          userRole = roleName as WorkspaceRole;
        }
      }
    });
  }

  // 2. If the user is a Global Admin (from JWT), elevate their permissions to 'admin'
  // even if they don't have a specific role assigned in this business yet.
  const isGlobalAdmin =
    globalUser?.roles?.includes('Admin') ||
    globalUser?.role?.toLowerCase() === 'admin' ||
    globalUser?.role === 'Admin' ||
    globalUser?.permissions?.includes('admin');

  if (isGlobalAdmin && maxLevel < 3) {
    maxLevel = 3;
    userRole = 'admin';
  }

  // Use numeric levels for robust permission checks
  const isOwner = maxLevel >= 4;
  const isAdmin = maxLevel >= 3;
  const isEditor = maxLevel >= 2; // Includes 'manager' logic
  const isViewer = maxLevel >= 1;

  const canEdit = isEditor;
  const canRegenerate = isEditor;
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
