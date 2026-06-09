/**
 * Traductions en Bambara (Bamanankan) - Sènè Yiriwa
 * 
 * Ce fichier contient toutes les traductions en langue bambara pour
 * l'application Sènè Yiriwa. Le bambara est la langue la plus parlée
 * au Mali, utilisée par environ 80% de la population.
 * 
 * Fonctionnalités :
 * - Termes agricoles adaptés au contexte malien
 * - Expressions courantes pour les agriculteurs
 * - Vocabulaire technique simplifié
 * - Formules de politesse et salutations
 * - Termes spécifiques aux régions du Mali
 * 
 * @module i18n/locales/bm
 */

export default {
  // ============================================
  // GÉNÉRAL
  // ============================================
  
  /** Nom de l'application */
  app_name: 'Sènè Yiriwa',
  
  /** État de chargement */
  loading: 'Jɔ́ɔn...',
  
  /** Message d'erreur générique */
  error: 'Fila ka kɛ',
  
  /** Bouton réessayer */
  retry: 'À kè sɔ̀rɔ',
  
  /** Bouton enregistrer */
  save: 'Làmɛn',
  
  /** Bouton annuler */
  cancel: 'Na faasi',
  
  /** Bouton confirmer */
  confirm: 'Jèyɛrɛ',
  
  /** Bouton retour */
  back: 'Sɛgɛn',
  
  /** Bouton suivant */
  next: 'Dugu',
  
  /** Voir tout */
  see_all: 'Bɛɛ yɛlɛ',
  
  /** Plus d'informations */
  read_more: 'Kalan dugu',
  
  /** Accueil */
  home: 'Sɔrɔ',
  
  /** Profil */
  profile: 'Jatigila',
  
  /** Paramètres */
  settings: 'Ɲɛnamaya',
  
  /** Aide */
  help: 'Dɛmɛ',
  
  /** À propos */
  about: 'Ko la',
  
  /** Version */
  version: 'Version',
  
  /** OK */
  ok: 'Awɔ',
  
  /** Fermer */
  close: 'Da',
  
  // ============================================
  // AUTHENTIFICATION
  // ============================================
  
  /** Connexion */
  login: 'Don don',
  
  /** Inscription */
  register: 'Don i yɛrɛ',
  
  /** Déconnexion */
  logout: 'Donni da',
  
  /** Email */
  email: 'E-mail',
  
  /** Mot de passe */
  password: 'Taasirikun',
  
  /** Confirmer le mot de passe */
  confirm_password: 'Taasirikun jèyɛrɛ',
  
  /** Mot de passe oublié */
  forgot_password: 'I ka taasirikun ɲina ?',
  
  /** Pas encore de compte */
  no_account: 'Donni ye dan ye ?',
  
  /** Déjà un compte */
  already_account: 'Donni bɛ yen ?',
  
  /** Bon retour */
  welcome_back: 'I ni sɛgɛn!',
  
  /** Créer un compte */
  create_account: 'I ka donni da',
  
  /** Nom */
  last_name: 'Jamana',
  
  /** Prénom */
  first_name: 'Tɔgɔ',
  
  /** Téléphone */
  phone: 'Telefɔni',
  
  /** Mot de passe actuel */
  current_password: 'Taasirikun bi',
  
  /** Nouveau mot de passe */
  new_password: 'Taasirikun kura',
  
  /** Confirmer le nouveau mot de passe */
  confirm_new_password: 'Taasirikun kura jèyɛrɛ',
  
  /** Se souvenir de moi */
  remember_me: 'N ka ɲin',
  
  /** Conditions d'utilisation */
  terms: 'Baarakɛcogo',
  
  /** J'accepte les conditions */
  accept_terms: 'N bɛ baarakɛcogo lasɔrɔ',
  
  // ============================================
  // MESSAGES DE BIENVENUE
  // ============================================
  
  /** Message de bienvenue */
  welcome: 'I ni chè, {{name}}',
  
  /** Bonjour (matin) */
  good_morning: 'A ni sɔgɔma',
  
  /** Bonjour (après-midi) */
  good_afternoon: 'A ni tile',
  
  /** Bonsoir */
  good_evening: 'A ni wula',
  
  /** Bonne nuit */
  good_night: 'A ni su',
  
  /** Au revoir */
  goodbye: 'Kananbɛ',
  
  /** Merci */
  thank_you: 'A ni chè',
  
  /** De rien */
  you_re_welcome: 'I ni chè',
  
  /** S'il vous plaît */
  please: 'S’il vous plaît',
  
  /** Désolé */
  sorry: 'Hakɛto',
  
  /** Félicitations */
  congratulations: 'N se ka fo',
  
  // ============================================
  // MÉTÉO
  // ============================================
  
  /** Météo */
  weather: 'Biɲɛ',
  
  /** Température */
  temperature: 'Funteni',
  
  /** Humidité */
  humidity: 'Jègɛrɛ',
  
  /** Vent */
  wind: 'Finyɛ',
  
  /** Probabilité de pluie */
  rain_probability: 'Sanji minɛ bɛ se ka na',
  
  /** Alerte météo */
  weather_alert: 'Biɲɛ jèyɛrɛ',
  
  /** Risque de sécheresse */
  drought_risk: 'Kɔ́mɔgɔn bana',
  
  /** Fortes pluies attendues */
  heavy_rain: 'Sanji baa bɛ nà',
  
  /** Soleil */
  sunny: 'Funteni',
  
  /** Nuageux */
  cloudy: 'Sankaba',
  
  /** Pluie */
  rainy: 'Sanji',
  
  /** Orage */
  thunderstorm: 'Finyɛw ni sanji',
  
  /** Harmattan */
  harmattan: 'Harmattan',
  
  /** Température actuelle */
  current_temp: 'Funteni bi',
  
  /** Température minimale */
  min_temp: 'Funteni dɔɔnin',
  
  /** Température maximale */
  max_temp: 'Funteni ba',
  
  /** Lever du soleil */
  sunrise: 'Tile bɔ',
  
  /** Coucher du soleil */
  sunset: 'Tile don',
  
  /** Indice UV */
  uv_index: 'UV bana',
  
  /** Visibilité */
  visibility: 'Yɛlɛma',
  
  /** Pression */
  pressure: 'Pirisiyɔn',
  
  // ============================================
  // CONSEILS AGRICOLES
  // ============================================
  
  /** Conseils */
  advice: 'Ladiɛli',
  
  /** Conseils agricoles */
  agricultural_advice: 'Sènɛkɛ ladiɛli',
  
  /** Période de semis */
  planting_period: 'Sɛnɛ wati',
  
  /** Période de traitement */
  treatment_period: 'Dɛmɛ wati',
  
  /** Période de récolte */
  harvest_period: 'Ɛrɛ wati',
  
  /** Lutte contre les parasites */
  pest_control: 'Kɔnɔminɛw gɛlɛya',
  
  /** Conseils d'irrigation */
  irrigation_tips: 'Jiɲɔnin ladiɛli',
  
  /** Fertilisation */
  fertilization: 'Banku dɛmɛ',
  
  /** Préparation du sol */
  soil_preparation: 'Banku nafa',
  
  /** Stockage des récoltes */
  storage: 'Ɛrɛ mara',
  
  /** Commercialisation */
  marketing: 'Sare',
  
  /** Nouveau conseil */
  new_advice: 'Ladiɛli kura',
  
  /** Conseils urgents */
  urgent_advice: 'Ladiɛli min bɛ ka fisa',
  
  // ============================================
  // TECHNIQUES AGRICOLES
  // ============================================
  
  /** Techniques */
  techniques: 'Gɔfɛnw',
  
  /** Techniques modernes */
  modern_techniques: 'Gɔfɛn kura',
  
  /** Techniques traditionnelles */
  traditional_techniques: 'Gɔfɛn kɔrɔ',
  
  /** Tutoriel vidéo */
  video_tutorial: 'Vidéo jɔyɔrɔ',
  
  /** Pas à pas */
  step_by_step: 'Dɔrɔn dɔrɔn',
  
  /** Matériel requis */
  materials_needed: 'Fɛnw min bɛ kan',
  
  /** Difficulté */
  difficulty: 'Gɛlɛya',
  
  /** Facile */
  easy: 'Nɔrɔman',
  
  /** Moyen */
  medium: 'Cɛman',
  
  /** Difficile */
  hard: 'Gɛlɛn',
  
  /** Durée estimée */
  estimated_time: 'Wati ja',
  
  /** Minutes */
  minutes: 'miniti',
  
  /** Heures */
  hours: 'wɛrɛ',
  
  /** Progression */
  progress: 'Taaɲɔ',
  
  /** Technique complétée */
  technique_completed: 'I bana gɔfɛn in kɛ',
  
  /** Certificat obtenu */
  certificate_earned: 'I ye sɛrɛtifika sɔrɔ',
  
  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  /** Notifications */
  notifications: 'Kunnafoniw',
  
  /** Aucune notification */
  no_notifications: 'Kunnafoni tè',
  
  /** Marquer comme lu */
  mark_as_read: 'A kalan jèyɛrɛ',
  
  /** Marquer tout comme lu */
  mark_all_read: 'Bɛɛ jèyɛrɛ',
  
  /** Supprimer */
  delete: 'Muru',
  
  /** Supprimer tout */
  delete_all: 'Bɛɛ muru',
  
  /** Nouvelle notification */
  new_notification: 'Kunnafoni kura',
  
  // ============================================
  // PROFIL UTILISATEUR
  // ============================================
  
  /** Modifier le profil */
  edit_profile: 'Jatigila sɛgɛn',
  
  /** Localisation */
  location: 'Sigiyɔrɔ',
  
  /** Type de culture */
  crop_type: 'Sɛnɛ nafa',
  
  /** Superficie (hectares) */
  field_size: 'Bagajɛ (ha)',
  
  /** Type d'agriculture */
  agriculture_type: 'Sènɛkɛ yɔrɔ',
  
  /** Agriculture pluviale */
  rainfed: 'Sanji ye',
  
  /** Agriculture irriguée */
  irrigated: 'Ji bɛ to',
  
  /** Changer la langue */
  change_language: 'Kan falen',
  
  /** Changer le mot de passe */
  change_password: 'Taasirikun falen',
  
  /** Supprimer le compte */
  delete_account: 'Donni muru',
  
  /** Confirmer la suppression */
  confirm_delete: 'I bɛ donni in muru sɔrɔ ?',
  
  /** Suppression définitive */
  permanent_delete: 'Donni in muru kɛ dɔrɔn',
  
  /** Langue actuelle */
  current_language: 'Kan bi',
  
  /** Choisir une langue */
  select_language: 'Kan sugandi',
  
  /** Français */
  french: 'Faransikan',
  
  /** Bambara */
  bambara: 'Bamanankan',
  
  /** Anglais */
  english: 'Angilɛkan',
  
  // ============================================
  // CULTURES
  // ============================================
  
  /** Mil */
  millet: 'Sɛnɛ - Dolo',
  
  /** Sorgho */
  sorghum: 'Sɛnɛ - Kɔ̀nɔ̀',
  
  /** Maïs */
  maize: 'Sɛnɛ - Kaba',
  
  /** Riz */
  rice: 'Sɛnɛ - Malo',
  
  /** Coton */
  cotton: 'Sɛnɛ - Jɛ̀gɛ',
  
  /** Arachide */
  peanut: 'Sɛnɛ - Tiga',
  
  /** Niébé */
  cowpea: 'Sɛnɛ - Niyɔ',
  
  /** Manioc */
  cassava: 'Sɛnɛ - Banku jɛgɛ',
  
  /** Igname */
  yam: 'Sɛnɛ - Kuko',
  
  /** Saison des pluies */
  rainy_season: 'Sanji wagati',
  
  /** Saison sèche */
  dry_season: 'Funteni wagati',
  
  // ============================================
  // RÉGIONS DU MALI
  // ============================================
  
  /** Bamako */
  bamako: 'Bamakɔ',
  
  /** Sikasso */
  sikasso: 'Sikaso',
  
  /** Koulikoro */
  koulikoro: 'Kulikɔrɔ',
  
  /** Mopti */
  mopti: 'Mɔ̀pti',
  
  /** Ségou */
  segou: 'Sɛgu',
  
  /** Kayes */
  kayes: 'Kayi',
  
  /** Gao */
  gao: 'Gaw',
  
  /** Tombouctou */
  timbuktu: 'Tumbutu',
  
  /** Kidal */
  kidal: 'Kidal',
  
  /** Taoudénit */
  taoudenit: 'Tawdenit',
  
  /** Ménaka */
  menaka: 'Menaka',
  
  // ============================================
  // FORMULAIRES ET VALIDATION
  // ============================================
  
  /** Champ requis */
  required_field: 'Niyɔrɔ nin kánɔn',
  
  /** Email invalide */
  invalid_email: 'E-mail tè cɔgɔn',
  
  /** Mot de passe trop court (minimum 6 caractères) */
  password_min: 'Taasirikun ka dan 6',
  
  /** Les mots de passe ne correspondent pas */
  password_match: 'Taasirikun tè kelen',
  
  /** Téléphone invalide (format Mali) */
  invalid_phone: 'Telefɔni tè cɔgɔn',
  
  /** Nom requis */
  name_required: 'Tɔgɔ ka kan',
  
  /** Email requis */
  email_required: 'E-mail ka kan',
  
  /** Mot de passe requis */
  password_required: 'Taasirikun ka kan',
  
  // ============================================
  // ALERTES ET MESSAGES
  // ============================================
  
  /** Alerte */
  alert: 'Jangali',
  
  /** Succès */
  success: 'A nyɛ',
  
  /** Attention */
  warning: 'Nina',
  
  /** Information */
  info: 'Kunnafoni',
  
  /** Erreur */
  error_msg: 'Fila',
  
  /** Connexion réussie */
  login_success: 'I don don ka nyɛ',
  
  /** Inscription réussie */
  register_success: 'I ka donni da ka nyɛ',
  
  /** Déconnexion réussie */
  logout_success: 'I donni da ka nyɛ',
  
  /** Profil mis à jour */
  profile_updated: 'I jatigila forobɔ ka nyɛ',
  
  /** Enregistrement réussi */
  save_success: 'Làmɛn ka nyɛ',
  
  /** Message envoyé */
  message_sent: 'Kuma bɔ ka nyɛ',
  
  /** Vérifiez votre connexion internet */
  check_internet: 'I ni Internet yɛlɛ',
  
  /** Données chargées */
  data_loaded: 'Kunnafoniw jɔ ka nyɛ',
  
  /** Rafraîchissement réussi */
  refresh_success: 'Forobɔ ka nyɛ',
  
  /** Rafraîchissement échoué */
  refresh_error: 'Forobɔ mana nyɛ',
  
  // ============================================
  // ACTIONS
  // ============================================
  
  /** Ajouter */
  add: 'Farali',
  
  /** Modifier */
  edit: 'Falen',
  
  /** Supprimer */
  remove: 'Muru',
  
  /** Valider */
  validate: 'Jèyɛrɛ',
  
  /** Annuler */
  cancel_action: 'Na faasi',
  
  /** Confirmer */
  confirm_action: 'Jèyɛrɛ',
  
  /** Envoyer */
  send: 'Bɔ',
  
  /** Recevoir */
  receive: 'Sɔrɔ',
  
  /** Partager */
  share: 'Jira',
  
  /** Copier */
  copy: 'Kopi',
  
  /** Coller */
  paste: 'Paste',
  
  /** Rechercher */
  search: 'Ninyini',
  
  /** Filtrer */
  filter: 'Sugandi',
  
  /** Trier */
  sort: 'Kuluya',
  
  /** Exporter */
  export: 'Bɔ',
  
  /** Importer */
  import: 'Don',
  
  // ============================================
  // FORMULES DE POLITESSE
  // ============================================
  
  /** Que Dieu te bénisse */
  god_bless: 'Alla ka i du mɛ',
  
  /** Bon appétit */
  enjoy_meal: 'A ni kumun',
  
  /** Bon voyage */
  safe_journey: 'A ni soji',
  
  /** Bon courage */
  good_luck: 'A ni hakili',
  
  /** Paix chez toi */
  peace: 'A ni herɛ',
  
  /** Que Dieu t'accompagne */
  god_with_you: 'Alla ka i lafɛ',
  
  // ============================================
  // COMPTES ET STATISTIQUES
  // ============================================
  
  /** Statistiques */
  stats: 'Tata',
  
  /** Total vues */
  total_views: 'Bɛɛ yɛlɛma',
  
  /** Total favoris */
  total_favorites: 'Bɛɛ kanu',
  
  /** Partages */
  shares: 'Jiralaw',
  
  /** Commentaires */
  comments: 'Kumaw',
  
  /** Notes */
  ratings: 'Tata',
  
  /** Moyenne */
  average: 'Cɛman',
  
  /** Classement */
  ranking: 'Nafɔrɔ',
  
  // ============================================
  // CHARGEMENTS
  // ============================================
  
  /** Chargement en cours */
  loading_data: 'Jɔ́ɔn bɛ kɛ...',
  
  /** Veuillez patienter */
  please_wait: 'N hakili jigi...',
  
  /** Préparation des données */
  preparing: 'N bɛ nnafa...',
  
  /** Téléchargement */
  downloading: 'N bɛ jɛn...',
  
  /** Téléchargement réussi */
  download_success: 'Jɛn ka nyɛ',
  
  /** Téléchargement échoué */
  download_error: 'Jɛn mana nyɛ',
  
  // ============================================
  // AGRICULTURE
  // ============================================
  
  /** Champ */
  field: 'Foroba',
  
  /** Récolte */
  harvest: 'Ɛrɛ',
  
  /** Semis */
  sowing: 'Sɛnɛ',
  
  /** Arrosage */
  watering: 'Jiyɔrɔ',
  
  /** Engrais */
  fertilizer: 'Banku nafa',
  
  /** Pesticide */
  pesticide: 'Kɔnɔminɛ kumaw',
  
  /** Outils agricoles */
  tools: 'Dafɛnw',
  
  /** Tracteur */
  tractor: 'Tarakiteri',
  
  /** Prix */
  price: 'Sare',
  
  /** Marché */
  market: 'Suguba',
  
  /** Vente */
  sale: 'Sareli',
  
  /** Achat */
  purchase: 'San',
  
  // ============================================
  // TEMPS
  // ============================================
  
  /** Aujourd'hui */
  today: 'Bi',
  
  /** Hier */
  yesterday: 'Kunu',
  
  /** Demain */
  tomorrow: 'Sini',
  
  /** Cette semaine */
  this_week: 'Dogokun in',
  
  /** La semaine prochaine */
  next_week: 'Dogokun naan',
  
  /** Ce mois-ci */
  this_month: 'Kalo in',
  
  /** Le mois prochain */
  next_month: 'Kalo naan',
  
  /** Cette année */
  this_year: 'San in',
  
  /** L'année prochaine */
  next_year: 'San naan',
  
  /** Matin */
  morning: 'Sɔgɔma',
  
  /** Midi */
  noon: 'Tilɛ cɛmancɛ',
  
  /** Après-midi */
  afternoon: 'Tilɛ kɔ',
  
  /** Soir */
  evening: 'Wula',
  
  /** Nuit */
  night: 'Su',
  
  // ============================================
  // JOURS DE LA SEMAINE
  // ============================================
  
  /** Lundi */
  monday: 'Ntɛnɛn',
  
  /** Mardi */
  tuesday: 'Tarata',
  
  /** Mercredi */
  wednesday: 'Araba',
  
  /** Jeudi */
  thursday: 'Alamisa',
  
  /** Vendredi */
  friday: 'Juma',
  
  /** Samedi */
  saturday: 'Sibiri',
  
  /** Dimanche */
  sunday: 'Kari',
  
  // ============================================
  // MOIS DE L'ANNÉE
  // ============================================
  
  /** Janvier */
  january: 'Zanwuye',
  
  /** Février */
  february: 'Fewuruye',
  
  /** Mars */
  march: 'Marisi',
  
  /** Avril */
  april: 'Awirili',
  
  /** Mai */
  may: 'Mɛ',
  
  /** Juin */
  june: 'Zuwɛn',
  
  /** Juillet */
  july: 'Zuluye',
  
  /** Août */
  august: 'Uti',
  
  /** Septembre */
  september: 'Sɛtanburu',
  
  /** Octobre */
  october: 'ɔkutɔburu',
  
  /** Novembre */
  november: 'Nɔwanburu',
  
  /** Décembre */
  december: 'Desanburu',
  
  // ============================================
  // CHIFFRES (pour audio/text-to-speech)
  // ============================================
  
  /** 0 */
  zero: 'Ziro',
  
  /** 1 */
  one: 'Kelen',
  
  /** 2 */
  two: 'Fila',
  
  /** 3 */
  three: 'Saba',
  
  /** 4 */
  four: 'Naani',
  
  /** 5 */
  five: 'Duuru',
  
  /** 6 */
  six: 'Wɔɔrɔ',
  
  /** 7 */
  seven: 'Wolonwula',
  
  /** 8 */
  eight: 'Segi',
  
  /** 9 */
  nine: 'Kɔnɔntɔn',
  
  /** 10 */
  ten: 'Tan',
};

/**
 * Note sur l'orthographe du bambara :
 * 
 * Le bambara (Bamanankan) est écrit avec l'alphabet latin.
 * Quelques particularités :
 * - 'ɛ' représente le son [ɛ] (e ouvert)
 * - 'ɔ' représente le son [ɔ] (o ouvert)
 * - 'ɲ' représente le son [ɲ] (gn)
 * - 'ŋ' représente le son [ŋ] (ng)
 * 
 * Les tons ne sont généralement pas marqués dans l'écriture courante.
 * 
 * Vocabulaire spécifique à l'agriculture au Mali :
 * - Sènɛkɛ = Agriculture
 * - Sènɛ = Culture / Semis
 * - Foroba = Champ
 * - Ɛrɛ = Récolte
 * - Kɔnɔminɛw = Parasites/Insectes nuisibles
 * - Banku dɛmɛ = Fertilisation (littéralement "aide à la terre")
 * - Jiɲɔnin = Irrigation
 * - Dolo = Mil
 * - Kɔ̀nɔ̀ = Sorgho
 * - Kaba = Maïs
 * - Malo = Riz
 * - Jɛ̀gɛ = Coton
 * - Tiga = Arachide
 */