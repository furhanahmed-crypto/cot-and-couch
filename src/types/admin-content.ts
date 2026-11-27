import type { MediaType } from "@/constants/media";
import type { UserRole } from "@/constants/users";

export type MediaAdminItem = {
  id: string;
  type: MediaType;
  title: string | null;
  imageUrl: string;
  videoUrl: string | null;
  instagramUrl: string | null;
  productId: string | null;
  productName: string | null;
  area: string | null;
  deliveryMonth: string | null;
  tags: string[];
  isPublished: boolean;
};

export type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  joinedAt: string;
};
