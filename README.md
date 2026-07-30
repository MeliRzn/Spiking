# Guild Goals Manager

Sistema mobile-first para gerenciamento de metas de guilda do Free Fire.

## 🚀 Tecnologias

- **React 18** - Interface do usuário
- **React Router** - Navegação
- **TailwindCSS** - Estilização
- **Supabase** - Banco de dados e autenticação
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📱 Funcionalidades

### Autenticação
- Login exclusivo com Discord
- Sessão persistente

### Páginas
- **Início**: Informações do usuário e status da meta
- **Enviar Metas**: Upload de comprovantes (Guerra de Guilda e Pontos Semanais)
- **Histórico**: Visualização de envios anteriores
- **Ranking**: Classificação da guilda
- **Perfil**: Informações do perfil
- **Administração**: Painel exclusivo para administradores

### Administração
- Aprovar/Reprovar uploads
- Gerenciar membros
- Criar anúncios
- Enviar notificações
- Visualizar estatísticas

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

As credenciais do Supabase já estão configuradas no `.env.example`.

4. Configure o Supabase:
   - O projeto Supabase já está configurado
   - Ative a autenticação com Discord no [Supabase Dashboard](https://supabase.com/dashboard)
   - Vá em Authentication > Providers > Discord
   - Adicione as credenciais do OAuth do Discord

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📦 Build para Produção

```bash
npm run build
```

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza Supabase com as seguintes tabelas:

- **users**: Informações dos usuários (id, email, display_name, photo_url, nick, free_fire_id, role)
- **goals**: Metas enviadas pelos usuários (user_id, week_number, year, war_points_image, weekly_points_image, status)
- **weekly_goals**: Metas semanais configuradas (week_number, year, war_points_target, weekly_points_target)
- **announcements**: Anúncios da guilda (title, content, created_by, is_active)
- **notifications**: Notificações dos usuários (user_id, title, message, type, read)
- **statistics**: Estatísticas agregadas (week_number, year, total_members, active_members, points)

Para mais detalhes, consulte `src/lib/database.js`.

## 🔌 Integração com Supabase

O arquivo `src/lib/database.js` contém todas as funções de integração direta com o Supabase. Todas as operações de banco de dados já estão implementadas usando o cliente Supabase.

### Storage

O sistema utiliza o bucket `goals` do Supabase Storage para armazenar as imagens dos comprovantes.

## 🎨 Design

- Tema escuro
- Glassmorphism leve
- Bordas arredondadas
- Animações suaves
- Mobile-first
- Responsivo para smartphones

## 📄 Licença

Este projeto está sob licença MIT.
