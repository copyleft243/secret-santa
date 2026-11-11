export type Locale = "fr" | "en";

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALES: Locale[] = ["fr", "en"];

export interface Messages {
  home: {
    subtitle: string;
    successTitle: string;
    successText: string;
    copy: string;
    copied: string;
    openLink: string;
    closedTitle: string;
    closedText: string;
    nameLabel: string;
    namePlaceholder: string;
    exclusionsLegend: string;
    optional: string;
    submit: string;
    submitting: string;
    footerNone: string;
    footerOne: string;
    footerMany: string;
    loadError: string;
    genericError: string;
    networkError: string;
  };
  reveal: {
    invalidTitle: string;
    invalidText: string;
    loading: string;
    greeting: string;
    matchIntro: string;
    matchProblem: string;
    secret: string;
    notDrawnTitle: string;
    notDrawnText: string;
    exclusionsLegend: string;
    optional: string;
    save: string;
    saving: string;
    saved: string;
    loadError: string;
    saveError: string;
    networkError: string;
  };
  admin: {
    title: string;
    loginHint: string;
    secretPlaceholder: string;
    signIn: string;
    checking: string;
    wrongSecret: string;
    networkError: string;
    participantsOne: string;
    participantsMany: string;
    drawn: string;
    notDrawn: string;
    signOut: string;
    drawTitle: string;
    drawDescription: string;
    drawButton: string;
    drawing: string;
    needParticipants: string;
    drawComplete: string;
    assignmentsOne: string;
    assignmentsMany: string;
    copyResults: string;
    copied: string;
    confirm: string;
    resetDraw: string;
    participantsTitle: string;
    noneYet: string;
    exclusionsHint: string;
    remove: string;
    removeConfirm: string;
    drawError: string;
    resetError: string;
    removeError: string;
  };
  errors: {
    invalidBody: string;
    nameRequired: string;
    nameTooLong: string;
    registrationClosed: string;
    duplicateName: string;
    invalidLink: string;
    drawAlreadyHappened: string;
    unauthorized: string;
    alreadyDrawn: string;
    needTwoParticipants: string;
    noValidAssignment: string;
    invalidId: string;
    resetBeforeRemoving: string;
  };
}

