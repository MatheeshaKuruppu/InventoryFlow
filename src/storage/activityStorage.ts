import type { Activity } from '@/types';
import { localStorageService, STORAGE_KEYS } from '@/services/localStorageService';

/** Keep the activity feed bounded so localStorage never grows unbounded. */
const MAX_ACTIVITY = 100;

export const activityStorage = {
  getAll(): Activity[] {
    return localStorageService.read<Activity[]>(STORAGE_KEYS.activity, []);
  },

  saveAll(activity: Activity[]): void {
    localStorageService.write(STORAGE_KEYS.activity, activity);
  },

  save(entry: Activity): Activity[] {
    const activity = [entry, ...activityStorage.getAll()].slice(0, MAX_ACTIVITY);
    activityStorage.saveAll(activity);
    return activity;
  },
};
