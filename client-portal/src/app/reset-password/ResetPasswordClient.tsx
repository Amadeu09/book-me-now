'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (res.status === 400) throw new Error('TOKEN_INVALID');
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

export function ResetPasswordClient({ token }: { token?: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 max-w-md w-full text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 block mb-4">link_off</span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
          <p className="text-gray-500 text-sm">Este enlace de restablecimiento no es válido o ha caducado.</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!PASSWORD_RE.test(password)) {
      setError('Debe contener al menos una mayúscula, un número y un carácter especial.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      if (err.message === 'TOKEN_INVALID') {
        setError('El enlace ha caducado o ya fue utilizado. Solicita uno nuevo desde la app.');
      } else {
        setError('No se pudo restablecer la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 max-w-md w-full">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#6366F1] block" />
          <span className="text-[#6366F1] font-black tracking-[0.2em] text-xs uppercase">BookMeNow</span>
        </div>

        {success ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-5xl text-green-500 block mb-4">check_circle</span>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Contraseña restablecida</h1>
            <p className="text-gray-500 text-sm">
              Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión desde la app.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-1">
              Nueva contraseña
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Elige una contraseña segura. El enlace es de un solo uso.
            </p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                <span className="material-symbols-outlined text-red-500 text-base mt-0.5">error</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus-within:border-[#6366F1] transition-colors">
                  <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPwd ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Mínimo 8 caracteres, una mayúscula, un número y un símbolo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus-within:border-[#6366F1] transition-colors">
                  <span className="material-symbols-outlined text-gray-400 text-lg">lock_reset</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm transition-colors mt-2"
              >
                {loading ? 'Guardando...' : 'Establecer nueva contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