export const messages: Record<Locale, Messages> = {
  fr: {
    home: {
      subtitle:
        "Inscrivez votre nom : nous vous assignerons secrètement quelqu'un à qui offrir un cadeau.",
      successTitle: "Votre inscription est confirmée, {name} ! 🎉",
      successText:
        "Voici votre lien personnel. Gardez-le précieusement : c'est le seul moyen de découvrir à qui vous offrirez un cadeau, et il ne s'affiche qu'une seule fois.",
      copy: "Copier",
      copied: "Copié !",
      openLink: "Ouvrir mon lien →",
      closedTitle: "Les inscriptions sont closes",
      closedText:
        "Le tirage au sort a déjà eu lieu. Ouvrez votre lien personnel pour découvrir votre destinataire.",
      nameLabel: "Votre nom",
      namePlaceholder: "ex. Alice",
      exclusionsLegend: "À qui préférez-vous ne pas offrir de cadeau ?",
      optional: "(facultatif)",
      submit: "S'inscrire",
      submitting: "Inscription…",
      footerNone: "Soyez la première personne à vous inscrire !",
      footerOne: "1 personne s'est inscrite jusqu'à présent.",
      footerMany: "{count} personnes se sont inscrites jusqu'à présent.",
      loadError: "Impossible de charger la page. Veuillez rafraîchir.",
      genericError: "Une erreur est survenue.",
      networkError: "Erreur réseau. Veuillez réessayer.",
    },
    reveal: {
      invalidTitle: "Ce lien n'est pas valide",
      invalidText:
        "Vérifiez l'adresse qui vous a été fournie, ou contactez l'organisateur.",
      loading: "Chargement…",
      greeting: "Bonjour {name},",
      matchIntro: "Vous allez offrir un cadeau à…",
      matchProblem: "Un problème est survenu — contactez l'organisateur.",
      secret: "🤫 Ne le dites à personne !",
      notDrawnTitle: "Bonjour {name} — votre inscription est bien enregistrée 🎉",
      notDrawnText:
        "Gardez ce lien précieusement. Une fois le tirage effectué par l'organisateur, revenez ici pour découvrir à qui vous offrirez un cadeau.",
      exclusionsLegend: "À qui préférez-vous ne pas offrir de cadeau ?",
      optional: "(facultatif)",
      save: "Enregistrer mes préférences",
      saving: "Enregistrement…",
      saved: "Enregistré ✓",
      loadError: "Impossible de charger votre page. Veuillez rafraîchir.",
      saveError: "Impossible d'enregistrer.",
      networkError: "Erreur réseau. Veuillez réessayer.",
    },
    admin: {
      title: "Administration",
      loginHint: "Saisissez le mot de passe administrateur pour continuer.",
      secretPlaceholder: "Mot de passe administrateur",
      signIn: "Se connecter",
      checking: "Vérification…",
      wrongSecret: "Mot de passe administrateur incorrect.",
      networkError: "Erreur réseau.",
      participantsOne: "1 participant",
      participantsMany: "{count} participants",
      drawn: "tirage effectué",
      notDrawn: "pas encore tiré",
      signOut: "Se déconnecter",
      drawTitle: "Lancer le tirage au sort",
      drawDescription:
        "Assigne aléatoirement un destinataire à chaque personne. Personne ne s'offre à soi-même (ni à une personne exclue).",
      drawButton: "Lancer le tirage",
      drawing: "Tirage…",
      needParticipants:
        "Il faut au moins deux participants pour lancer le tirage. Partagez le site pour que les gens s'inscrivent !",
      drawComplete: "Le tirage est terminé 🎉",
      assignmentsOne: "1 attribution",
      assignmentsMany: "{count} attributions",
      copyResults: "Copier les résultats",
      copied: "Copié !",
      confirm: "Confirmer",
      resetDraw: "Réinitialiser le tirage",
      participantsTitle: "Participants",
      noneYet: "Aucune inscription pour le moment.",
      exclusionsHint: "ne fera pas de cadeau à :",
      remove: "Retirer",
      removeConfirm: "Retirer cette personne ? Cette action est irréversible.",
      drawError: "Impossible de lancer le tirage.",
      resetError: "Impossible de réinitialiser.",
      removeError: "Impossible de retirer cette personne.",
    },
    errors: {
      invalidBody: "Requête invalide.",
      nameRequired: "Veuillez saisir votre nom.",
      nameTooLong: "Ce nom est trop long (80 caractères maximum).",
      registrationClosed: "Les inscriptions sont closes — le tirage au sort a déjà eu lieu.",
      duplicateName:
        "Une personne portant ce nom est déjà inscrite (sans distinction de casse).",
      invalidLink: "Ce lien n'est pas valide.",
      drawAlreadyHappened:
        "Le tirage au sort a déjà eu lieu : les exclusions ne peuvent plus être modifiées.",
      unauthorized: "Non autorisé.",
      alreadyDrawn: "Le tirage a déjà été effectué. Réinitialisez-le avant de relancer.",
      needTwoParticipants: "Il faut au moins deux participants pour lancer le tirage.",
      noValidAssignment:
        "Aucune assignation valide n'est possible avec les exclusions actuelles.",
      invalidId: "Identifiant invalide.",
      resetBeforeRemoving: "Réinitialisez le tirage avant de retirer des participants.",
    },
  },
  en: {
    home: {
      subtitle: "Register your name and we'll secretly match everyone up.",
      successTitle: "Your registration is confirmed, {name}! 🎉",
      successText:
        "Here's your personal link. Keep it safe — it's the only way to see who you're giving a gift to, and it's shown only once.",
      copy: "Copy",
      copied: "Copied!",
      openLink: "Open my link →",
      closedTitle: "Registration is closed",
      closedText:
        "The draw has already happened. If you registered, open your personal link to see your match.",
      nameLabel: "Your name",
      namePlaceholder: "e.g. Alice",
      exclusionsLegend: "Anyone you'd rather not give a gift to?",
      optional: "(optional)",
      submit: "Register",
      submitting: "Registering…",
      footerNone: "Be the first to sign up!",
      footerOne: "1 person has signed up so far.",
      footerMany: "{count} people have signed up so far.",
      loadError: "Could not load the page. Please refresh.",
      genericError: "Something went wrong.",
      networkError: "Network error. Please try again.",
    },
    reveal: {
      invalidTitle: "This link isn't valid",
      invalidText: "Double-check the address you were given, or contact the organizer.",
      loading: "Loading…",
      greeting: "Hi {name},",
      matchIntro: "You're giving a gift to…",
      matchProblem: "Something went wrong — contact the organizer.",
      secret: "🤫 Don't tell anyone!",
      notDrawnTitle: "Hi {name} — you're registered 🎉",
      notDrawnText:
        "Keep this link safe. Once the organizer runs the draw, come back here to see who you're giving to.",
      exclusionsLegend: "Anyone you'd rather not give a gift to?",
      optional: "(optional)",
      save: "Save preferences",
      saving: "Saving…",
      saved: "Saved ✓",
      loadError: "Could not load your page. Please refresh.",
      saveError: "Could not save.",
      networkError: "Network error. Please try again.",
    },
    admin: {
      title: "Admin",
      loginHint: "Enter the admin secret to continue.",
      secretPlaceholder: "Admin secret",
      signIn: "Sign in",
      checking: "Checking…",
      wrongSecret: "Incorrect admin secret.",
      networkError: "Network error.",
      participantsOne: "1 participant",
      participantsMany: "{count} participants",
      drawn: "draw complete",
      notDrawn: "not drawn yet",
      signOut: "Sign out",
      drawTitle: "Run the draw",
      drawDescription:
        "Randomly assign everyone a giftee. Nobody gets themselves (or anyone they excluded).",
      drawButton: "Run draw",
      drawing: "Drawing…",
      needParticipants:
        "Need at least two participants to draw. Share the site so people can register!",
      drawComplete: "The draw is complete 🎉",
      assignmentsOne: "1 match",
      assignmentsMany: "{count} matches",
      copyResults: "Copy results",
      copied: "Copied!",
      confirm: "Confirm",
      resetDraw: "Reset & redraw",
      participantsTitle: "Participants",
      noneYet: "No one has registered yet.",
      exclusionsHint: "won't give to:",
      remove: "Remove",
      removeConfirm: "Remove this participant? This cannot be undone.",
      drawError: "Could not run the draw.",
      resetError: "Could not reset.",
      removeError: "Could not remove this participant.",
    },
    errors: {
      invalidBody: "Invalid request body.",
      nameRequired: "Please enter your name.",
      nameTooLong: "That name is too long (max 80 characters).",
      registrationClosed: "Registration is closed — the draw has already happened.",
      duplicateName:
        "Someone with this name is already registered (names are case-insensitive).",
      invalidLink: "This link is not valid.",
      drawAlreadyHappened:
        "The draw has already happened, so exclusions can no longer be changed.",
      unauthorized: "Unauthorized.",
      alreadyDrawn: "The draw has already been run. Reset it first to draw again.",
      needTwoParticipants: "You need at least two participants to run the draw.",
      noValidAssignment: "No valid assignment is possible with the current exclusions.",
      invalidId: "Invalid id.",
      resetBeforeRemoving: "Reset the draw before removing participants.",
    },
  },
};

export function format(
  text: string,
  params: Record<string, string | number> = {}
): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function getLocale(request?: {
  headers: { get(name: string): string | null };
}): Locale {
  const header = request?.headers.get("x-locale");
  return header === "en" ? "en" : "fr";
}
