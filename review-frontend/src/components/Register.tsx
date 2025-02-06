import { useState } from 'react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState(''); // State for success/error messages

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name,
      email,
      password,
      contact,
      dob: dateOfBirth,
      gender,
      address,
    };
  
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          contact: formData.contact,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
        }),
      });
    
      if (response.ok) {
        setMessage('Registered successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setContact('');
        setDateOfBirth('');
        setGender('');
        setAddress('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error registering:', error);
      setMessage('An error occurred during registration.');
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>

        {/* Display success or error message */}
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">Name</label>
              <input
                id="name"
                type="text"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium">Email</label>
              <input
                id="email"
                type="email"
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-medium">Password</label>
              <input
                id="password"
                type="password"
                className="w-full p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="contact" className="block mb-1 font-medium">Contact</label>
              <input
                id="contact"
                type="text"
                className="w-full p-2 border rounded"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="dateOfBirth" className="block mb-1 font-medium">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                className="w-full p-2 border rounded"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block mb-1 font-medium">Gender</label>
              <select
                id="gender"
                className="w-full p-2 border rounded"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block mb-1 font-medium">Address</label>
              <textarea
                id="address"
                className="w-full p-2 border rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
