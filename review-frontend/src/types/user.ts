export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserStats {
  totalReviews: number;
  avgRating: number;
  totalComments: number;
}
