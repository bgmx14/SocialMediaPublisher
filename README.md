# 🚀 Social Media Publisher

Une application web complète pour gérer, planifier et publier du contenu sur plusieurs réseaux sociaux avec génération automatique de contenu par IA.

## ✨ Fonctionnalités

- 📱 **Multi-plateformes** : Instagram Business, Facebook Pages, X/Twitter, LinkedIn
- 🔐 **OAuth 2.0** : Connexion sécurisée en un clic (plus besoin de tokens manuels !)
- ✍️ **Création de contenu** : Texte, images, vidéos
- 🤖 **Génération IA** : Captions et descriptions automatiques (OpenAI)
- 📅 **Calendrier intuitif** : Drag & drop pour planifier vos publications
- ⏰ **Planification automatique** : Envoi programmé via API
- 🔄 **Refresh automatique** : Renouvellement automatique des tokens
- 📊 **Historique** : Suivi de toutes vos publications
- 🔓 **Sans authentification** : Dashboard simple et direct

## 🛠️ Stack Technique

### Backend
- Node.js + Express + TypeScript
- SQLite (base de données)
- Multer (upload de fichiers)
- node-cron (planification)
- APIs réseaux sociaux
- OpenAI API

### Frontend
- React + TypeScript
- Vite (build tool)
- TailwindCSS
- React DnD (drag & drop)
- FullCalendar
- Axios + React Query

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Configuration

1. **Cloner le projet**
```bash
git clone <repo-url>
cd SocialMediaPublisher
```

2. **Installer les dépendances**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configuration des variables d'environnement**

Créer un fichier `.env` dans le dossier `backend/` :

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./database/socialmedia.db

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Instagram
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Twitter/X
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

4. **Lancer l'application**

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

5. **Accéder à l'application**
- Frontend : http://localhost:5173
- Backend API : http://localhost:3001

6. **Configuration OAuth (Recommandé)**

Pour une meilleure expérience utilisateur, configurez l'authentification OAuth :
- 📖 Consultez le guide complet : **[OAUTH_SETUP.md](./OAUTH_SETUP.md)**
- Configure les redirects URIs pour chaque plateforme
- Plus besoin de tokens manuels, connexion en un clic !

## 📖 Utilisation

### 1. Connecter vos comptes (OAuth)
- Allez dans "Comptes" et connectez vos réseaux sociaux
- Suivez les flux OAuth pour autoriser l'application

### 2. Créer du contenu
- Cliquez sur "Nouveau Post"
- Ajoutez texte, images ou vidéos
- Utilisez l'IA pour générer des captions

### 3. Planifier
- Utilisez le calendrier pour choisir date/heure
- Drag & drop pour réorganiser
- Validez la publication

### 4. Suivre
- Consultez l'historique des publications
- Vérifiez les statuts d'envoi

## 🔧 API Endpoints

### OAuth
- `GET /api/oauth/:platform/authorize` - Initier flux OAuth
- `GET /api/oauth/:platform/callback` - Callback OAuth
- `POST /api/oauth/refresh/:accountId` - Rafraîchir token

### Comptes sociaux
- `GET /api/accounts` - Liste des comptes connectés
- `POST /api/accounts` - Ajouter un compte
- `DELETE /api/accounts/:id` - Supprimer un compte

### Publications
- `GET /api/posts` - Liste des publications
- `POST /api/posts` - Créer une publication
- `PUT /api/posts/:id` - Modifier une publication
- `DELETE /api/posts/:id` - Supprimer une publication
- `POST /api/posts/:id/publish` - Publier immédiatement

### Contenu IA
- `POST /api/ai/generate-caption` - Générer une caption

### Uploads
- `POST /api/upload` - Upload média (image/vidéo)

## 📁 Structure du projet

```
SocialMediaPublisher/
├── backend/               # API Node.js
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Contrôleurs
│   │   ├── models/       # Modèles DB
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Services (API, IA)
│   │   ├── middleware/   # Middlewares
│   │   └── index.ts      # Entry point
│   ├── database/         # SQLite DB
│   └── uploads/          # Fichiers uploadés
├── frontend/             # App React
│   ├── src/
│   │   ├── components/   # Composants UI
│   │   ├── pages/        # Pages
│   │   ├── services/     # API calls
│   │   └── types/        # Types TypeScript
│   └── public/           # Assets statiques
└── README.md
```

## 🔐 Sécurité

- Les tokens API sont stockés côté serveur uniquement
- Validation des fichiers uploadés
- Rate limiting sur les endpoints
- CORS configuré

## 📝 TODO / Améliorations futures

- [ ] Analytics et statistiques
- [ ] Support de plus de plateformes (TikTok, Pinterest)
- [ ] Templates de posts réutilisables
- [ ] Multi-utilisateurs avec authentification
- [ ] Notifications push
- [ ] Prévisualisation des posts

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un PR.

---

Développé avec ❤️ pour simplifier la gestion des réseaux sociaux
