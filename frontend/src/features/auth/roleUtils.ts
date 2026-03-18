export function getHomePath(role?: string) {
  switch (role) {
    case 'Admin':
      return '/admin';
    case 'Seller':
      return '/seller';
    default:
      return '/buyer';
  }
}
