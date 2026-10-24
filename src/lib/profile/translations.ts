// Profile copy for English, Sinhala, and Tamil.
// The page reads the language already saved by the language switcher.

import type { District } from "@/lib/signup/validate";
import type { Lang } from "@/lib/types";
import type { ProfileErrorCode } from "@/lib/profile/types";

export type ProfileCopy = {
  details: string;
  ownerName: string;
  businessName: string;
  businessType: string;
  description: string;
  district: string;
  businessPhone: string;
  email: string;
  edit: string;
  save: string;
  cancel: string;
  saving: string;
  saved: string;
  worker: string;
  customer: string;
  reviews: string;
  noRatings: string;
  oneRating: string;
  manyRatings: string;
  starsLabel: string;
  starOption: string;
  starOptions: string;
  chatWhatsApp: string;
  call: string;
  unverified: string;
  report: string;
  reportTitle: string;
  reportBody: string;
  reportSend: string;
  reportThanks: string;
  reportMissing: string;
  downloadQr: string;
  qrLabel: string;
  qrError: string;
  interests: string;
  editInterests: string;
  noInterests: string;
  interestsError: string;
  interestsTitle: string;
  interestsHint: string;
  interestsSuggested: string;
  interestsSaved: string;
  interestsSave: string;
  backToProfile: string;
  improve: string;
  improving: string;
  accept: string;
  discard: string;
  aiNote: string;
  aiEmpty: string;
  aiFailed: string;
  mockNote: string;
  workerPlaceholder: string;
  customerPlaceholder: string;
  unsaved: string;
  loadError: string;
  notFound: string;
  signInToView: string;
  logIn: string;
  unavailable: string;
  saveError: string;
  protected: string;
  sessionExpired: string;
  retry: string;
  notAdded: string;
  noDescription: string;
  rateTitle: string;
  updateRating: string;
  comment: string;
  commentPlaceholder: string;
  submitRating: string;
  ratingSaved: string;
  ratingError: string;
  cannotRateSelf: string;
  sameRole: string;
  ratingsError: string;
  noComment: string;
  selectDistrict: string;
  selectBusinessType: string;
  cancelConfirm: string;
  roleFields: string;
  errors: Record<ProfileErrorCode | "stars" | "commentLength", string>;
  districts: Record<District, string>;
};

const enDistricts: Record<District, string> = {
  Ampara: "Ampara",
  Anuradhapura: "Anuradhapura",
  Badulla: "Badulla",
  Batticaloa: "Batticaloa",
  Colombo: "Colombo",
  Galle: "Galle",
  Gampaha: "Gampaha",
  Hambantota: "Hambantota",
  Jaffna: "Jaffna",
  Kalutara: "Kalutara",
  Kandy: "Kandy",
  Kegalle: "Kegalle",
  Kilinochchi: "Kilinochchi",
  Kurunegala: "Kurunegala",
  Mannar: "Mannar",
  Matale: "Matale",
  Matara: "Matara",
  Monaragala: "Monaragala",
  Mullaitivu: "Mullaitivu",
  "Nuwara Eliya": "Nuwara Eliya",
  Polonnaruwa: "Polonnaruwa",
  Puttalam: "Puttalam",
  Ratnapura: "Ratnapura",
  Trincomalee: "Trincomalee",
  Vavuniya: "Vavuniya",
};

const siDistricts: Record<District, string> = {
  Ampara: "අම්පාර",
  Anuradhapura: "අනුරාධපුරය",
  Badulla: "බදුල්ල",
  Batticaloa: "මඩකලපුව",
  Colombo: "කොළඹ",
  Galle: "ගාල්ල",
  Gampaha: "ගම්පහ",
  Hambantota: "හම්බන්තොට",
  Jaffna: "යාපනය",
  Kalutara: "කළුතර",
  Kandy: "මහනුවර",
  Kegalle: "කෑගල්ල",
  Kilinochchi: "කිලිනොච්චිය",
  Kurunegala: "කුරුණෑගල",
  Mannar: "මන්නාරම",
  Matale: "මාතලේ",
  Matara: "මාතර",
  Monaragala: "මොණරාගල",
  Mullaitivu: "මුලතිව්",
  "Nuwara Eliya": "නුවරඑළිය",
  Polonnaruwa: "පොළොන්නරුව",
  Puttalam: "පුත්තලම",
  Ratnapura: "රත්නපුර",
  Trincomalee: "ත්‍රිකුණාමලය",
  Vavuniya: "වව්නියාව",
};

