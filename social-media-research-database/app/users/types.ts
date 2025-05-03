export type User = {
  social_name: string;
  username: string;
  first_name?: string;
  last_name?: string;
  birthdate?: Date;
  gender?: string;
  birth_country?: string;
  residence_country?: string;
  verified: boolean;
};