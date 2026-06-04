import type { CreateOrganizationData, UpdateOrganizationData } from "../repositories/organization.repository";

export const normalizeCreateOrganizationPayload = (
  body: Record<string, unknown>,
): CreateOrganizationData => ({
  name: String(body.name).trim(),
  type: body.type as CreateOrganizationData["type"],
  status: body.status as CreateOrganizationData["status"],
});

export const normalizeUpdateOrganizationPayload = (
  body: Record<string, unknown>,
): UpdateOrganizationData => {
  const dto: UpdateOrganizationData = {};
  if (body.name !== undefined) dto.name = String(body.name).trim();
  if (body.type !== undefined) dto.type = body.type as UpdateOrganizationData["type"];
  if (body.status !== undefined) dto.status = body.status as UpdateOrganizationData["status"];
  return dto;
};
