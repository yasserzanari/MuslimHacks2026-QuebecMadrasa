import { beforeEach, describe, expect, it } from "vitest";
import { applyAction, creditsUsed, enqueueJob, listJobs, monthlyCredits, resetQueue } from "../generation-queue";

describe("file de génération", () => {
  beforeEach(() => resetQueue());

  it("places a new request in the queue, newest first", () => {
    enqueueJob({ type: "lesson", subject: "Mathématiques", requestText: "Additionner deux fractions" });
    const jobs = listJobs();
    expect(jobs[0].requestText).toBe("Additionner deux fractions");
    expect(jobs[0].status).toBe("queued");
  });

  it("refuses a request once the monthly credits are spent", () => {
    for (let index = creditsUsed(); index < monthlyCredits; index += 1) {
      enqueueJob({ type: "exercises", subject: "Français", requestText: `Demande ${index}` });
    }
    expect(() => enqueueJob({ type: "exercises", subject: "Français", requestText: "Une de trop" })).toThrow("credit_limit_reached");
  });

  it("never lets a draft reach the plan without an approval", () => {
    const job = listJobs().find((item) => item.status === "review_required");
    expect(job).toBeDefined();
    expect(() => applyAction(job!.id, "add_to_plan")).toThrow("job_not_approved");

    applyAction(job!.id, "approve");
    const approved = applyAction(job!.id, "add_to_plan");
    expect(approved.status).toBe("approved");
    expect(approved.addedToPlan).toBe(true);
  });

  it("records who approved the content", () => {
    const job = listJobs().find((item) => item.status === "review_required")!;
    expect(applyAction(job.id, "approve").approvedBy).toBe(job.parentId);
  });

  it("rejects an approved job instead of silently re-deciding it", () => {
    const job = listJobs().find((item) => item.status === "review_required")!;
    applyAction(job.id, "approve");
    expect(() => applyAction(job.id, "reject")).toThrow(/already final/);
  });

  it("retries a rejected job as a new attempt rather than reviving the old one", () => {
    const job = listJobs().find((item) => item.status === "review_required")!;
    applyAction(job.id, "reject");
    const retried = applyAction(job.id, "retry");

    expect(retried.id).not.toBe(job.id);
    expect(retried.status).toBe("queued");
    expect(retried.attemptCount).toBe(job.attemptCount + 1);
    expect(retried.draft).toBeUndefined();
    expect(listJobs().find((item) => item.id === job.id)?.status).toBe("rejected");
  });

  it("refunds the credit of a cancelled job", () => {
    const before = creditsUsed();
    const job = enqueueJob({ type: "lesson", subject: "Sciences", requestText: "Un job annulé" });
    expect(creditsUsed()).toBe(before + 1);
    applyAction(job.id, "cancel");
    expect(creditsUsed()).toBe(before);
  });

  it("reports an unknown job instead of failing silently", () => {
    expect(() => applyAction("job-inexistant", "approve")).toThrow("job_not_found");
  });
});
