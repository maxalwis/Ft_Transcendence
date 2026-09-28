import type { PreferredLanguage } from '../generated/prisma/client';

// Emails RGPD envoyés dans la langue préférée de l'utilisateur (FR par défaut, comme le schéma)

interface MailContent {
  subject: string;
  text: string;
  html?: string;
}

const exportNotice: Record<PreferredLanguage, MailContent> = {
  FR: {
    subject: 'Export de vos données',
    text: 'Vous avez demandé une copie de vos données. Elle a été générée et téléchargée depuis votre compte.',
  },
  EN: {
    subject: 'Your data export',
    text: 'You requested a copy of your data. It was generated and downloaded from your account.',
  },
  ES: {
    subject: 'Exportación de tus datos',
    text: 'Solicitaste una copia de tus datos. Se generó y se descargó desde tu cuenta.',
  },
  AR: {
    subject: 'تصدير بياناتك',
    text: 'لقد طلبت نسخة من بياناتك. تم إنشاؤها وتنزيلها من حسابك.',
  },
};

const deletionConfirm: Record<
  PreferredLanguage,
  { subject: string; intro: string; action: string; link: string; validity: string }
> = {
  FR: {
    subject: 'Confirmez la suppression de votre compte',
    intro:
      'Vous avez demandé la suppression définitive de votre compte. Cette action est irréversible.',
    action: 'Pour confirmer, ouvrez ce lien dans les 15 minutes :',
    link: 'Confirmer la suppression du compte',
    validity: '(valable 15 minutes)',
  },
  EN: {
    subject: 'Confirm your account deletion',
    intro: 'You requested to permanently delete your account. This cannot be undone.',
    action: 'To confirm, open this link within 15 minutes:',
    link: 'Confirm account deletion',
    validity: '(valid for 15 minutes)',
  },
  ES: {
    subject: 'Confirma la eliminación de tu cuenta',
    intro: 'Solicitaste eliminar tu cuenta de forma permanente. Esta acción no se puede deshacer.',
    action: 'Para confirmar, abre este enlace en los próximos 15 minutos:',
    link: 'Confirmar la eliminación de la cuenta',
    validity: '(válido durante 15 minutos)',
  },
  AR: {
    subject: 'تأكيد حذف حسابك',
    intro: 'لقد طلبت حذف حسابك نهائيًا. لا يمكن التراجع عن هذا الإجراء.',
    action: 'للتأكيد، افتح هذا الرابط خلال 15 دقيقة:',
    link: 'تأكيد حذف الحساب',
    validity: '(صالح لمدة 15 دقيقة)',
  },
};

const deletedNotice: Record<PreferredLanguage, MailContent> = {
  FR: {
    subject: 'Votre compte a été supprimé',
    text: 'Votre compte et toutes les données associées ont été définitivement supprimés.',
  },
  EN: {
    subject: 'Your account has been deleted',
    text: 'Your account and all associated data have been permanently deleted.',
  },
  ES: {
    subject: 'Tu cuenta ha sido eliminada',
    text: 'Tu cuenta y todos los datos asociados se han eliminado de forma permanente.',
  },
  AR: {
    subject: 'تم حذف حسابك',
    text: 'تم حذف حسابك وجميع البيانات المرتبطة به نهائيًا.',
  },
};

export function exportNoticeMail(lang: PreferredLanguage): MailContent {
  return exportNotice[lang] ?? exportNotice.FR;
}

export function deletionConfirmMail(lang: PreferredLanguage, confirmUrl: string): MailContent {
  const m = deletionConfirm[lang] ?? deletionConfirm.FR;
  const dir = lang === 'AR' ? 'rtl' : 'ltr';

  return {
    subject: m.subject,
    text: `${m.intro}\n\n${m.action}\n\n${confirmUrl}`,
    html:
      `<div dir="${dir}"><p>${m.intro}</p>` +
      `<p><a href="${confirmUrl}">${m.link}</a> ${m.validity}</p></div>`,
  };
}

export function deletedNoticeMail(lang: PreferredLanguage): MailContent {
  return deletedNotice[lang] ?? deletedNotice.FR;
}
