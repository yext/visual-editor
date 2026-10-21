import type { Fields } from "@puckeditor/core";
import type { EditCollectionRef, SectionEditTask } from "./types.ts";

/** Compare collection identities without depending on their inventory metadata. */
export const sameCollection = (
  left: EditCollectionRef,
  right: EditCollectionRef
) => left.ownerId === right.ownerId && left.slotPath === right.slotPath;

/** Whether replacing a value could replace a native child collection. */
export const hasSlots = (field?: Fields[string]): boolean =>
  field?.type === "slot" ||
  (field?.type === "object" &&
    Object.values(field.objectFields).some(hasSlots)) ||
  (field?.type === "array" && Object.values(field.arrayFields).some(hasSlots));

/** Reject malformed dependency graphs before starting any work. */
export const validateTaskGraph = (tasks: SectionEditTask[]) => {
  const byId = new Map(tasks.map((task) => [task.taskId, task]));
  if (
    byId.size !== tasks.length ||
    new Set(tasks.map((task) => task.sectionId)).size !== tasks.length
  ) {
    throw new Error("Plan tasks and owning sections must be unique.");
  }
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (task: SectionEditTask) => {
    if (visiting.has(task.taskId)) {
      throw new Error("Task dependencies must be acyclic.");
    }
    if (visited.has(task.taskId)) {
      return;
    }
    visiting.add(task.taskId);
    if (new Set(task.dependsOn).size !== task.dependsOn.length) {
      throw new Error("Task dependencies must be unique.");
    }
    for (const id of task.dependsOn) {
      const dependency = byId.get(id);
      if (!dependency) {
        throw new Error("Task dependency does not exist.");
      }
      visit(dependency);
    }
    visiting.delete(task.taskId);
    visited.add(task.taskId);
  };
  tasks.forEach(visit);
};
