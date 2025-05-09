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
  seconds_known: boolean;
  reposts: number;
};

export type Repost = {
    post_datetime: string;
    post_username: string;
    repost_username: string;
    repost_datetime: string;
    repost_seconds_known: boolean;
    social_name: string;
}