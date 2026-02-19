// API Response types
export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
}

// Error type
export interface ApiError {
    message: string;
    status: number;
}

// Common types used across API calls
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// User types example
export interface User {
    // first_name: string;
    id: string;
    name: string;
    email: string;
}

export interface UserCreateParams {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    external_id: string;
    user_type_id: number;
}

export interface createSubscription {
    subscription_id: string;
    platform: string;
}

export interface createBilling {
    account_name: string;
}

interface emailObject {
    "email": string
}

export interface inviteByEmail {
    invite_method: string;

    emails: [emailObject]
}

export interface inviteByLink {
    invite_method: string;
    license_count: string;
    moderation: number,
    email_domain_restriction: string;
    expiration_date: string;
}


export interface acceptInvite {
    invite_token: string;

    invite_method: string;
}

export interface actionInvite {
    email_address: string;

    action: string;
}


// --- TYPE DEFINITIONS ---

// Optional: Define types for specific string patterns if useful
// type IsoDateTimeString = string;
// type DateStringMMDDYYYY = string; // Adjust if needed

export interface Token {
    id: string;
    user_id: number;
    client_id: number;
    name: string | null;
    scopes: string[];
    revoked: boolean;
    created_at: string; // Consider using Date or IsoDateTimeString if consistency is guaranteed
    updated_at: string; // Consider using Date or IsoDateTimeString
    expires_at: string; // Consider using Date or IsoDateTimeString
}

export interface AccountDetails {
    id: number;
    account_name: string;
    primary_user: number;
    platform: string; // 'WEB' | 'MOBILE' ?
    subscription_id: string | null;
    product_id: string | null;
    licenses_count: number | null; // Sample shows 6, allow null just in case
    subscription_start_date: number | null; // Unix timestamp
    subscription_end_date: number | null; // Unix timestamp
    sub_id: number | null;
    is_trial: number; // 0 or 1? Consider boolean
    is_trial_period: number; // 0 or 1? Consider boolean
    account_approve: unknown | null; // Type unknown is safer than any if structure varies
    is_account_access: number; // 0 or 1? Consider boolean
    account_type_access: string | null; // 'TEAM_ADMIN' | 'INDIVIDUAL'? Consider string union type
}

// Main User interface matching the sample 'user' object
export interface UserResponse {
    id: number;
    user_type_id: number;
    email: string;
    phone_number: string | null;
    force_password_change: number; // 0 or 1? Consider boolean
    last_password_changed_at: string | null;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    date_of_birth: string | null;
    stripe_customer: string | null;
    status: number;
    trial_taken: number; // 0 or 1? Consider boolean
    is_social_sign_up: number; // 0 or 1? Consider boolean
    provider: string | null;
    provider_token: string | null;
    provider_user_id: string | null;
    email_verified_at: string | null;
    last_login_at: string | null;
    last_login_ip: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    external_id: string;
    tokens?: Token[]; // Optional as it might not always be present? Sample includes it.
    account_details: AccountDetails | null; // Sample has it, but allow null for flexibility
}

// Define the shape of the Auth slice's state
export interface AuthState {
    user: UserResponse | null; // User object or null
    accessToken: string | null; // Corresponds to the top-level access_token
    userTypeToken: string | null; // Corresponds to the top-level user_info_token
    subscription: any | null; // TODO: Define a specific 'Subscription' type if possible
    isAuthenticated: boolean;
}

export interface accountDetails {
    id: number;
    account_name: string | null;
    user_id: number;
    address: string | null;
}

export interface accessList {
    id: number;
    user_id: number | null;
    email_address: string | null;
    is_approve: number,
    status: number,
    created_at: string | null;
    first_name: string | null;
    last_name: string | null;
}

export interface inviteLinks {
    id: number;
    user_id: number | null;
    email_address: string | null;
    is_approve: number,
    status: number,
    created_at: string | null;
    first_name: string | null;
    last_name: string | null;
}

export interface inviteData {
    accountDetails: accountDetails | null;

    accessList: accessList[] | null;

    inviteLinks: inviteLinks[] | null;
}

interface linkConfiguration {

    message: string;

    license_count: string;
    moderation: number;
    email_domain_restriction: string,
    expiration_date: string;
    description: string

}

interface inviteLinkResponseData {

    id: number;

    link_configuration: linkConfiguration;

    link: string;

}

export interface inviteLinkResponse {
    message: string;
    data: inviteLinkResponseData
}


// Define the structure of a single document based on your API response
export interface Document {
    id: number;
    user_id: number;
    title: string;
    file_name: string;
    file_size: string;
    file_type: string;
    file_path: string;
    thumbnail: string;
    document_type_id: number | null;
    issue_date: string | null;
    no_expiration: number | null;
    expiry_date: string | null;
    favorite: number;
    description: string;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    document_tags: { slug?: string; name: string }[];
}

// Define the shape of the documents slice state
export interface DocumentsState {
    documents: Document[];
    currentDocument: Document | null;
}