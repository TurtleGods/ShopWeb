export function getHomePath(role?: string) {
  switch (role) {
    case 'Admin':
      return '/admin';
    default:
      return '/';
  }
}
