export type Post = {
  datetime: string;
  username: string;
  social_name: string;
  text: string;
  city?: string;
  region?: string;
  country?: string;
  likes?: number;
  dislikes?: number;
  has_multimedia: boolean;
};