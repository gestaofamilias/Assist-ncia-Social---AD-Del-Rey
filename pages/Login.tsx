
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../src/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { useAppContext } from '../constants';

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, showAlert } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Se já estiver autenticado, vai para o dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
        if (isSignUp) {
            await createUserWithEmailAndPassword(auth, email, password);
            showAlert('Cadastro Realizado', 'Sua conta foi criada com sucesso!', 'success');
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
        navigate('/dashboard');
    } catch (err: any) {
        setErrorMsg(translateError(err.code || err.message || String(err)));
        console.error('Auth Error:', err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(translateError(err.code || err.message || String(err)));
      console.error('Google Auth Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const translateError = (code: string) => {
      if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) return 'E-mail ou senha incorretos.';
      if (code.includes('auth/email-already-in-use')) return 'Este e-mail já está cadastrado.';
      if (code.includes('auth/weak-password')) return 'A senha deve ter pelo menos 6 caracteres.';
      if (code.includes('auth/invalid-email')) return 'E-mail inválido.';
      if (code.includes('auth/operation-not-allowed')) return 'Este método de login não está ativado no Firebase Console.';
      if (code.includes('auth/network-request-failed')) return 'Erro de rede. Verifique sua conexão ou se o Firebase está bloqueado.';
      if (code.includes('auth/popup-closed-by-user')) return 'O login foi cancelado.';
      return 'Erro na autenticação: ' + code;
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=2600&auto=format&fit=crop" 
        alt="Família Feliz" 
        className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000"
        referrerPolicy="no-referrer"
      />

      {/* Overlay */}
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

        <div className="mt-6 flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-surface-dark px-2 text-slate-500">Ou continue com</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>
        </div>

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
        </div>

        <p className="mt-6 text-center text-[10px] leading-tight text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-4">
          Os dados são coletados exclusivamente para fins de assistência social e organização da igreja.
        </p>
      </div>
    </div>
  );
};
