import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { paths } from 'openapi/schema';

// OpenAPIスキーマから生成された型を使用
type AuthenticationResponse = {
  challenge: string;
  allowCredentials?: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
};
type AuthenticationVerifyResponse = paths['/api/authenticate/verify']['post']['responses']['200']['content']['application/json'];

export function usePasskeyAuthentication() {
  const authMutation = useMutation({
    mutationFn: async (email: string): Promise<AuthenticationResponse> => {
      const { data, error } = await client.POST("/api/authenticate", {
        body: { email }
      });
      if (error) throw error;
      if (!data) throw new Error('No response data');
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (credential: PublicKeyCredential): Promise<AuthenticationVerifyResponse> => {
      const { data, error } = await client.POST("/api/authenticate/verify", {
        body: {
          id: credential.id,
          rawId: arrayBufferToBase64(credential.rawId),
          type: credential.type as "public-key",
          response: {
            authenticatorData: arrayBufferToBase64(
              (credential.response as AuthenticatorAssertionResponse).authenticatorData
            ),
            clientDataJSON: arrayBufferToBase64(
              credential.response.clientDataJSON
            ),
            signature: arrayBufferToBase64(
              (credential.response as AuthenticatorAssertionResponse).signature
            ),
            userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle
              ? arrayBufferToBase64(
                  (credential.response as AuthenticatorAssertionResponse).userHandle!
                )
              : undefined
          }
        }
      });
      if (error) throw error;
      if (!data) throw new Error('No response data');
      return data;
    }
  });

  const login = async (email: string) => {
    try {
      const response = await authMutation.mutateAsync(email);

      if (!response.challenge) {
        throw new Error('Challenge is missing from the response');
      }

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64ToArrayBuffer(response.challenge),
        timeout: 60000,
        userVerification: "required",
        rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      };

      // allowCredentialsが存在する場合のみ追加
      if (response.allowCredentials) {
        publicKeyCredentialRequestOptions.allowCredentials = response.allowCredentials.map(cred => ({
          id: base64ToArrayBuffer(cred.id),
          type: 'public-key' as const,
          transports: (cred.transports || []) as AuthenticatorTransport[],
        }));
      }

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (!credential) {
        throw new Error('認証情報の取得に失敗しました');
      }

      return await verifyMutation.mutateAsync(credential as PublicKeyCredential);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Login error:', err);
        throw new Error(`ログインに失敗しました: ${err.message}`);
      }
      throw err;
    }
  };

  return {
    login,
    isLoading: authMutation.isPending || verifyMutation.isPending,
    error: authMutation.error || verifyMutation.error,
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...uint8Array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const standardBase64 = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  const binaryString = atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
