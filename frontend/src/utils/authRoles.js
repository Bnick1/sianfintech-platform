export const USER_ROLES = {
  SIAN_ADMIN: 'sian_admin',
  SIAN_STAFF: 'sian_staff',
  TENANT_ADMIN: 'tenant_admin',
  TENANT_STAFF: 'tenant_staff',
  MEMBER: 'member'
};

export const ROUTE_PERMISSIONS = {
  '/admin/*': ['sian_admin'],
  '/staff/*': ['sian_staff', 'tenant_staff', 'tenant_admin'],
  '/member/*': ['member'],
  '/tenant/*': ['tenant_admin', 'tenant_staff'],
  '/apply': ['*']
};

export const canAccess = (userRole, path) => {
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (path.match(new RegExp(route.replace('*', '.*')))) {
      return roles.includes('*') || roles.includes(userRole);
    }
  }
  return false;
};