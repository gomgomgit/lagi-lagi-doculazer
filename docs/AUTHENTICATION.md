# Authentication System Documentation

## Overview
Sistem autentikasi aplikasi menggunakan Vue Router navigation guards untuk membatasi akses ke route berdasarkan status login dan role user.

## Cara Kerja

### 1. Meta Properties pada Routes
Setiap route dapat memiliki meta properties untuk mengatur akses:

```javascript
{
  path: '/dashboard',
  component: Dashboard,
  meta: {
    requiresAuth: true,        // Hanya user yang sudah login
    requiresGuest: true,       // Hanya user yang belum login  
    requiresAdmin: true,       // Hanya admin
    title: 'Dashboard'         // Title halaman
  }
}
```

### 2. Navigation Guards
Router menggunakan `beforeEach` guard untuk mengecek setiap navigasi:

- **requiresAuth**: Redirect ke `/login` jika belum login
- **requiresGuest**: Redirect ke `/` jika sudah login  
- **requiresAdmin**: Cek role admin (implementasi bisa disesuaikan)

### 3. Auth Store Integration
Navigation guard menggunakan Pinia auth store untuk cek status:

```javascript
const authStore = useAuthStore()
if (requiresAuth && !authStore.isAuthenticated) {
  // Redirect to login
}
```

## Penggunaan

### Melindungi Route Authenticated
```javascript
{
  path: '/profile',
  component: ProfileView,
  meta: {
    requiresAuth: true
  }
}
```

### Route Khusus Guest (Login/Register)
```javascript
{
  path: '/login',
  component: LoginView,
  meta: {
    requiresGuest: true
  }
}
```

### Route Khusus Admin
```javascript
{
  path: '/admin',
  component: AdminLayout,
  meta: {
    requiresAuth: true,
    requiresAdmin: true
  }
}
```

### Redirect After Login
Navigation guard menyimpan intended destination:

```javascript
// User tries to access /profile while not logged in
// Redirected to: /login?redirect=/profile

// After successful login, redirect back to /profile
if (route.query.redirect) {
  router.push(route.query.redirect)
} else {
  router.push('/')
}
```

## Logout Process

### 1. Di Component
```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/login')
  }
}
```

### 2. Auth Store Logout Method
```javascript
const logout = async () => {
  try {
    // Call API logout endpoint
    await authAPI.logout()
  } finally {
    // Clear local data regardless of API call result
    setToken(null)
    setUser(null)
  }
}
```

## Advanced Usage

### Custom Permission Check
```javascript
// In middleware/auth.js
export const hasPermission = (permission) => {
  const authStore = useAuthStore()
  return authStore.user?.permissions?.includes(permission)
}

// In route meta
meta: {
  requiresAuth: true,
  requiredPermission: 'edit_users'
}

// In navigation guard
if (to.meta.requiredPermission) {
  if (!hasPermission(to.meta.requiredPermission)) {
    next({ name: 'unauthorized' })
    return
  }
}
```

### Role-based Access
```javascript
// Check multiple roles
meta: {
  requiresAuth: true,
  allowedRoles: ['admin', 'moderator']
}

// In navigation guard
if (to.meta.allowedRoles) {
  const userRole = authStore.user?.role
  if (!to.meta.allowedRoles.includes(userRole)) {
    next({ name: 'unauthorized' })
    return
  }
}
```

## Error Handling

### Token Expiry
```javascript
// In API interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### Network Errors
```javascript
// Graceful degradation
const checkAuthStatus = async () => {
  try {
    await authAPI.verifyToken()
  } catch (error) {
    // If token verification fails, logout
    authStore.logout()
  }
}
```

## Security Best Practices

1. **Token Storage**: Tokens disimpan di localStorage, pertimbangkan httpOnly cookies untuk produksi
2. **HTTPS Only**: Pastikan produksi menggunakan HTTPS
3. **Token Expiry**: Implementasikan refresh token untuk keamanan yang lebih baik
4. **Route Validation**: Selalu validasi di backend, frontend guard hanya untuk UX
5. **Sensitive Data**: Jangan simpan data sensitif di client-side store

## Debugging

Enable debugging dengan menambahkan console.log di navigation guard:

```javascript
router.beforeEach((to, from, next) => {
  console.log('Navigation Guard Debug:', {
    to: to.path,
    requiresAuth: to.matched.some(record => record.meta.requiresAuth),
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user
  })
  // ... rest of guard logic
})
```