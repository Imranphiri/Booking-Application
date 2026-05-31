// Test the login API to debug 401 error
const API_BASE_URL = 'http://localhost:3000/api';

async function testLogin401() {
  try {
    console.log('=== DEBUGGING 401 LOGIN ERROR ===\n');
    
    // Test 1: Check if backend is running
    console.log('1. Testing backend health...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test 2: Test super admin login with exact credentials
    console.log('\n2. Testing super admin login...');
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
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login SUCCESS:', loginData);
    } else {
      const errorText = await loginResponse.text();
      console.log('Login FAILED:', errorText);
      
      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Parsed error:', errorJson);
      } catch (e) {
        console.log('Error text (not JSON):', errorText);
      }
    }
    
    // Test 3: Check if there are CORS issues
    console.log('\n3. Testing CORS preflight...');
    const preflightResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5175'
      }
    });
    
    console.log('Preflight status:', preflightResponse.status);
    console.log('Preflight headers:', Object.fromEntries(preflightResponse.headers.entries()));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLogin401();
