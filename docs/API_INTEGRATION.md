# API Integration Status

## ✅ Completed Endpoints

### Authentication Endpoints

1. **POST /auth/login** ✅
   - Location: `src/services/api.ts` → `authAPI.login()`
   - Used in: `src/pages/Login.tsx`
   - Features:
     - Sends email + password
       - Expects response contract fields: `success`, `message`, `token`, `user`
     - Stores token in localStorage
     - Redirects to dashboard on success
     - Shows error messages on failure

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

2. **POST /auth/register** ✅
   - Location: `src/services/api.ts` → `authAPI.register()`
    - Used in: `src/context/AuthContext.tsx` and `src/pages/Register.tsx`
   - Features:
       - Dedicated register page for first-time users
     - Sends email + password + optional name
     - Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number
       - Handles API response contract (`success`, `message`, `error`, `token`, `user`)
       - Redirects to login on successful registration (no auto-login)

3. **GET /auth/google** ✅
   - Location: `src/services/api.ts` → `authAPI.googleLogin()`
   - Used in: `src/pages/Login.tsx`
   - Redirects user to backend Google OAuth URL

4. **GET /auth/google/callback** ✅
   - Location: `src/pages/GoogleCallback.tsx`
   - Route: `/auth/google/callback`
   - Handles the OAuth redirect from backend
   - Extracts token from URL params
   - Stores token and redirects to dashboard

### Protected Endpoints

1. **GET /api/profile** ✅
   - Location: `src/services/api.ts` → `protectedAPI.getProfile()`
   - Used in: `src/pages/Dashboard.tsx`
   - Sends JWT token in Authorization header
   - Displays profile data on dashboard

2. **GET /api/data** ✅
   - Location: `src/services/api.ts` → `protectedAPI.getData()`
   - Available for use (not currently called in UI)

## Configuration

**Backend URL:** Set via environment variable
- Default: `http://localhost:3000`
- Override: Create `.env` file with `VITE_API_URL=your_backend_url`

## JWT Token Management

- **Storage:** localStorage (`token` and `user` keys)
- **Persistence:** Token survives page refresh
- **Automatic:** Included in all protected API calls
- **Clear on logout:** Removed from localStorage

## Request Flow

### Login Flow:
1. User submits email/password
2. Frontend validates format
3. POST to `/auth/login`
4. Backend returns JWT token
5. Token stored in localStorage
6. User redirected to /dashboard

### Register Flow:
1. User opens `/register` from the login page link
2. User submits email/password/(optional) name
3. Frontend validates email and password policy
4. POST to `/auth/register`
5. Backend returns success response (may include token/user)
6. Frontend redirects user to `/login?registered=1`
7. User logs in for the first time with new credentials

### Google OAuth Flow:
1. User clicks "Continue with Google"
2. Redirected to `/auth/google`
3. Backend handles Google OAuth
4. Redirected back to `/auth/google/callback?token=...`
5. Token extracted and stored
6. User redirected to /dashboard

### Protected Route Flow:
1. User accesses /dashboard
2. ProtectedRoute checks for token
3. If no token → redirect to /login
4. If token exists → render dashboard
5. Dashboard makes GET /api/profile with token
6. Profile data displayed

## Error Handling

- ✅ Network errors caught and displayed
- ✅ Invalid credentials shown to user
- ✅ 401 errors handled (failed auth)
- ✅ Loading states during API calls
- ✅ Disabled buttons during submission

## Next Steps (if needed)

- [ ] Add token refresh logic
- [ ] Add forgot password flow
- [ ] Better error messages from backend
- [ ] Token expiration handling
