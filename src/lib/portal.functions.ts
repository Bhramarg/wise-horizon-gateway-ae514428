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
    z
      .object({ email: z.string().email(), password: z.string().min(8).max(128), institutionId: z.string().uuid() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createDmsAccount } = await import("./portal.server");
    return createDmsAccount(context.supabase, context.userId, data);
  });

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        institutionId: z.string().uuid(),
        fullName: z.string().min(2).max(160),
        studentNumber: z.string().min(1).max(60),
        programme: z.string().min(2).max(160),
        dateOfBirth: z.string().max(20).optional(),
        caste: z.string().max(80).optional(),
        birthmark: z.string().max(200).optional(),
        faceIdNumber: z.string().max(80).optional(),
        address: z.string().max(500).optional(),
        guardians: z
          .array(
            z.object({
              relation: z.string().min(1).max(40),
              name: z.string().min(1).max(160),
              occupation: z.string().max(120).optional(),
              contact: z.string().max(80).optional(),
            }),
          )
          .max(4)
          .default([]),
        photoPath: z.string().max(300).optional(),
        prevSchoolDocPath: z.string().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { addStudent } = await import("./portal.server");
    return addStudent(context.supabase, context.userId, data);
  });

export const createResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        institutionId: z.string().uuid(),
        studentId: z.string().uuid(),
        qualification: z.string().min(2).max(160),
        academicPeriod: z.string().min(2).max(60),
        marks: z
          .array(
            z.object({
              subject: z.string().min(1).max(100),
              score: z.number().min(0).max(1000),
              maxScore: z.number().min(1).max(1000),
            }),
          )
          .min(1)
          .max(30),
        submit: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { addResult } = await import("./portal.server");
    return addResult(context.supabase, context.userId, data);
  });

export const submitResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resultId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { submitResultForEvaluation } = await import("./portal.server");
    return submitResultForEvaluation(context.supabase, context.userId, data.resultId);
  });

export const attachPortfolioFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resultId: z.string().uuid(), path: z.string().min(3).max(300) }).parse(input))
  .handler(async ({ data, context }) => {
    const { attachPortfolio } = await import("./portal.server");
    return attachPortfolio(context.supabase, data.resultId, data.path);
  });

export const generatePortfolioKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resultId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { issuePortfolioKey } = await import("./portal.server");
    return issuePortfolioKey(context.supabase, data.resultId);
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
    return recordWrittenTag(context.supabase, context.userId, { ...data, serialNumber: data.serialNumber });
  });

export const testCertificateTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ tagId: z.string().uuid(), payload: z.string().min(4).max(600) }).parse(input))
  .handler(async ({ data, context }) => {
    const { recordTagTest } = await import("./portal.server");
    return recordTagTest(context.supabase, context.userId, data);
  });

export const revokeCertificateTag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ tagId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { revokeTag } = await import("./portal.server");
    return revokeTag(context.supabase, context.userId, data.tagId);
  });

export const updateResultStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        resultId: z.string().uuid(),
        status: z.enum(["draft", "submitted", "approved", "issued", "revoked", "on_hold", "review_required"]),
        note: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { setResultStatus } = await import("./portal.server");
    return setResultStatus(context.supabase, context.userId, data);
  });

export const deleteResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ resultId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { deleteResultAsAdmin } = await import("./portal.server");
    return deleteResultAsAdmin(context.supabase, context.userId, data.resultId);
  });

export const getSignedFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ bucket: z.enum(["student-files", "portfolios"]), path: z.string().min(3).max(300) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { signedFileUrl } = await import("./portal.server");
    return signedFileUrl(context.supabase, data);
  });

export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().min(8).max(80), token: z.string().max(200).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getPublicCertificate } = await import("./portal.server");
    return getPublicCertificate(data.code, data.token);
  });

export const redeemPortfolio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ code: z.string().min(8).max(80), key: z.string().min(6).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { redeemPortfolioKey } = await import("./portal.server");
    return redeemPortfolioKey(data.code, data.key);
  });
