/**
 * Activity Log API calls.
 */
import api from "../axios";

export const activityApi = {
  getLogs: (params?: { user_id?: string; action?: string }) =>
    api.get("/core/activity-logs/", { params }),
};