const taDistricts: Record<District, string> = {
  Ampara: "அம்பாறை",
  Anuradhapura: "அனுராதபுரம்",
  Badulla: "பதுளை",
  Batticaloa: "மட்டக்களப்பு",
  Colombo: "கொழும்பு",
  Galle: "காலி",
  Gampaha: "கம்பஹா",
  Hambantota: "அம்பாந்தோட்டை",
  Jaffna: "யாழ்ப்பாணம்",
  Kalutara: "களுத்துறை",
  Kandy: "கண்டி",
  Kegalle: "கேகாலை",
  Kilinochchi: "கிளிநொச்சி",
  Kurunegala: "குருநாகல்",
  Mannar: "மன்னார்",
  Matale: "மாத்தளை",
  Matara: "மாத்தறை",
  Monaragala: "மொணராகலை",
  Mullaitivu: "முல்லைத்தீவு",
  "Nuwara Eliya": "நுவரெலியா",
  Polonnaruwa: "பொலன்னறுவை",
  Puttalam: "புத்தளம்",
  Ratnapura: "இரத்தினபுரி",
  Trincomalee: "திருகோணமலை",
  Vavuniya: "வவுனியா",
};

export const profileTranslations: Record<Lang, ProfileCopy> = {
  en: {
    details: "Details",
    ownerName: "Owner name",
    businessName: "Business name",
    businessType: "Business type",
    description: "Description",
    district: "District",
    businessPhone: "Business phone number",
    email: "Email",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving…",
    saved: "Profile saved.",
    worker: "Worker",
    customer: "Customer",
    reviews: "Reviews",
    noRatings: "No ratings yet.",
    oneRating: "1 rating",
    manyRatings: "{count} ratings",
    starsLabel: "{value} out of 5 stars",
    starOption: "{count} star",
    starOptions: "{count} stars",
    chatWhatsApp: "Chat on WhatsApp",
    call: "Call",
    unverified: "Profile details are self-reported and unverified.",
    report: "Report this profile",
    reportTitle: "Report this profile",
    reportBody: "Tell us what is wrong. We will review this profile.",
    reportSend: "Send report",
    reportThanks: "Thank you. We will review this profile.",
    reportMissing: "Open a profile and use Report this profile.",
    downloadQr: "Download QR",
    qrLabel: "QR code for this profile",
    qrError: "The QR code could not be created.",
    interests: "Interests",
    editInterests: "Edit interests",
    noInterests: "No interests selected yet.",
    interestsError: "Interests could not be loaded.",
    interestsTitle: "Your interests",
    interestsHint: "Choose the kinds of work you offer or usually need.",
    interestsSuggested: "Suggested jobs are added only for House cleaning and Home cooking.",
    interestsSaved: "Interests saved.",
    interestsSave: "Save interests",
    backToProfile: "Back to profile",
    improve: "Improve my description with AI",
    improving: "Improving…",
    accept: "Use this suggestion",
    discard: "Discard",
    aiNote: "AI suggestions may contain mistakes. Please check before saving.",
    aiEmpty: "Write a short description first.",
    aiFailed: "We could not improve the description. Please try again.",
    mockNote: "No Gemini key is set. This suggestion only tidies the words you wrote.",
    workerPlaceholder: "Tell customers what you do, your experience, and how to book you.",
    customerPlaceholder: "Tell workers a little about yourself and the kind of work you usually need.",
    unsaved: "You have unsaved changes. Leave without saving?",
    loadError: "We could not load this profile. Please try again.",
    notFound: "We could not find that profile.",
    signInToView: "Log in to view this profile.",
    logIn: "Log in",
    unavailable: "Profiles are not connected yet. Add your Supabase URL and anon key, then try again.",
    saveError: "We could not save your profile. Please try again.",
    protected: "That part of the profile cannot be changed.",
    sessionExpired: "Please log in again.",
    retry: "Try again",
    notAdded: "Not added yet.",
    noDescription: "No description yet.",
    rateTitle: "Leave a rating",
    updateRating: "Update your rating",
    comment: "Comment (optional)",
    commentPlaceholder: "Share a short note about your experience.",
    submitRating: "Submit rating",
    ratingSaved: "Rating saved.",
    ratingError: "We could not save your rating. Please try again.",
    cannotRateSelf: "You cannot rate your own profile.",
    sameRole: "You can only rate someone with a different role.",
    ratingsError: "We could not load ratings.",
    noComment: "No written comment.",
    selectDistrict: "Select a district",
    selectBusinessType: "Select a business type",
    cancelConfirm: "Discard your unsaved changes?",
    roleFields: "Customers cannot set business details.",
    errors: {
      name: "Enter the owner name.",
      nameLength: "Use 2 to 60 characters.",
      businessName: "Enter the business name.",
      businessNameLength: "Use 2 to 80 characters.",
      businessType: "Select a business type.",
      descriptionLength: "Use 400 characters or fewer.",
      district: "Select a district.",
      businessPhone: "Enter the business phone number.",
      phoneFormat: "Use 07XXXXXXXX or +947XXXXXXXX.",
      stars: "Choose a rating from 1 to 5 stars.",
      commentLength: "Use 200 characters or fewer.",
    },
    districts: enDistricts,
  },
  si: {
    details: "විස්තර",
    ownerName: "හිමිකරුගේ නම",
    businessName: "ව්‍යාපාරයේ නම",
    businessType: "ව්‍යාපාර වර්ගය",
    description: "විස්තරය",
    district: "දිස්ත්‍රික්කය",
    businessPhone: "ව්‍යාපාර දුරකථන අංකය",
    email: "විද්‍යුත් තැපෑල",
    edit: "වෙනස් කරන්න",
    save: "සුරකින්න",
    cancel: "අවලංගු කරන්න",
    saving: "සුරකිමින්…",
    saved: "පැතිකඩ සුරැකුණා.",
    worker: "සේවකයා",
    customer: "පාරිභෝගිකයා",
    reviews: "ඇගයීම්",
    noRatings: "තවම ඇගයීම් නැත.",
    oneRating: "ඇගයීම් 1",
    manyRatings: "ඇගයීම් {count}",
    starsLabel: "තරු 5න් {value}",
    starOption: "තරු {count}",
    starOptions: "තරු {count}",
    chatWhatsApp: "WhatsApp හරහා කතා කරන්න",
    call: "අමතන්න",
    unverified: "පැතිකඩ විස්තර තමන් විසින් දුන් ඒවා වන අතර තහවුරු කර නැත.",
    report: "මෙම පැතිකඩ වාර්තා කරන්න",
    reportTitle: "මෙම පැතිකඩ වාර්තා කරන්න",
    reportBody: "වැරදි මොනවාද කියන්න. අපි මෙම පැතිකඩ බලමු.",
    reportSend: "වාර්තාව යවන්න",
    reportThanks: "ස්තූතියි. අපි මෙම පැතිකඩ බලමු.",
    reportMissing: "පැතිකඩක් අරින්න, ඊළඟට වාර්තා කරන්න.",
    downloadQr: "QR බාගන්න",
    qrLabel: "මෙම පැතිකඩ සඳහා QR කේතය",
    qrError: "QR කේතය සෑදිය නොහැකි විය.",
    interests: "රුචිකත්ව",
    editInterests: "රුචිකත්ව වෙනස් කරන්න",
    noInterests: "තවම රුචිකත්ව තෝරා නැත.",
    interestsError: "රුචිකත්ව පූරණය කළ නොහැකි විය.",
    interestsTitle: "ඔබේ රුචිකත්ව",
    interestsHint: "ඔබ කරන හෝ සාමාන්‍යයෙන් අවශ්‍ය වැඩ වර්ග තෝරන්න.",
    interestsSuggested: "යෝජිත රැකියා එක් වන්නේ ගෙය පිරිසිදු කිරීම සහ ගෙදර ආහාර පිසීම සඳහා පමණි.",
    interestsSaved: "රුචිකත්ව සුරැකුණා.",
    interestsSave: "රුචිකත්ව සුරකින්න",
    backToProfile: "පැතිකඩට ආපසු",
    improve: "AI ආධාරයෙන් විස්තරය වැඩිදියුණු කරන්න",
    improving: "වැඩිදියුණු කරමින්…",
    accept: "මෙම යෝජනාව භාවිතා කරන්න",
    discard: "ඉවත ලන්න",
    aiNote: "AI යෝජනාවල වැරදි තිබිය හැක. සුරැකීමට පෙර පරීක්ෂා කරන්න.",
    aiEmpty: "පළමුව කෙටි විස්තරයක් ලියන්න.",
    aiFailed: "විස්තරය වැඩිදියුණු කළ නොහැකි විය. නැවත උත්සාහ කරන්න.",
    mockNote: "Gemini යතුරක් නැත. මෙය ඔබ ලියූ වචන පමණක් සකසයි.",
    workerPlaceholder: "ඔබ කරන වැඩ, අත්දැකීම්, සහ වෙන්කරවා ගන්නේ කෙසේද කියන්න.",
    customerPlaceholder: "ඔබ ගැනත් ඔබට සාමාන්‍යයෙන් අවශ්‍ය වැඩ ගැනත් කම්කරුවන්ට කියන්න.",
    unsaved: "සුරැකූ නැති වෙනස්කම් තිබේ. සුරකින්නේ නැතිව පිටවෙනවාද?",
    loadError: "මෙම පැතිකඩ පූරණය කළ නොහැකි විය. නැවත උත්සාහ කරන්න.",
    notFound: "ඒ පැතිකඩ හමු නොවුණා.",
    signInToView: "මෙම පැතිකඩ බැලීමට පිවිසෙන්න.",
    logIn: "පිවිසෙන්න",
    unavailable: "පැතිකඩ තවම සම්බන්ධ වී නැත. Supabase යතුරු එක් කර නැවත උත්සාහ කරන්න.",
    saveError: "පැතිකඩ සුරැකිය නොහැකි විය. නැවත උත්සාහ කරන්න.",
    protected: "පැතිකඩේ ඒ කොටස වෙනස් කළ නොහැක.",
    sessionExpired: "නැවත පිවිසෙන්න.",
    retry: "නැවත උත්සාහ කරන්න",
    notAdded: "තවම එක් කර නැත.",
    noDescription: "තවම විස්තරයක් නැත.",
    rateTitle: "ඇගයීමක් දෙන්න",
    updateRating: "ඔබේ ඇගයීම වෙනස් කරන්න",
    comment: "අදහස (අමතරයි)",
    commentPlaceholder: "ඔබේ අත්දැකීම ගැන කෙටි සටහනක් ලියන්න.",
    submitRating: "ඇගයීම යවන්න",
    ratingSaved: "ඇගයීම සුරැකුණා.",
    ratingError: "ඇගයීම සුරැකිය නොහැකි විය. නැවත උත්සාහ කරන්න.",
    cannotRateSelf: "ඔබට ඔබේම පැතිකඩ ඇගයිය නොහැක.",
    sameRole: "වෙනස් භූමිකාවක් ඇති කෙනෙකුට පමණක් ඇගයිය හැක.",
    ratingsError: "ඇගයීම් පූරණය කළ නොහැකි විය.",
    noComment: "ලිඛිත අදහසක් නැත.",
    selectDistrict: "දිස්ත්‍රික්කය තෝරන්න",
    selectBusinessType: "ව්‍යාපාර වර්ගය තෝරන්න",
    cancelConfirm: "සුරැකූ නැති වෙනස්කම් ඉවත ලන්නද?",
    roleFields: "පාරිභෝගිකයින්ට ව්‍යාපාර විස්තර සැකසිය නොහැක.",
    errors: {
      name: "හිමිකරුගේ නම ඇතුළත් කරන්න.",
      nameLength: "අකුරු 2 සිට 60 දක්වා භාවිතා කරන්න.",
      businessName: "ව්‍යාපාරයේ නම ඇතුළත් කරන්න.",
      businessNameLength: "අකුරු 2 සිට 80 දක්වා භාවිතා කරන්න.",
      businessType: "ව්‍යාපාර වර්ගය තෝරන්න.",
      descriptionLength: "අකුරු 400ක් හෝ ඊට අඩුවෙන් ලියන්න.",
      district: "දිස්ත්‍රික්කය තෝරන්න.",
      businessPhone: "ව්‍යාපාර දුරකථන අංකය ඇතුළත් කරන්න.",
      phoneFormat: "07XXXXXXXX හෝ +947XXXXXXXX ආකාරය භාවිතා කරන්න.",
      stars: "තරු 1 සිට 5 දක්වා තෝරන්න.",
      commentLength: "අකුරු 200ක් හෝ ඊට අඩුවෙන් ලියන්න.",
    },
    districts: siDistricts,
  },
  ta: {
    details: "விவரங்கள்",
    ownerName: "உரிமையாளர் பெயர்",
    businessName: "வணிகப் பெயர்",
    businessType: "வணிக வகை",
    description: "விவரம்",
    district: "மாவட்டம்",
    businessPhone: "வணிகத் தொலைபேசி எண்",
    email: "மின்னஞ்சல்",
    edit: "திருத்து",
    save: "சேமி",
    cancel: "ரத்து செய்",
    saving: "சேமிக்கிறது…",
    saved: "சுயவிவரம் சேமிக்கப்பட்டது.",
    worker: "பணியாளர்",
    customer: "வாடிக்கையாளர்",
    reviews: "மதிப்பீடுகள்",
    noRatings: "இன்னும் மதிப்பீடு இல்லை.",
    oneRating: "1 மதிப்பீடு",
    manyRatings: "{count} மதிப்பீடுகள்",
    starsLabel: "5 நட்சத்திரங்களில் {value}",
    starOption: "{count} நட்சத்திரம்",
    starOptions: "{count} நட்சத்திரங்கள்",
    chatWhatsApp: "WhatsApp-ல் அரட்டை",
    call: "அழைக்க",
    unverified: "சுயவிவர விவரங்கள் தாங்களே தெரிவித்தவை. அவை சரிபார்க்கப்படவில்லை.",
    report: "இந்த சுயவிவரத்தைப் புகாரளி",
    reportTitle: "இந்த சுயவிவரத்தைப் புகாரளி",
    reportBody: "என்ன தவறு என்று சொல்லுங்கள். இந்த சுயவிவரத்தைப் பார்ப்போம்.",
    reportSend: "புகாரை அனுப்பு",
    reportThanks: "நன்றி. இந்த சுயவிவரத்தைப் பார்ப்போம்.",
    reportMissing: "ஒரு சுயவிவரத்தைத் திறந்து புகாரளி என்பதைப் பயன்படுத்துங்கள்.",
    downloadQr: "QR பதிவிறக்கு",
    qrLabel: "இந்த சுயவிவரத்துக்கான QR குறியீடு",
    qrError: "QR குறியீட்டை உருவாக்க முடியவில்லை.",
    interests: "ஆர்வங்கள்",
    editInterests: "ஆர்வங்களைத் திருத்து",
    noInterests: "இன்னும் ஆர்வங்கள் தேர்வு செய்யப்படவில்லை.",
    interestsError: "ஆர்வங்களை ஏற்ற முடியவில்லை.",
    interestsTitle: "உங்கள் ஆர்வங்கள்",
    interestsHint: "நீங்கள் செய்யும் அல்லது வழக்கமாக தேவைப்படும் வேலை வகைகளைத் தேர்ந்தெடுங்கள்.",
    interestsSuggested: "பரிந்துரை வேலைகள் வீட்டு சுத்தம் மற்றும் வீட்டு சமையலுக்கு மட்டும் சேர்க்கப்படும்.",
    interestsSaved: "ஆர்வங்கள் சேமிக்கப்பட்டன.",
    interestsSave: "ஆர்வங்களைச் சேமி",
    backToProfile: "சுயவிவரத்துக்குத் திரும்பு",
    improve: "AI மூலம் என் விவரத்தை மேம்படுத்து",
    improving: "மேம்படுத்துகிறது…",
    accept: "இந்த பரிந்துரையைப் பயன்படுத்து",
    discard: "நிராகரி",
    aiNote: "AI பரிந்துரைகளில் தவறுகள் இருக்கலாம். சேமிக்கும் முன் பாருங்கள்.",
    aiEmpty: "முதலில் ஒரு சிறு விவரம் எழுதுங்கள்.",
    aiFailed: "விவரத்தை மேம்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    mockNote: "Gemini திறப்பு இல்லை. இது நீங்கள் எழுதிய சொற்களை மட்டும் சீர்படுத்துகிறது.",
    workerPlaceholder: "நீங்கள் செய்யும் வேலை, அனுபவம், மற்றும் எப்படி முன்பதிவு செய்வது என்று சொல்லுங்கள்.",
    customerPlaceholder: "உங்களைப் பற்றியும் நீங்கள் வழக்கமாக தேவைப்படும் வேலையைப் பற்றியும் சொல்லுங்கள்.",
    unsaved: "சேமிக்காத மாற்றங்கள் உள்ளன. சேமிக்காமல் வெளியேறவா?",
    loadError: "இந்த சுயவிவரத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    notFound: "அந்த சுயவிவரம் கிடைக்கவில்லை.",
    signInToView: "இந்த சுயவிவரத்தைப் பார்க்க உள்நுழையுங்கள்.",
    logIn: "உள்நுழைக",
    unavailable: "சுயவிவரங்கள் இன்னும் இணைக்கப்படவில்லை. Supabase விசைகளைச் சேர்த்து மீண்டும் முயற்சிக்கவும்.",
    saveError: "சுயவிவரத்தைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    protected: "சுயவிவரத்தின் அந்த பகுதியை மாற்ற முடியாது.",
    sessionExpired: "மீண்டும் உள்நுழையுங்கள்.",
    retry: "மீண்டும் முயற்சிக்கவும்",
    notAdded: "இன்னும் சேர்க்கப்படவில்லை.",
    noDescription: "இன்னும் விவரம் இல்லை.",
    rateTitle: "மதிப்பீடு அளிக்கவும்",
    updateRating: "உங்கள் மதிப்பீட்டை மாற்றுங்கள்",
    comment: "கருத்து (கட்டாயம் அல்ல)",
    commentPlaceholder: "உங்கள் அனுபவத்தைப் பற்றி ஒரு சிறு குறிப்பு எழுதுங்கள்.",
    submitRating: "மதிப்பீட்டை அனுப்பு",
    ratingSaved: "மதிப்பீடு சேமிக்கப்பட்டது.",
    ratingError: "மதிப்பீட்டைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    cannotRateSelf: "உங்கள் சொந்த சுயவிவரத்துக்கு மதிப்பீடு அளிக்க முடியாது.",
    sameRole: "வேறு பங்கு உள்ள ஒருவருக்கு மட்டுமே மதிப்பீடு அளிக்க முடியும்.",
    ratingsError: "மதிப்பீடுகளை ஏற்ற முடியவில்லை.",
    noComment: "எழுத்து கருத்து இல்லை.",
    selectDistrict: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்",
    selectBusinessType: "வணிக வகையைத் தேர்ந்தெடுக்கவும்",
    cancelConfirm: "சேமிக்காத மாற்றங்களை நிராகரிக்கவா?",
    roleFields: "வாடிக்கையாளர்கள் வணிக விவரங்களை அமைக்க முடியாது.",
    errors: {
      name: "உரிமையாளர் பெயரை உள்ளிடவும்.",
      nameLength: "2 முதல் 60 எழுத்துகள் வரை பயன்படுத்தவும்.",
      businessName: "வணிகப் பெயரை உள்ளிடவும்.",
      businessNameLength: "2 முதல் 80 எழுத்துகள் வரை பயன்படுத்தவும்.",
      businessType: "வணிக வகையைத் தேர்ந்தெடுக்கவும்.",
      descriptionLength: "400 எழுத்துகள் அல்லது அதற்கும் குறைவாக எழுதுங்கள்.",
      district: "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.",
      businessPhone: "வணிகத் தொலைபேசி எண்ணை உள்ளிடவும்.",
      phoneFormat: "07XXXXXXXX அல்லது +947XXXXXXXX வடிவத்தைப் பயன்படுத்தவும்.",
      stars: "1 முதல் 5 நட்சத்திரங்கள் வரை தேர்ந்தெடுக்கவும்.",
      commentLength: "200 எழுத்துகள் அல்லது அதற்கும் குறைவாக எழுதுங்கள்.",
    },
    districts: taDistricts,
  },
};

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
