'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { notification } from 'antd';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // API call để gửi email reset password
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('パスワードのリセットに失敗しました');
      }

      setIsSuccess(true);
    } catch (error) {
      api.error({
        message: 'パスワードのリセットに失敗しました',
        description: 'パスワードリセットに失敗しました。',
      });
      setError('パスワードリセットに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        {contextHolder}
        <div className='min-h-screen bg-gray-100 flex items-center justify-center px-4'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h3 className='mt-4 text-lg font-medium text-gray-900'>
              メール送信完了
            </h3>
            <div className='mt-2 text-sm text-gray-500'>
              <p>
                パスワードリセットリンクが <strong>{email}</strong>{' '}
                に送信されました。
              </p>
              <p className='mt-2'>メールをご確認ください。</p>
            </div>
            <div className='mt-6'>
              <Button
                onClick={() => setIsSuccess(false)}
                variant='outline'
                className='w-full'
              >
                別のメールアドレスを試す
              </Button>
            </div>
            <div className='mt-4'>
              <a
                href='/login'
                className='text-sm text-blue-600 hover:text-blue-500'
              >
                ログインに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div className='min-h-screen bg-gray-100 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            パスワードリセット
          </h1>
          <p className='text-gray-600'>
            登録されたメールアドレスにパスワードリセットURLを送信いたします
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              メールアドレス
            </label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='example@company.com'
              required
              className='w-full'
            />
          </div>

          {error && (
            <div className='text-red-600 text-sm text-center'>{error}</div>
          )}

          <Button
            type='submit'
            loading={isLoading}
            disabled={isLoading}
            className='w-full'
          >
            リセットメール送信
          </Button>
        </form>

        {/* Back to login link */}
        <div className='mt-6 text-center'>
          <a
            href='/login'
            className='text-sm text-blue-600 hover:text-blue-500'
          >
            ログインに戻る
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
