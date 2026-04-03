import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const dictionary = {
  en: {
    "login_title": "Login to Nordle",
    "username_placeholder": "Enter Username...",
    "login_btn": "Start Decrypting",
    "subtitle": "CRACK THE CODE",
    "play_offline": "Play Offline",
    "play_online": "Play Online",
    "metrics": "Metrics",
    "settings": "Settings",
    "choose_diff": "Choose Difficulty",
    "digits": "digits",
    "tries": "tries",
    "score_mult": "x score multiplier",
    "solo": "Solo",
    "pvp": "PvP",
    "metrics_title": "Metrics & Stats",
    "match_history": "Match History",
    "global_leaderbd": "Global Leaderboard",
    "rank": "Rank",
    "username": "Username",
    "wins": "Wins",
    "losses": "Losses",
    "select_lang": "Language / اللغة",
    "settings_title": "Settings",
    "games_played": "Games Played",
    "win_rate": "Win Rate",
    "total_score": "Total Score",
    "won": "Won",
    "lost": "Lost",
    "draw": "Draw",
    "round": "Round",
    "waiting_opp": "Waiting for Opponent...",
    "game_over": "Game Over",
    "victory": "You Cracked It!",
    "defeat": "You Failed!",
    "secret_was": "The secret was: ",
    "home_btn": "Home",
    "play_again_btn": "Play Again",
    "global_stats": "Global Stats",
    "played": "Played",
    "avg_tries": "Avg Tries",
    "online_record": "Online Record",
    "matches": "Matches",
    "rounds_won": "Rounds Won",
    "login_subtitle": "Enter a username to continue"
  },
  ar: {
    "login_title": "تسجيل الدخول",
    "username_placeholder": "أدخل اسم المستخدم...",
    "login_btn": "ابدأ فك الشفرة",
    "subtitle": "حل الشفرة",
    "play_offline": "طاولة لعب فردي",
    "play_online": "اللعب مع آخرين",
    "metrics": "الإحصائيات",
    "settings": "الإعدادات",
    "choose_diff": "اختر الصعوبة",
    "digits": "أرقام",
    "tries": "محاولات",
    "score_mult": "مضاعف النقاط x",
    "solo": "فردي",
    "pvp": "ضد لاعب",
    "metrics_title": "الإحصائيات والأرقام",
    "match_history": "تاريخ المباريات",
    "global_leaderbd": "لائحة المتصدرين",
    "rank": "المرتبة",
    "username": "اللاعب",
    "wins": "انتصارات",
    "losses": "خسائر",
    "select_lang": "Language / اللغة",
    "settings_title": "الإعدادات",
    "games_played": "المباريات الملعوبة",
    "win_rate": "معدل الفوز",
    "total_score": "مجموع النقاط",
    "won": "فوز",
    "lost": "خسارة",
    "draw": "تعادل",
    "round": "جولة",
    "waiting_opp": "في انتظار المنافس...",
    "game_over": "انتهت اللعبة",
    "victory": "لقد حللت الشفرة!",
    "defeat": "لقد فشلت!",
    "secret_was": "الرقم السري كان: ",
    "home_btn": "الرئيسية",
    "play_again_btn": "العب مرة أخرى",
    "global_stats": "الإحصائيات العالمية",
    "played": "لعب",
    "avg_tries": "متوسط المحاولات",
    "online_record": "السجل على الإنترنت",
    "matches": "مباريات",
    "rounds_won": "جولات الفوز",
    "login_subtitle": "أدخل اسم المستخدم للمتابعة"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('nordle_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('nordle_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key) => dictionary[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
