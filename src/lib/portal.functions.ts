import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPortalOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getPortalOverviewForUser } = await import("./portal.server");
    return getPortalOverviewForUser(context.supabase, context.userId, context.claims.email as string | undefined);
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { claimInitialAdmin } = await import("./portal.server");
    return claimInitialAdmin(context.userId);
  });

export const createInstitution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ name: z.string().min(2).max(160), code: z.string().min(2).max(24) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createInstitutionForAdmin } = await import("./portal.server");
    return createInstitutionForAdmin(context.supabase, context.userId, data);
  });

export const createDmsUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(128),
      institutionId: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createDmsAccount } = await import("./portal.server");
    return createDmsAccount(context.supabase, context.userId, data);
  });

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      institutionId: z.string().uuid(),
      fullName: z.string().min(2).max(160),
      studentNumber: z.string().min(1).max(60),
      programme: z.string().min(2).max(160),
      dateOfBirth: z.string().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { addStudent } = await import("./portal.server");
    return addStudent(context.supabase, context.userId, data);
  });

export const createResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      institutionId: z.string().uuid(),
      studentId: z.string().uuid(),
      qualification: z.string().min(2).max(160),
      academicPeriod: z.string().min(2).max(60),
      marks: z.array(z.object({ subject: z.string().min(1).max(100), score: z.number().min(0).max(100) })).min(1),
      submit: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { addResult } = await import("./portal.server");
    return addResult(context.supabase, context.userId, data);
  });

export const approveResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resultId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { approveAndIssueResult } = await import("./portal.server");
    return approveAndIssueResult(context.supabase, context.userId, data.resultId);
  });

export const prepareCertificateTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resultId: z.string().uuid(), origin: z.string().url() }).parse(input))
  .handler(async ({ data, context }) => {
    const { prepareTag } = await import("./portal.server");
    return prepareTag(context.supabase, context.userId, data);
  });

export const recordTagWrite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ tagId: z.string().uuid(), serialNumber: z.string().max(200).optional(), locked: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { recordWrittenTag } = await import("./portal.server");
    return recordWrittenTag(context.supabase, context.userId, data);
  });

export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ code: z.string().min(8).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { getPublicCertificate } = await import("./portal.server");
    return getPublicCertificate(data.code);
  });