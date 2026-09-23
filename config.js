window.CONFIG = {
  owner: 'solimaniashteyani-crypto',
  repo:  'my-messages',
  branch: 'main',
  ntfyBase: 'https://ntfy.sh',
  interactionsTopic: 'chal-v11-ix-K7mPq2WnR9xL4zB8',

  // ═══════════════════════════════════════════════════════
  // 📋 لیست اعضای هر گروه
  // ─────────────────────────────────────────────────────
  // هر عضو: { name: 'اسم', phone: 'شماره', role: 'نقش' }
  //
  // ⚠️ اسم باید دقیقاً همون چیزی باشه که کاربر توی PWA وارد کرده
  // ═══════════════════════════════════════════════════════

  groups: {
    friends: {
      name: 'دوستان',
      emoji: '👥',
      topic: 'chal-v11-fr-T3vYh6JdF2sN9cQ5',
      members: [
        // اسم دوستات رو اینجا اضافه کن، مثل:
        // { name: 'علی',   phone: '0912...', role: 'دوست' },
        // { name: 'حسین',  phone: '0913...', role: 'دوست' },
      ]
    },

    family: {
      name: 'خانواده',
      emoji: '🏡',
      topic: 'chal-v11-fa-M8bGk4XpZ7wR2nL6',
      members: [
        // { name: 'مامان', phone: '0912...', role: 'مادر' },
        // { name: 'بابا',  phone: '0913...', role: 'پدر' },
      ]
    },

    work: {
      name: 'همکاران',
      emoji: '💼',
      topic: 'chal-v11-wk-D5jHc9QtV3yB7mK1',
      members: [
        // { name: 'جواد',  phone: '0912...', role: 'مدیر فنی' },
        // { name: 'رضا',   phone: '0913...', role: 'حسابدار' },
      ]
    }
  }
};
