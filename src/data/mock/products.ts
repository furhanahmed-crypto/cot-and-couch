import type { Product } from "@/types";
import { dtoAllProducts } from "./catalogue-from-dto";

/** Shop products — aligned with DB seed DTOs (all categories). */
export const products: Product[] = [...dtoAllProducts];
