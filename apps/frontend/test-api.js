// Simple API test to check if backend is running
const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test login endpoint
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'owner@booksync.com',
        password: 'superadmin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
    } else {
      console.error('Login failed:', loginResponse.status, await loginResponse.text());
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
