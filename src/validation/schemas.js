import { z } from "zod";

// Request body schemas, one per route that reads a body. Form-data fields
// (routes with file uploads) always arrive as strings, so numbers and
// booleans are converted rather than required to be of that type already.

const id = z.coerce.number({ invalid_type_error: "must be a number" }).int().positive();
const text = (max = 255) => z.string().trim().min(1, "is required").max(max);
const optionalText = (max = 255) => z.string().trim().max(max).optional();
// A value stored in a text column that clients may send as a number.
const textLike = (max = 255) => z.coerce.string().trim().max(max).optional();
const count = z.coerce.number().int().min(0).optional();
const bool = z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]);
const email = z.string().trim().toLowerCase().email("must be a valid email").max(254);
const password = z.string().min(8, "must be at least 8 characters").max(128);
const phone = z.coerce.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "must be a phone number");
const code = z.coerce.string().trim().min(1, "is required").max(10);
const latitude = z.coerce.number().min(-90).max(90);
const longitude = z.coerce.number().min(-180).max(180);

const passwordsMatch = (field, confirmField) => (body, ctx) => {
  if (body[field] !== body[confirmField]) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [confirmField], message: "Passwords do not match" });
  }
};

// Partial versions of create schemas for PUT routes: every field optional,
// but at least one must be given.
const update = (shape) =>
  z.object(shape).partial().refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Send at least one field to change",
  });

// ---- Accounts ----

export const signup = z
  .object({
    username: text(50),
    email,
    password,
    confirm_password: z.string(),
    roleId: id.optional(),
  })
  .superRefine(passwordsMatch("password", "confirm_password"));

// No password rules at sign-in: older accounts may have shorter passwords.
export const signin = z.object({ email: z.string().trim().max(254), password: z.string().max(128) });

export const verifyOtp = z.object({ email, code });

export const forgotPassword = z.object({ email });

export const resetPassword = z
  .object({ email, code, password, confirm_password: z.string() })
  .superRefine(passwordsMatch("password", "confirm_password"));

export const changePassword = z
  .object({ password, confirmPassword: z.string() })
  .superRefine(passwordsMatch("password", "confirmPassword"));

export const updateProfile = z.object({ username: optionalText(50), description: optionalText(2000) });

export const changeImage = z.object({ description: optionalText(2000), dateofbirth: optionalText(30) });

export const sendConnectionRequest = z.object({ selectedUserId: id });

export const acceptConnectionRequest = z.object({ senderId: id });

export const createRole = z.object({ roleName: text(50), active: bool.optional() });

export const createUserProfile = z.object({
  userId: id.optional(),
  user_fname: text(100),
  user_lname: text(100),
  user_phonenumber: phone,
  user_location: optionalText(),
  followers: z.array(id).optional(),
  following: z.array(id).optional(),
});

// ---- Landlords, tenants, agents ----

export const registerLandlord = z.object({
  userId: id.optional(),
  landlord_fname: text(100),
  landlord_lname: text(100),
  landlord_phonenumber: phone,
  landlord_idno: z.coerce.string().trim().min(1, "is required").max(20),
  landlord_location: optionalText(),
});

export const registerTenant = z.object({
  userId: id.optional(),
  tenant_fname: optionalText(100),
  tenant_lname: optionalText(100),
  tenant_idno: z.coerce.string().trim().min(1, "is required").max(20),
  tenant_phonenumber: phone,
  tenant_location: optionalText(),
});

const agentProfileFields = {
  agent_fname: text(100),
  agent_lname: text(100),
  agent_mname: optionalText(100),
  agent_phonenumber: phone,
  agent_gender: optionalText(20),
  agent_description: optionalText(5000),
};

export const createAgentProfile = z.object({
  ...agentProfileFields,
  agent_idno: z.coerce.number().int().positive(),
});

export const updateAgentProfile = update(agentProfileFields);

const agentLocationFields = {
  agent_county: text(),
  agent_subcounty: text(),
  agent_town: optionalText(),
  agent_street: text(),
  agent_location_description: optionalText(),
};

export const createAgentLocation = z.object(agentLocationFields);
export const updateAgentLocation = update(agentLocationFields);

