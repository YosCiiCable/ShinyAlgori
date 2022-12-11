export interface TwitterResponse {
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  profile_background_image_url: string;
  profile_image_url: string;
  created_at: string;
}

export interface TwitterModel {
  idStr: string;
  name: string;
  screenName: string;
  location: string;
  profileBackgroundImageUrl: string;
  profileImageUrl: string;
  createdAt: string;
}
