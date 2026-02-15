# Login App

A React application with authentication, form validation, and protected routes.

## Features

- ✅ Email and password login with validation
- ✅ Dedicated first-time user registration page
- ✅ Google SSO button (UI ready for backend integration)
- ✅ Protected routes that require authentication
- ✅ User dashboard accessible only after login
- ✅ Register form validation:
  - Valid email format required
  - Password must contain:
    - At least 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Structure

```
login-app/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Route protection component
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication state management
│   ├── pages/
│   │   ├── Login.jsx             # Login page with validation
│   │   ├── Register.jsx          # Registration page for first-time users
│   │   ├── Login.css
│   │   ├── Dashboard.jsx         # Protected dashboard page
│   │   └── Dashboard.css
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # App entry point
│   └── index.css                 # Global styles
└── index.html

```

## Registering a First-Time User

From the UI:
1. Open `/login`
2. Click `Create an account`
3. Fill in:
   - Email
   - Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   - Name (optional)
4. Submit to create the account
5. On success, you are redirected to `/login` and must sign in with the new credentials

Via API (cURL):

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "New User"
  }'
```

## Login API Contract

Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "string",
    "email": "user@example.com",
    "name": "string"
  }
}
```

## Testing the Validation

Try these test cases:

**Invalid Email:**
- `test` (no @ or domain)
- `test@` (no domain)

**Invalid Password:**
- `password` (no uppercase or number)
- `Password` (no number)
- `Pass1` (less than 8 characters)

**Valid Login:**
- Email: `user@example.com`
- Password: `Password123!`

## Backend Integration

The app is ready to connect to an Express backend. Update the `login` function in `src/context/AuthContext.jsx` to make API calls to your backend endpoints.

Example:
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await response.json()
  if (response.ok) {
    setUser(data.user)
    return true
  }
  return false
}
```

## Routes

- `/` - Redirects to login
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard (requires authentication)
