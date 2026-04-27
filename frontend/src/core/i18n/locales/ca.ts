const ca = {
  // Common
  save: 'Desar',
  cancel: 'Cancel·lar',
  close: 'Tancar',
  edit: 'Editar',
  delete: 'Eliminar',
  confirm: 'Confirmar',
  loading: 'Carregant...',
  error: 'Error',
  success: 'Èxit',

  // Profile
  editProfile: 'Editar perfil',
  appColor: 'Color de l\'aplicació',
  language: 'Idioma',
  langCa: 'Català',
  langEs: 'Castellà',
  currentPassword: 'Contrasenya actual',
  newPassword: 'Nova contrasenya',
  confirmNewPassword: 'Confirmar nova contrasenya',
  profileUpdated: 'Perfil actualitzat correctament.',
  passwordMismatch: 'Les contrasenyes noves no coincideixen.',
  passwordTooShort: 'La nova contrasenya ha de tenir almenys 8 caràcters.',
  currentPasswordRequired: 'La contrasenya actual és obligatòria.',
  newPasswordRequired: 'La nova contrasenya és obligatòria.',
} as const;

export type TranslationKeys = keyof typeof ca;
export default ca;
