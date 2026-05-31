// Debug the exact login flow for super admin
const API_BASE_URL = 'http://localhost:3000/api';

async function debugSuperAdminLogin() {
  try {
    console.log('=== DEBUGGING SUPER ADMIN LOGIN ===\n');
    
    // Step 1: Test form validation
    const formData = {
      email: 'owner@booksync.com',
      password: 'superadmin123'
    };
    
    console.log('1. Form data:', formData);
    
    // Simulate frontend validation
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    console.log('2. Validation errors:', Object.keys(newErrors).length === 0 ? 'NONE' : newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Login would fail due to validation errors');
      return;
    }
    
    // Step 2: Test actual API call (simulating authService.login)
    console.log('3. Making API call...');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    console.log('4. API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('5. API call failed:', errorText);
      return;
    }
    
    const responseData = await response.json();
    console.log('5. API response data:', responseData);
    
    // Step 3: Test role-based redirect logic
    const userRole = responseData.user.role;
    console.log('6. User role:', userRole);
    
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'OPERATOR') {
      console.log('7. Would redirect to /admin');
    } else {
      console.log('7. Would redirect to /');
    }
    
    // Step 4: Test localStorage operations
    console.log('8. Simulating localStorage operations...');
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData.user));
    
    console.log('9. Login flow completed successfully!');
    console.log('10. Token stored:', localStorage.getItem('token') ? 'YES' : 'NO');
    console.log('11. User stored:', localStorage.getItem('user') ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugSuperAdminLogin();
