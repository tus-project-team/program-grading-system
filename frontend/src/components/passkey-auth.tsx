import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fingerprint } from 'lucide-react';
import { usePasskeyRegistration, usePasskeyAuthentication } from '@/features/auth/hooks';

type Role = 'student' | 'teacher' | 'admin';

interface FormData {
  email: string;
  name: string;
  role: Role;
}

type PasskeyAuthProps = {
  onAuthenticationSuccess: (token: string) => void;
};

export const PasskeyAuth = ({ onAuthenticationSuccess }: PasskeyAuthProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return mode === 'login' ? (
    <PasskeyLogin 
      onRegister={() => setMode('register')} 
      onSuccess={onAuthenticationSuccess}
    />
  ) : (
    <PasskeyRegistration 
      onCancel={() => setMode('login')} 
      onSuccess={onAuthenticationSuccess}
    />
  );
};

type PasskeyLoginProps = {
  onRegister: () => void;
  onSuccess: (token: string) => void;
};

const PasskeyLogin = ({ onRegister, onSuccess }: PasskeyLoginProps) => {
  const [email, setEmail] = useState('');
  const { login, isLoading, error } = usePasskeyAuthentication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email);
      onSuccess(result.token);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>パスキーでログイン</CardTitle>
        <CardDescription>
          メールアドレスを入力してログインしてください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : 'エラーが発生しました'}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            {isLoading ? 'パスキーで認証中...' : 'パスキーでログイン'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onRegister}
          disabled={isLoading}
        >
          アカウントを作成
        </Button>
      </CardFooter>
    </Card>
  );
};

type PasskeyRegistrationProps = {
  onCancel: () => void;
  onSuccess: (token: string) => void;
};

const PasskeyRegistration = ({ onCancel, onSuccess }: PasskeyRegistrationProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    role: 'student',
  });
  
  const { register, isLoading, error } = usePasskeyRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(formData);
      onSuccess(result.token);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>アカウント作成</CardTitle>
        <CardDescription>
          必要な情報を入力してアカウントを作成してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">メールアドレス</Label>
            <Input
              id="reg-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">ロール</Label>
            <select
              id="role"
              className="w-full p-2 border rounded"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
            >
              <option value="student">学生</option>
              <option value="teacher">教師</option>
              <option value="admin">管理者</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : 'エラーが発生しました'}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            {isLoading ? 'パスキーを登録中...' : 'パスキーを登録'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onCancel}
          disabled={isLoading}
        >
          戻る
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PasskeyAuth;
