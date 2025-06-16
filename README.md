# TaskSphere Backend

TaskSphere é uma aplicação de gerenciamento de projetos que permite equipes colaborarem de forma eficiente em suas tarefas e projetos.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset JavaScript com tipagem estática
- **Express.js** - Framework web para Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação baseada em tokens
- **Swagger** - Documentação da API
- **Jest** - Framework de testes
- **ESLint & Prettier** - Linting e formatação de código
- **Winston** - Sistema de logging
- **Cloudinary** - Gerenciamento de arquivos e imagens
- **AWS S3** - Armazenamento em nuvem

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB
- NPM ou Yarn
- Variáveis de ambiente configuradas (ver seção de configuração)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd tasksphere-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3000
MONGODB_URI=sua_uri_mongodb
JWT_SECRET=seu_jwt_secret
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=sua_regiao
AWS_BUCKET_NAME=nome_do_bucket
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
npm test
```

## 📚 Documentação da API

A documentação da API está disponível através do Swagger UI. Após iniciar o servidor, acesse:
```
http://localhost:3000/api-docs
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── config/        # Configurações da aplicação
├── controllers/   # Controladores da API
├── docs/         # Documentação
├── hooks/        # Hooks personalizados
├── middleware/   # Middlewares
├── models/       # Modelos do MongoDB
├── routes/       # Rotas da API
├── services/     # Serviços de negócio
├── tests/        # Testes
├── types/        # Definições de tipos TypeScript
├── utils/        # Utilitários
├── validations/  # Validações
├── app.ts        # Configuração do Express
└── server.ts     # Ponto de entrada da aplicação
```

## 🔍 Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura de testes
- `npm run lint` - Executa o linter
- `npm run lint:fix` - Corrige problemas de linting
- `npm run format` - Formata o código usando Prettier

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 