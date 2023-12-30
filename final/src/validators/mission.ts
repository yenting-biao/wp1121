import { z } from "zod";

export const missionSchema = z.object({
  missionName: z.string(),
  missionDescription: z.string(),
  relatedPlaceId: z.string().optional(),
  prize: z.number().or(z.string()),
  startAt: z.date().or(z.string()),
  endAt: z.date().or(z.string()),
});

export const deleteMissionSchema = z.object({
  missionId: z.string(),
});

export const finishMissionSchema = z.object({
  missionId: z.string(),
});