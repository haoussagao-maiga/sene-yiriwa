# Configuration et Démarrage - Sènè-Yiriwa

## Structure du Projet

```
Sene-yiriwa/
├── backend/              # API Node.js/Express
│   └── backend/
│       ├── server.js     # Point d'entrée du serveur
│       ├── src/
│       │   ├── config/   # Configuration (DB, etc.)
│       │   ├── routes/   # Routes API
│       │   ├── controllers/
│       │   └── middleware/
│       └── .env.example  # Variables d'environnement exemple
└── frontend/             # Application React Native/Expo
    ├── src/
    │   ├── config/
    │   │   └── api.config.ts  # Configuration API
    │   ├── api/
    │   └── components/
    └── .env.example      # Variables d'environnement exemple
```

## Prérequis

- Node.js (v18+)
- MySQL
- npm ou yarn

## Configuration du Backend

### 1. Installation des dépendances

```bash
cd backend/backend
npm install
```

### 2. Configuration de la base de données

Créez une base de données MySQL nommée `sene_yiriwa`:

```sql
CREATE DATABASE sene_yiriwa;
```

### 3. Configuration des variables d'environnement

Copiez le fichier `.env.example` et renommez-le en `.env`:

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=sene_yiriwa

JWT_SECRET=votre_cle_secrete_jwt
JWT_EXPIRES_IN=7d
```

### 4. Démarrage du serveur

```bash
npm start
```

Le serveur démarrera sur `http://localhost:3000`

## Configuration du Frontend

### 1. Installation des dépendances

```bash
cd frontend
npm install
```

### 2. Configuration des variables d'environnement

Copiez le fichier `.env.example` et renommez-le en `.env`:

```bash
cp .env.example .env
```

Le fichier `.env.example` contient:

```env
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000
APP_ENV=development
APP_VERSION=1.0.0
```

### 3. Démarrage de l'application

```bash
npm start
```

L'application Expo démarrera. Scannez le QR code avec l'app Expo Go sur votre mobile.

## Endpoints API Disponibles

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur (authentifié)
- `GET /api/auth/admin` - Accès admin (admin uniquement)

### Profil
- `GET /api/profil` - Récupérer le profil
- `PUT /api/profil` - Mettre à jour le profil

### Météo
- `GET /api/meteo` - Données météo (authentifié)

### Agriculteur
- `GET /api/agriculteur/cultures/disponibles` - Cultures disponibles
- `POST /api/agriculteur/cultures` - Ajouter une culture
- `GET /api/agriculteur/champs` - Récupérer les champs
- `POST /api/agriculteur/champs` - Ajouter un champ
- `DELETE /api/agriculteur/champs` - Supprimer un champ

### Conseils
- `GET /api/conseils` - Conseils personnalisés (authentifié)
- `POST /api/conseils` - Ajouter un conseil (expert)
- `PUT /api/conseils` - Modifier un conseil (expert)
- `DELETE /api/conseils` - Supprimer un conseil (expert)

### Vulgarisation
- `GET /api/vulgarisation` - Contenus par culture (authentifié)
- `GET /api/vulgarisation/all` - Tous les contenus (expert/admin)
- `POST /api/vulgarisation` - Ajouter un contenu (expert)
- `PUT /api/vulgarisation` - Modifier un contenu (expert)
- `DELETE /api/vulgarisation` - Supprimer un contenu (expert)

### Alertes
- `GET /api/alerte` - Alertes par région (authentifié)
- `GET /api/alerte/all` - Toutes les alertes (expert/admin)
- `POST /api/alerte` - Créer une alerte (expert)
- `PUT /api/alerte/:id` - Modifier une alerte (expert)
- `DELETE /api/alerte/:id` - Supprimer une alerte (expert)

### Calendrier
- `GET /api/calendrier` - Calendrier par culture/région (authentifié)
- `GET /api/calendrier/all` - Tous les calendriers (expert/agriculteur)
- `POST /api/calendrier` - Créer un calendrier (expert)
- `PUT /api/calendrier` - Modifier un calendrier (expert)
- `DELETE /api/calendrier` - Supprimer un calendrier (expert)

### Notifications
- `GET /api/notifications` - Notifications de l'utilisateur (authentifié)
- `PUT /api/notifications` - Marquer comme lue (authentifié)
- `POST /api/notifications` - Créer notification manuelle (expert/admin)

### Statistiques
- `GET /api/statistique/stats-generales` - Statistiques générales
- `GET /api/statistique/stats-agricoles` - Statistiques agricoles

### Admin
- `PUT /api/admin/promouvoir-expert` - Promouvoir un utilisateur expert (admin)

## Configuration CORS

Le backend est configuré pour accepter les requêtes depuis:
- `http://localhost:19006` (Expo web)
- `http://localhost:8081` (Expo Android/iOS simulator)
- `exp://192.168.*.*:19000` (Expo Go sur mobile)

## Dépannage

### Erreur de connexion à la base de données
Vérifiez que MySQL est en cours d'exécution et que les identifiants dans `.env` sont corrects.

### Erreur CORS
Vérifiez que l'URL du frontend est incluse dans la configuration CORS du backend.

### Erreur 401 Unauthorized
Vérifiez que le token JWT est correctement envoyé dans le header `Authorization: Bearer <token>`.

## Développement

Pour le développement local, le frontend utilise automatiquement `http://localhost:3000/api` comme BASE_URL. En production, il utilisera `https://api.seneyiriwa.com/api`.
