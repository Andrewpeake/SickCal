# Email Configuration for SickCal

## Current Status
Your SickCal app is set up with Supabase authentication, but you may need to configure email settings for the best user experience.

## Email Confirmation Setup (Optional but Recommended)

### 1. Configure Email Templates
1. Go to: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/auth/templates
2. **Sign up template**: Customize the welcome email
3. **Password reset template**: Customize the reset email
4. **Email change template**: Customize the email change confirmation

### 2. Configure Email Settings
1. Go to: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/auth/providers
2. **Email provider settings**:
   - Enable "Confirm email" (recommended for security)
   - Set "Secure email change" (recommended)
   - Configure "Email OTP" if desired

### 3. Custom SMTP (Optional)
If you want to use your own email service:
1. Go to: https://supabase.com/dashboard/project/iokadfmtoqletjlafwwg/auth/providers
2. Click "Configure SMTP settings"
3. Add your SMTP credentials

## Current Behavior

### With Email Confirmation Enabled:
- User signs up → Email sent → User clicks link → Account activated
- More secure, prevents fake accounts

### With Email Confirmation Disabled:
- User signs up → Account immediately active
- Faster signup, but less secure

## Testing Your Setup

1. **Try signing up** with a real email address
2. **Check your email** for confirmation message
3. **Click the confirmation link** to activate your account
4. **Sign in** with your credentials

## Troubleshooting

### "Email not received"
- Check spam/junk folder
- Verify email address is correct
- Check Supabase email logs in dashboard

### "Invalid confirmation link"
- Links expire after 24 hours
- Try requesting a new confirmation email

### "User already exists"
- Account may already be created but not confirmed
- Try signing in instead of signing up

## Recommended Settings

For production use:
- ✅ Enable email confirmation
- ✅ Enable secure email change
- ✅ Set up custom SMTP
- ✅ Customize email templates with your branding

For development/testing:
- ❌ Disable email confirmation (faster testing)
- ✅ Use default Supabase email service

