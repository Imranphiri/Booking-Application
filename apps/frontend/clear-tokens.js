// Clear any existing tokens that might be causing 401 errors
console.log('Clearing localStorage tokens...');
localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('Tokens cleared. Please try the login again.');
