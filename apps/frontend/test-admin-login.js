// Test both admin logins to see which one works
const API_BASE_URL = 'http://localhost:3000/api';

async function testAdminLogins() {
  try {
    console.log('Testing admin logins...\n');
    
    // Test regular admin login
    console.log('1. Testing regular admin login...');
    const adminResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@booksync.com',
        password: 'admin123'
      })
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('Regular admin login SUCCESS:', adminData.user.role);
    } else {
      console.error('Regular admin login FAILED:', adminResponse.status, await adminResponse.text());
    }
    
    // Test super admin login
    console.log('\n2. Testing super admin login...');
    const superAdminResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'owner@booksync.com',
        password: 'superadmin123'
      })
    });
    
    if (superAdminResponse.ok) {
      const superAdminData = await superAdminResponse.json();
      console.log('Super admin login SUCCESS:', superAdminData.user.role);
    } else {
      console.error('Super admin login FAILED:', superAdminResponse.status, await superAdminResponse.text());
    }
    
    // Check what users exist in database
    console.log('\n3. Checking users in database...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Users in database:', usersData.users?.map(u => ({ email: u.email, role: u.role })));
    } else {
      console.log('Cannot fetch users (may require auth)');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminLogins();
