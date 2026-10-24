export const DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
] as const;

export type District = (typeof DISTRICTS)[number];
export type Role = "worker" | "customer";

export type SignupValues = {
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  businessName: string;
  businessPhone: string;
  password: string;
  confirmPassword: string;
};

export type SignupField = keyof SignupValues;

export type SignupErrorCode =
  | "name"
  | "email"
  | "emailFormat"
  | "phone"
  | "phoneFormat"
  | "district"
  | "businessName"
  | "businessPhone"
  | "password"
  | "confirm"
  | "match";

export type SignupErrors = Partial<Record<SignupField, SignupErrorCode>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^(?:07\d{8}|\+947\d{8})$/;

const districtSet = new Set<string>(DISTRICTS);

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function isSriLankanPhone(value: string): boolean {
  return PHONE.test(normalizePhone(value));
}

function phoneError(value: string, emptyCode: "phone" | "businessPhone"): SignupErrorCode | undefined {
  const phone = normalizePhone(value);
  if (!phone) return emptyCode;
  if (!PHONE.test(phone)) return "phoneFormat";
  return undefined;
}

export function validateField(field: SignupField, values: SignupValues): SignupErrorCode | undefined {
  if (values.role === "customer" && (field === "businessName" || field === "businessPhone")) {
    return undefined;
  }

  switch (field) {
    case "role":
      return values.role === "worker" || values.role === "customer" ? undefined : "name";
    case "fullName":
      return values.fullName.trim() ? undefined : "name";
    case "email": {
      const email = values.email.trim();
      if (!email) return "email";
      return EMAIL.test(email) ? undefined : "emailFormat";
    }
    case "phone":
      return phoneError(values.phone, "phone");
    case "district":
      return districtSet.has(values.district) ? undefined : "district";
    case "businessName":
      return values.businessName.trim() ? undefined : "businessName";
    case "businessPhone":
      return phoneError(values.businessPhone, "businessPhone");
    case "password":
      return values.password.length >= 8 ? undefined : "password";
    case "confirmPassword":
      if (!values.confirmPassword) return "confirm";
      return values.confirmPassword === values.password ? undefined : "match";
    default:
      return undefined;
  }
}

const customerFields: SignupField[] = ["fullName", "email", "phone", "district", "password", "confirmPassword"];
const workerFields: SignupField[] = [...customerFields, "businessName", "businessPhone"];

export function validateSignup(values: SignupValues): SignupErrors {
  const fields = values.role === "worker" ? workerFields : customerFields;
  const errors: SignupErrors = {};
  for (const field of fields) {
    const code = validateField(field, values);
    if (code) errors[field] = code;
  }
  return errors;
}

export function firstInvalidField(errors: SignupErrors): SignupField | undefined {
  const order: SignupField[] = [
    "fullName",
    "email",
    "phone",
    "district",
    "businessName",
    "businessPhone",
    "password",
    "confirmPassword",
  ];
  return order.find((field) => errors[field]);
}
