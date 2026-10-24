export type Language = "en" | "si" | "ta";

export type SignupCopy = {
  languageLabel: string;
  brand: string;
  title: string;
  subtitle: string;
  roleLegend: string;
  workerTitle: string;
  workerHint: string;
  customerTitle: string;
  customerHint: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  district: string;
  districtPlaceholder: string;
  businessName: string;
  businessNamePlaceholder: string;
  businessPhone: string;
  businessPhonePlaceholder: string;
  samePhone: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  privacy: string;
  haveAccount: string;
  logIn: string;
  emailTaken: string;
  genericError: string;
  profileError: string;
  unavailable: string;
  confirmEmail: string;
  errors: {
    name: string;
    email: string;
    emailFormat: string;
    phone: string;
    phoneFormat: string;
    district: string;
    businessName: string;
    businessPhone: string;
    password: string;
    confirm: string;
    match: string;
  };
};

export const translations: Record<Language, SignupCopy> = {
  en: {
    languageLabel: "Language",
    brand: "Hela-Connect",
    title: "Create your account",
    subtitle: "Build a profile so customers in Sri Lanka can find informal businesses and the work they do.",
    roleLegend: "How will you use Hela-Connect?",
    workerTitle: "Worker / Business owner",
    workerHint: "Showcase my business and get found.",
    customerTitle: "Customer",
    customerHint: "Find businesses and services near me.",
    fullName: "Full name",
    fullNamePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    phone: "Phone number",
    phonePlaceholder: "07XXXXXXXX",
    district: "District",
    districtPlaceholder: "Select your district",
    businessName: "Business name",
    businessNamePlaceholder: "The name customers should see",
    businessPhone: "Business phone number",
    businessPhonePlaceholder: "07XXXXXXXX",
    samePhone: "Same as my phone number",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    confirmPlaceholder: "Repeat your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submit: "Create account",
    submitting: "Creating account…",
    privacy: "Your business phone number appears on your public page so customers can reach you.",
    haveAccount: "Already have an account?",
    logIn: "Log in",
    emailTaken: "This email is already registered. Try logging in instead.",
    genericError: "We could not create your account. Please check your details and try again.",
    profileError: "Your login was created, but we could not save your profile. Please try again in a moment.",
    unavailable: "Sign up is not connected yet. Add your Supabase URL and anon key, then try again.",
    confirmEmail: "Check your email to confirm your account. After that, log in to continue.",
    errors: {
      name: "Enter your full name.",
      email: "Enter your email address.",
      emailFormat: "Enter a valid email address.",
      phone: "Enter your phone number.",
      phoneFormat: "Use 07XXXXXXXX or +947XXXXXXXX.",
      district: "Select your district.",
      businessName: "Enter your business name.",
      businessPhone: "Enter your business phone number.",
      password: "Use at least 8 characters.",
      confirm: "Confirm your password.",
      match: "Passwords do not match.",
    },
  },
  si: {
    languageLabel: "භාෂාව",
    brand: "Hela-Connect",
    title: "ඔබේ ගිණුම සාදන්න",
    subtitle: "ශ්‍රී ලංකාවේ අවිධිමත් ව්‍යාපාරවලට පැතිකඩක් සාදා පාරිභෝගිකයින්ට හමුවීමට මෙය උදව් වේ.",
    roleLegend: "ඔබ Hela-Connect භාවිතා කරන්නේ කෙසේද?",
    workerTitle: "සේවකයා / ව්‍යාපාර හිමිකරු",
    workerHint: "මගේ ව්‍යාපාරය පෙන්වා පාරිභෝගිකයින්ට හමුවෙමි.",
    customerTitle: "පාරිභෝගිකයා",
    customerHint: "මා අසල ඇති ව්‍යාපාර සහ සේවා සොයමි.",
    fullName: "සම්පූර්ණ නම",
    fullNamePlaceholder: "ඔබේ නම",
    email: "විද්‍යුත් තැපෑල",
    emailPlaceholder: "you@email.com",
    phone: "දුරකථන අංකය",
    phonePlaceholder: "07XXXXXXXX",
    district: "දිස්ත්‍රික්කය",
    districtPlaceholder: "දිස්ත්‍රික්කය තෝරන්න",
    businessName: "ව්‍යාපාරයේ නම",
    businessNamePlaceholder: "පාරිභෝගිකයින්ට පෙනිය යුතු නම",
    businessPhone: "ව්‍යාපාර දුරකථන අංකය",
    businessPhonePlaceholder: "07XXXXXXXX",
    samePhone: "මගේ දුරකථන අංකයමයි",
    password: "මුරපදය",
    passwordPlaceholder: "අකුරු 8ක්වත්",
    confirmPassword: "මුරපදය තහවුරු කරන්න",
    confirmPlaceholder: "මුරපදය නැවත ලියන්න",
    showPassword: "මුරපදය පෙන්වන්න",
    hidePassword: "මුරපදය සඟවන්න",
    submit: "ගිණුම සාදන්න",
    submitting: "ගිණුම සාදමින්…",
    privacy: "ඔබේ ව්‍යාපාර දුරකථන අංකය ප්‍රසිද්ධ පිටුවේ පෙනේ, එවිට පාරිභෝගිකයින්ට ඔබව අමතන්න පුළුවන්.",
    haveAccount: "දැනටමත් ගිණුමක් තිබේද?",
    logIn: "පිවිසෙන්න",
    emailTaken: "මෙම විද්‍යුත් තැපෑල දැනටමත් ලියාපදිංචි වී ඇත. පිවිසීමට උත්සාහ කරන්න.",
    genericError: "ගිණුම සෑදිය නොහැකි විය. විස්තර පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
    profileError: "පිවිසුම සෑදුණත් පැතිකඩ සුරැකිය නොහැකි විය. මොහොතකින් නැවත උත්සාහ කරන්න.",
    unavailable: "ලියාපදිංචිය තවම සම්බන්ධ වී නැත. Supabase යතුරු එක් කර නැවත උත්සාහ කරන්න.",
    confirmEmail: "ගිණුම තහවුරු කිරීමට ඔබේ විද්‍යුත් තැපෑල බලන්න. ඉන්පසු පිවිසෙන්න.",
    errors: {
      name: "සම්පූර්ණ නම ඇතුළත් කරන්න.",
      email: "විද්‍යුත් තැපෑල ඇතුළත් කරන්න.",
      emailFormat: "වලංගු විද්‍යුත් තැපෑලක් ඇතුළත් කරන්න.",
      phone: "දුරකථන අංකය ඇතුළත් කරන්න.",
      phoneFormat: "07XXXXXXXX හෝ +947XXXXXXXX ආකාරය භාවිතා කරන්න.",
      district: "දිස්ත්‍රික්කය තෝරන්න.",
      businessName: "ව්‍යාපාරයේ නම ඇතුළත් කරන්න.",
      businessPhone: "ව්‍යාපාර දුරකථන අංකය ඇතුළත් කරන්න.",
      password: "අකුරු 8ක්වත් භාවිතා කරන්න.",
      confirm: "මුරපදය තහවුරු කරන්න.",
      match: "මුරපද දෙක නොගැලපේ.",
    },
  },
  ta: {
    languageLabel: "மொழி",
    brand: "Hela-Connect",
    title: "உங்கள் கணக்கை உருவாக்குங்கள்",
    subtitle: "இலங்கையின் முறைசாரா வணிகங்கள் சுயவிவரம் உருவாக்கி வாடிக்கையாளர்களால் கண்டறிய இது உதவுகிறது.",
    roleLegend: "Hela-Connect-ஐ எப்படிப் பயன்படுத்துவீர்கள்?",
    workerTitle: "பணியாளர் / வணிக உரிமையாளர்",
    workerHint: "என் வணிகத்தைக் காட்டி கண்டறியப்படுவேன்.",
    customerTitle: "வாடிக்கையாளர்",
    customerHint: "அருகிலுள்ள வணிகங்களையும் சேவைகளையும் தேடுவேன்.",
    fullName: "முழுப் பெயர்",
    fullNamePlaceholder: "உங்கள் பெயர்",
    email: "மின்னஞ்சல்",
    emailPlaceholder: "you@email.com",
    phone: "தொலைபேசி எண்",
    phonePlaceholder: "07XXXXXXXX",
    district: "மாவட்டம்",
    districtPlaceholder: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்",
    businessName: "வணிகப் பெயர்",
    businessNamePlaceholder: "வாடிக்கையாளர்கள் காணும் பெயர்",
    businessPhone: "வணிகத் தொலைபேசி எண்",
    businessPhonePlaceholder: "07XXXXXXXX",
    samePhone: "எனது தொலைபேசி எண்ணே",
    password: "கடவுச்சொல்",
    passwordPlaceholder: "குறைந்தது 8 எழுத்துகள்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்துங்கள்",
    confirmPlaceholder: "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
    showPassword: "கடவுச்சொல்லைக் காட்டு",
    hidePassword: "கடவுச்சொல்லை மறை",
    submit: "கணக்கை உருவாக்கு",
    submitting: "கணக்கு உருவாக்கப்படுகிறது…",
    privacy: "உங்கள் வணிகத் தொலைபேசி எண் பொதுப் பக்கத்தில் தோன்றும், வாடிக்கையாளர்கள் உங்களைத் தொடர்புகொள்ள.",
    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    logIn: "உள்நுழைக",
    emailTaken: "இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. உள்நுழைய முயற்சிக்கவும்.",
    genericError: "கணக்கை உருவாக்க முடியவில்லை. விவரங்களைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    profileError: "உள்நுழைவு உருவாக்கப்பட்டது, ஆனால் சுயவிவரத்தைச் சேமிக்க முடியவில்லை. சற்று நேரத்தில் மீண்டும் முயற்சிக்கவும்.",
    unavailable: "பதிவு இன்னும் இணைக்கப்படவில்லை. Supabase விசைகளைச் சேர்த்து மீண்டும் முயற்சிக்கவும்.",
    confirmEmail: "கணக்கை உறுதிப்படுத்த மின்னஞ்சலைப் பாருங்கள். பிறகு உள்நுழையுங்கள்.",
    errors: {
      name: "முழுப் பெயரை உள்ளிடவும்.",
      email: "மின்னஞ்சலை உள்ளிடவும்.",
      emailFormat: "சரியான மின்னஞ்சலை உள்ளிடவும்.",
      phone: "தொலைபேசி எண்ணை உள்ளிடவும்.",
      phoneFormat: "07XXXXXXXX அல்லது +947XXXXXXXX வடிவத்தைப் பயன்படுத்தவும்.",
      district: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.",
      businessName: "வணிகப் பெயரை உள்ளிடவும்.",
      businessPhone: "வணிகத் தொலைபேசி எண்ணை உள்ளிடவும்.",
      password: "குறைந்தது 8 எழுத்துகளைப் பயன்படுத்தவும்.",
      confirm: "கடவுச்சொல்லை உறுதிப்படுத்தவும்.",
      match: "கடவுச்சொற்கள் பொருந்தவில்லை.",
    },
  },
};

export const languageOptions: { id: Language; label: string }[] = [
  { id: "en", label: "English" },
  { id: "si", label: "සිංහල" },
  { id: "ta", label: "தமிழ்" },
];
