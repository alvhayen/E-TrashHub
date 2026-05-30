async function testRegister() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'RUMAH_TANGGA',
        name: 'Test Name',
        email: `test${Date.now()}@test.com`,
        password: 'password123',
        phone: '08111222',
        houseRole: 'KEPALA_KELUARGA',
        address: 'Test Address',
        postalCode: '12345'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testRegister();
