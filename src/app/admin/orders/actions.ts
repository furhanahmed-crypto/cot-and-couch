"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { requireStaff } from "@/services/auth/require-staff";
import { changeOrderStatus, updateOrderDetails } from "@/services/orders/admin-mutations";
import { createOrder } from "@/services/orders/create-order";
import { listOrderVariantOptions, searchCustomers } from "@/services/orders/new-order-queries";
import type { ActionResult } from "@/types/action";
import type { CustomerMatch, OrderVariantOption } from "@/types/admin-orders";
import { idSchema } from "@/validation/common";
import {
  customerSearchSchema,
  newOrderSchema,
  orderDetailsSchema,
  orderStatusChangeSchema,
  type NewOrderInput,
  type OrderDetailsInput,
  type OrderStatusChangeInput,
} from "@/validation/orders";

function refresh(orderId?: string) {
  revalidatePath(ROUTES.admin.orders);
  revalidatePath(ROUTES.admin.root);
  if (orderId) revalidatePath(ROUTES.admin.order(orderId));
}

export async function createOrderAction(input: NewOrderInput): Promise<ActionResult<{ id: string }>> {
  const parsed = newOrderSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const staff = await requireStaff();
    const result = await createOrder(parsed.data, staff.id);
    refresh();
    return actionOk(result);
  } catch (error) {
    return toActionError(error, "Could not create the order");
  }
}

export async function changeOrderStatusAction(input: OrderStatusChangeInput): Promise<ActionResult<{ changed: boolean }>> {
  const parsed = orderStatusChangeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const staff = await requireStaff();
    const result = await changeOrderStatus(parsed.data, staff.id);
    refresh(parsed.data.orderId);
    return actionOk(result);
  } catch (error) {
    return toActionError(error, "Could not change the status");
  }
}

export async function updateOrderDetailsAction(orderId: string, input: OrderDetailsInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(orderId);
  const parsed = orderDetailsSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const staff = await requireStaff();
    await updateOrderDetails(parsedId.data, parsed.data, staff.id);
  } catch (error) {
    return toActionError(error, "Could not save the order");
  }
  refresh(parsedId.data);
  return actionOk();
}

/** Read-only helpers for the "New order" form. */
export async function searchCustomersAction(query: string): Promise<ActionResult<CustomerMatch[]>> {
  const parsed = customerSearchSchema.safeParse(query);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    return actionOk(await searchCustomers(parsed.data));
  } catch (error) {
    return toActionError(error, "Could not search customers");
  }
}

export async function listOrderVariantOptionsAction(productId: string): Promise<ActionResult<OrderVariantOption[]>> {
  const parsed = idSchema.safeParse(productId);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    return actionOk(await listOrderVariantOptions(parsed.data));
  } catch (error) {
    return toActionError(error, "Could not load the sizes");
  }
}
