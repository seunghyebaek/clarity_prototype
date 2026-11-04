import type { OnboardingTask } from "@/types/api";
import type { OnboardingProfile } from "./app-context";

/** Tasks that apply to a demo profile. Pure, so progress is always derived from real state. */
export function tasksForProfile(tasks: OnboardingTask[], p: OnboardingProfile): OnboardingTask[] {
  return tasks.filter((t) => {
    const a = t.applies_to;
    if (!a) return true;
    return (!a.country || a.country.includes(p.country)) &&
      (!a.department || a.department.includes(p.department)) &&
      (!a.role || a.role.includes(p.role));
  });
}

export function progressOf(tasks: OnboardingTask[], done: string[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => done.includes(t.id)).length;
  return { total, completed, ratio: total === 0 ? 0 : completed / total };
}

export { effectiveState, policyStatusOf, DEMO_TODAY } from "./demo-date";
