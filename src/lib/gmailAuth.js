import { useGoogleLogin } from '@react-oauth/google';

export function useGmailAuth(onSuccess, onError) {
  return useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'popup',
    redirect_uri: 'postmessage',
    scope: 'https://www.googleapis.com/auth/gmail.send email profile openid',
    access_type: 'offline',
    prompt: 'consent',
    onSuccess,
    onError: (error) => {
      console.error('Google Login Error:', error);
      if (onError) onError(error);
    },
  });
}
