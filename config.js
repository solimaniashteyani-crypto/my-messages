window.CONFIG = {
  owner: 'solimaniashteyani-crypto',
  repo: 'my-messages',
  branch: 'main',
  ntfyBase: 'https://ntfy.sh',
  interactionsTopic: 'chal-v11-ix-K7mPq2WnR9xL4zB8',

  // ═══════════════════════════════════════════════════════
  // 📁 گروه‌ها (۴۰ گروه)
  // ─────────────────────────────────────────────────────
  // هر گروه: { name, emoji, topic, category }
  // category: خانواده | ویژه | استان | سایر
  // ═══════════════════════════════════════════════════════

  groups: {

    // ═══════════ 🏡 خانواده ═══════════
    hamsar: {
      name: 'همسر', emoji: '💑', category: 'خانواده',
      topic: 'chal-v11-hm-P1Q2R3S4T5U6'
    },
    amirmohammad: {
      name: 'امیرمحمد', emoji: '👦', category: 'خانواده',
      topic: 'chal-v11-am-V1W2X3Y4Z5A6'
    },
    amirali: {
      name: 'امیرعلی', emoji: '👦', category: 'خانواده',
      topic: 'chal-v11-aa-B1C2D3E4F5G6'
    },

    // ═══════════ 🕌 رابطین ویژه ═══════════
    rabet_kashan: {
      name: 'رابط کاشان', emoji: '🕌', category: 'ویژه',
      topic: 'chal-v11-rk-H1I2J3K4L5M6'
    },
    rabet_bonab: {
      name: 'رابط بناب', emoji: '🕌', category: 'ویژه',
      topic: 'chal-v11-rb-N1O2P3Q4R5S6'
    },
    rabet_babel: {
      name: 'رابط بابل', emoji: '🕌', category: 'ویژه',
      topic: 'chal-v11-rl-T1U2V3W4X5Y6'
    },
    rabet_kahnoj: {
      name: 'رابط کهنوج', emoji: '🕌', category: 'ویژه',
      topic: 'chal-v11-rn-Z1A2B3C4D5E6'
    },

    // ═══════════ 🕌 رابطین ۳۱ استان ═══════════
    rabet_az_sharghi: { name: 'رابط آذربایجان شرقی', emoji: '🕌', category: 'استان', topic: 'chal-v11-s01-F1G2H3I4J5K6' },
    rabet_az_gharbi:  { name: 'رابط آذربایجان غربی', emoji: '🕌', category: 'استان', topic: 'chal-v11-s02-L1M2N3O4P5Q6' },
    rabet_ardebil:    { name: 'رابط اردبیل',          emoji: '🕌', category: 'استان', topic: 'chal-v11-s03-R1S2T3U4V5W6' },
    rabet_esfahan:    { name: 'رابط اصفهان',          emoji: '🕌', category: 'استان', topic: 'chal-v11-s04-X1Y2Z3A4B5C6' },
    rabet_alborz:     { name: 'رابط البرز',            emoji: '🕌', category: 'استان', topic: 'chal-v11-s05-D1E2F3G4H5I6' },
    rabet_ilam:       { name: 'رابط ایلام',            emoji: '🕌', category: 'استان', topic: 'chal-v11-s06-J1K2L3M4N5O6' },
    rabet_bushehr:    { name: 'رابط بوشهر',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s07-P1Q2R3S4T5U6' },
    rabet_tehran:     { name: 'رابط تهران',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s08-V1W2X3Y4Z5A6' },
    rabet_chaharmahal:{ name: 'رابط چهارمحال و بختیاری', emoji: '🕌', category: 'استان', topic: 'chal-v11-s09-B1C2D3E4F5G6' },
    rabet_kh_jonoobi: { name: 'رابط خراسان جنوبی',    emoji: '🕌', category: 'استان', topic: 'chal-v11-s10-H1I2J3K4L5M6' },
    rabet_kh_razavi:  { name: 'رابط خراسان رضوی',     emoji: '🕌', category: 'استان', topic: 'chal-v11-s11-N1O2P3Q4R5S6' },
    rabet_kh_shomali: { name: 'رابط خراسان شمالی',    emoji: '🕌', category: 'استان', topic: 'chal-v11-s12-T1U2V3W4X5Y6' },
    rabet_khozestan:  { name: 'رابط خوزستان',         emoji: '🕌', category: 'استان', topic: 'chal-v11-s13-Z1A2B3C4D5E6' },
    rabet_zanjan:     { name: 'رابط زنجان',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s14-F1G2H3I4J5K6' },
    rabet_semnan:     { name: 'رابط سمنان',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s15-L1M2N3O4P5Q6' },
    rabet_sistan:     { name: 'رابط سیستان و بلوچستان', emoji: '🕌', category: 'استان', topic: 'chal-v11-s16-R1S2T3U4V5W6' },
    rabet_fars:       { name: 'رابط فارس',            emoji: '🕌', category: 'استان', topic: 'chal-v11-s17-X1Y2Z3A4B5C6' },
    rabet_qazvin:     { name: 'رابط قزوین',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s18-D1E2F3G4H5I6' },
    rabet_qom:        { name: 'رابط قم',              emoji: '🕌', category: 'استان', topic: 'chal-v11-s19-J1K2L3M4N5O6' },
    rabet_kordestan:  { name: 'رابط کردستان',         emoji: '🕌', category: 'استان', topic: 'chal-v11-s20-P1Q2R3S4T5U6' },
    rabet_kerman:     { name: 'رابط کرمان',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s21-V1W2X3Y4Z5A6' },
    rabet_kermanshah: { name: 'رابط کرمانشاه',        emoji: '🕌', category: 'استان', topic: 'chal-v11-s22-B1C2D3E4F5G6' },
    rabet_kohgiluye:  { name: 'رابط کهگیلویه و بویراحمد', emoji: '🕌', category: 'استان', topic: 'chal-v11-s23-H1I2J3K4L5M6' },
    rabet_golestan:   { name: 'رابط گلستان',          emoji: '🕌', category: 'استان', topic: 'chal-v11-s24-N1O2P3Q4R5S6' },
    rabet_gilan:      { name: 'رابط گیلان',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s25-T1U2V3W4X5Y6' },
    rabet_lorestan:   { name: 'رابط لرستان',          emoji: '🕌', category: 'استان', topic: 'chal-v11-s26-Z1A2B3C4D5E6' },
    rabet_mazandaran: { name: 'رابط مازندران',        emoji: '🕌', category: 'استان', topic: 'chal-v11-s27-F1G2H3I4J5K6' },
    rabet_markazi:    { name: 'رابط مرکزی',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s28-L1M2N3O4P5Q6' },
    rabet_hormozgan:  { name: 'رابط هرمزگان',         emoji: '🕌', category: 'استان', topic: 'chal-v11-s29-R1S2T3U4V5W6' },
    rabet_hamedan:    { name: 'رابط همدان',           emoji: '🕌', category: 'استان', topic: 'chal-v11-s30-X1Y2Z3A4B5C6' },
    rabet_yazd:       { name: 'رابط یزد',             emoji: '🕌', category: 'استان', topic: 'chal-v11-s31-D1E2F3G4H5I6' },

    // ═══════════ 👥 سایر ═══════════
    khayerin: {
      name: 'خیرین مسجد', emoji: '🕌', category: 'سایر',
      topic: 'chal-v11-kh-J1K2L3M4N5O6'
    },
    friends: {
      name: 'دوستان', emoji: '👥', category: 'سایر',
      topic: 'chal-v11-fr-P1Q2R3S4T5U6'
    }
  }
};
