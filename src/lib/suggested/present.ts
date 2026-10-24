// Turns saved jobs into the feed payload. Phone numbers are not selected.

import { listFeedComments, listFeedJobs, listJobFilterOptions, reactionSummary, type FeedComment } from "@/lib/db";
import type { SuggestedPost } from "@/lib/suggested/types";
import type { Job } from "@/lib/types";

function titleFor(job: Job): string {
  const summary = job.summary.trim();
  if (summary) return summary;
  return `${job.trade} in ${job.area}`;
}

export function presentFeed(filters: { area?: string; trade?: string; search?: string; interests?: string[] }, actorKey: string) {
  const jobs = listFeedJobs(filters);
  const options = listJobFilterOptions(filters.interests);
  const ids = jobs.map((job) => job.id);
  const comments = listFeedComments(ids);
  const reactions = reactionSummary(ids, actorKey);
  const byJob = new Map<number, FeedComment[]>();
  for (const comment of comments) {
    const list = byJob.get(comment.job_id) ?? [];
    list.push(comment);
    byJob.set(comment.job_id, list);
  }
  const posts: SuggestedPost[] = jobs.map((job) => ({
    id: job.id,
    title: titleFor(job),
    description: job.raw_text,
    trade: job.trade,
    area: job.area,
    timeframe: job.timeframe,
    size_estimate: job.size_estimate,
    created_at: job.created_at,
    posted_by: job.customer_name,
    comments: (byJob.get(job.id) ?? []).map((comment) => ({
      id: comment.id,
      author_name: comment.author_name,
      body: comment.body,
      created_at: comment.created_at,
    })),
    reactions: reactions.get(job.id) ?? { like: 0, interested: 0, mine: { like: false, interested: false } },
  }));
  return { posts, areas: options.areas, trades: options.trades };
}
