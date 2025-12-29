# Gestão Social - Igreja

Sistema completo para gestão de assistência social, famílias e fluxo de caixa para igrejas e ONGs.

## 🚀 Como fazer o Deploy

### 1. GitHub
1. Crie um novo repositório no seu GitHub.
2. Inicialize o git na sua pasta local:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

### 2. Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
2. Clique em **"Add New"** > **"Project"**.
3. Importe o repositório que você acabou de criar.
4. **Variáveis de Ambiente:** No painel da Vercel, certifique-se de configurar as chaves do Supabase se decidir usar variáveis de ambiente no futuro (atualmente estão configuradas no `supabaseClient.ts`).
5. Clique em **Deploy**.

## 🛠️ Tecnologias
- React 19
- Tailwind CSS (Estilização)
- Supabase (Banco de Dados e Autenticação)
- Lucide/Material Symbols (Ícones)
- Vercel (Hospedagem)

## 📄 Licença
Este projeto é de uso livre para fins eclesiásticos e sociais.