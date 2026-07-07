import { useGoogleLogin } from '@react-oauth/google';

export function useGmailAuth(onSuccess, onError) {
  return useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    access_type: 'offline',
    prompt: 'consent',
    onSuccess,
    onError: (error) => {
      console.error('Google Login Error:', error);
      if (onError) onError(error);
    },
  });
}
