# Auth API Contract

This document defines the frontend/backend contract for:

- Google registration / sign in
- Forgot password flow

## 1. Google Registration Contract

### Goal

Allow a guest user to create or access an account using Google OAuth, then redirect back to the frontend with an authenticated session token.

### Recommended Endpoints

#### `GET /api/tenant/auth/google/url`

Returns the Google OAuth redirect URL.

Response example:

```json
{
  "success": true,
  "message": "Google redirect url generated successfully.",
  "result": {
    "redirect_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
}
```

Frontend mapping:

- `result.redirect_url` opens in the browser.
- For backward compatibility, frontend may also accept `redirectUrl`.

Accepted response shapes:

```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

#### `GET /api/tenant/auth/google/callback`

Backend callback endpoint hit by Google after consent.

Query params:

- `code`
- `state`
- optional `scope`
- optional `authuser`
- optional `prompt`

Backend responsibilities:

- Validate Google response
- Create user if email does not exist
- Link Google provider if user already exists
- Mark provider as `google`
- Return or forward an access token for the frontend

Recommended redirect back to frontend:

```text
GET {frontendBaseUrl}/auth?token={access_token}&provider=google&is_new_user=true
```

Notes:

- `is_new_user=true` is optional, but useful if product wants to trigger onboarding.
- If the user already exists, return `is_new_user=false`.

### Error Contract

Example:

```json
{
  "success": false,
  "message": "Google authentication failed.",
  "errors": {
    "google": [
      "Unable to verify Google account."
    ]
  }
}
```

Suggested statuses:

- `400` invalid callback payload
- `401` Google token exchange failed
- `409` email exists but cannot be linked automatically
- `422` provider data incomplete
- `500` unexpected server error

## 2. Forgot Password Contract

### Step A: Request OTP

#### `POST /api/tenant/forgot-password`

Request body:

```json
{
  "mobile": "+201001234567"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP sent successfully.",
  "result": {
    "mobile": "+201001234567",
    "expires_in": 120,
    "otp_length": 6
  }
}
```

Frontend mapping:

- show `message`
- redirect to `/auth/password-otp?mobile={mobile}`

Validation error example:

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": {
    "mobile": [
      "The mobile field is required."
    ]
  }
}
```

### Step B: Verify OTP

#### `POST /api/tenant/verify-forgot-otp`

Request body:

```json
{
  "mobile": "+201001234567",
  "code": "123456"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "result": {
    "reset_token": "rst_01JABCDEF123456789XYZ"
  }
}
```

Frontend mapping:

- store `result.reset_token`
- redirect to `/auth/reset-password?reset_token={reset_token}`

Error example:

```json
{
  "success": false,
  "message": "Invalid or expired code.",
  "errors": {
    "code": [
      "The provided code is invalid."
    ]
  }
}
```

### Step C: Resend OTP

#### `POST /api/tenant/resend-mobile-code`

Request body:

```json
{
  "mobile": "+201001234567"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP resent successfully.",
  "result": {
    "mobile": "+201001234567",
    "expires_in": 120
  }
}
```

### Step D: Reset Password

#### `POST /api/tenant/reset-password`

Request body:

```json
{
  "reset_token": "rst_01JABCDEF123456789XYZ",
  "new_password": "StrongPassword123",
  "new_password_confirmation": "StrongPassword123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

Validation error example:

```json
{
  "success": false,
  "message": "Validation error.",
  "errors": {
    "new_password": [
      "The new password must be at least 8 characters."
    ],
    "new_password_confirmation": [
      "The new password confirmation does not match."
    ]
  }
}
```

## 3. Frontend Notes

- Facebook registration/login has been removed from the current auth UI.
- Google button should prefer `GET /api/tenant/auth/google/url`.
- Frontend currently keeps a legacy fallback for `/api/tenant/gmail` until backend migration is complete.
- Forgot password UI currently consumes:
  - `POST /api/tenant/forgot-password`
  - `POST /api/tenant/verify-forgot-otp`
  - `POST /api/tenant/resend-mobile-code`
  - `POST /api/tenant/reset-password`