export const createAgentComment = z.object({ content: text(5000), agent_id: id });
export const updateComment = z.object({ content: text(5000) });

export const createApartmentComment = z
  .object({ content: text(5000), apartmentId: id.optional(), apartment_id: id.optional() })
  .refine((body) => body.apartmentId !== undefined || body.apartment_id !== undefined, {
    path: ["apartmentId"],
    message: "is required",
  });

// ---- Listings ----

export const createApartment = z.object({
  apartment_name: text(),
  apartment_location: optionalText(),
  apartment_description: optionalText(5000),
  address: optionalText(1000),
});

export const updateApartment = update({
  apartment_name: text(),
  apartment_location: optionalText(),
  apartment_slug: optionalText(),
  rent_amount: textLike(),
  apartment_description: optionalText(5000),
  agent_id: id,
});

const propertyFields = {
  apartment_name: text(),
  apartment_location: optionalText(),
  apartment_description: optionalText(5000),
  apartment_price: textLike(),
};

export const createProperty = z.object({ ...propertyFields, address: optionalText(1000) });
export const updateProperty = update(propertyFields);

export const uploadApartmentFiles = z.object({ apartment_id: id });

export const uploadPropertyFiles = z
  .object({ property_id: id.optional(), apartment_id: id.optional() })
  .refine((body) => body.property_id !== undefined || body.apartment_id !== undefined, {
    path: ["property_id"],
    message: "is required",
  });

const paymentPlanFields = {
  unit_type: z.coerce.number().int(),
  plan_description: optionalText(5000),
  pricing_amount: textLike(),
  plan_duration: textLike(),
  currency_type: optionalText(10),
};

export const createPaymentPlan = z.object({ apartment_id: id, ...paymentPlanFields });
export const updatePaymentPlan = update(paymentPlanFields);

export const verifyApartmentCreation = z.object({ code });

// Listing details: create needs the listing's id, update may move a record
// to another listing (the controller checks rights over both).
const detail = (parentKey, fields) => ({
  create: z.object({ [parentKey]: id, ...fields }),
  update: update({ [parentKey]: id, ...fields }),
});

const locationFields = {
  country: optionalText(100),
  county: optionalText(100),
  city_town: optionalText(100),
  latitude: latitude.transform(String).optional(),
  longitude: longitude.transform(String).optional(),
  address: optionalText(1000),
  location_description: optionalText(),
};

export const apartmentProperties = detail("apartment_id", {
  number_of_units: textLike(),
  number_of_one_bd: count,
  number_of_two_bd: count,
  number_of_three_bd: count,
  number_of_four_bd: count,
});

export const apartmentFacilities = detail("apartment_id", {
  facility_name: optionalText(),
  service_provider: optionalText(),
  provider_contact: optionalText(),
});

export const apartmentLocations = detail("apartment_id", locationFields);

export const propertyFacilities = detail("property_id", { facility_name: optionalText() });

export const propertyProperties = detail("property_id", {
  bedrooms: textLike(),
  bathrooms: textLike(),
  kitchen: textLike(),
});

export const propertyLocations = detail("property_id", locationFields);

// ---- Market and cart ----

export const createMarket = z.object({
  product_name: text(),
  product_description: optionalText(5000),
  product_quantity: count,
  product_price: z.coerce.number().int().min(0),
});

export const updateCartQuantity = z.object({ action: z.enum(["increment", "decrement"]) });

// ---- Messaging, social, notifications ----

export const sendMessage = z.object({
  receiverId: id,
  message: text(5000),
  messageType: z.enum(["text", "image"]).optional(),
});

export const friendRequest = z.object({ receiverId: id });

export const storeDeviceToken = z.object({ deviceToken: text(4096) });

export const registerPushToken = z.object({ token: text(4096) });

export const sendNotification = z.object({
  title: optionalText(),
  body: text(1000),
  imageUrl: z.string().trim().url().max(2000).optional(),
  type: optionalText(50),
});

export const addRating = z.object({
  itemId: z.coerce.string().trim().min(1, "is required").max(100),
  rating: z.coerce.number().min(1).max(5),
});

export const saveLocation = z.object({
  latitude,
  longitude,
  timestamp: z.union([z.number(), z.string().max(50)]).optional(),
});
