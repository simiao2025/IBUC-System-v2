import axios from 'axios';

async function testLogin() {
  const email = 'pedro.neuto@ibuc.com.br';
  const password = '123456';
  const url = 'http://localhost:3000/usuarios/login';

  console.log(`Trying login for ${email} at ${url}...`);

  try {
    const response = await axios.post(url, { email, password });
    console.log('Login successful!');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
