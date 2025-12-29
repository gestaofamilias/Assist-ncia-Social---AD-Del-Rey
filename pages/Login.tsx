import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New States for Authentication Logic
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
        let result;
        if (isSignUp) {
            // Register
            result = await supabase.auth.signUp({
                email,
                password,
            });
        } else {
            // Login
            result = await supabase.auth.signInWithPassword({
                email,
                password,
            });
        }

        const { data, error } = result;

        if (error) {
            setErrorMsg(translateError(error.message));
        } else {
            // If signup and no session immediately (needs email confirmation)
            if (isSignUp && !data.session && data.user) {
                 alert('Cadastro realizado! Se o login não for automático, verifique seu e-mail para confirmar a conta.');
                 setIsSignUp(false);
            } else if (data.session) {
                // Successful login
                navigate('/dashboard');
            }
        }
    } catch (err) {
        setErrorMsg('Ocorreu um erro inesperado. Tente novamente.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const translateError = (msg: string) => {
      if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
      if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
      if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
      return 'Erro na autenticação: ' + msg;
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=2600&auto=format&fit=crop" 
        alt="Família Feliz" 
        className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000"
      />

      {/* Overlay - Blends the image with the theme */}
      <div className="absolute inset-0 bg-yellow-50/80 dark:bg-black/80 backdrop-blur-[2px]"></div>
      
      {/* Gradient Decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent dark:from-background-dark dark:via-transparent"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] bg-white/90 dark:bg-surface-dark/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40">
            <span className="material-symbols-outlined text-5xl">diversity_3</span>
          </div>
          <div className="text-center">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão Social</h2>
             <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">
                 {isSignUp ? 'Criar nova conta' : 'Cuidando de famílias, transformando vidas'}
             </p>
          </div>
        </div>

        {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: social@igreja.com"
                className="w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha</label>
            <div className="relative">
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`mt-2 w-full h-12 text-white font-bold rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-yellow-600'
            }`}
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}</span>
                <button 
                    type="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrorMsg('');
                    }}
                    className="text-primary font-bold hover:underline"
                >
                    {isSignUp ? 'Fazer Login' : 'Criar Cadastro'}
                </button>
             </div>
             
             {!isSignUp && (
                <button className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    Esqueceu a senha?
                </button>
             )}
        </div>

        <p className="mt-6 text-center text-[10px] leading-tight text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-4">
          Os dados são coletados exclusivamente para fins de assistência social e organização da igreja.
        </p>
      </div>
    </div>
  );
};