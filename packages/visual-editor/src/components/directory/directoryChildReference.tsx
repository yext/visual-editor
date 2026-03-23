import * as React from "react";
import {
  isDirectoryGrid,
  sortAlphabetically,
} from "../../utils/directory/utils.ts";

export type DirectoryChildReference = {
  childIndex: number;
  childId?: string;
};

type DirectoryChildProfile = Record<string, any>;

const DirectoryChildrenContext = React.createContext<DirectoryChildProfile[]>(
  []
);

export const DirectoryChildrenProvider = ({
  children,
  directoryChildren,
}: {
  children: React.ReactNode;
  directoryChildren: DirectoryChildProfile[];
}) => (
  <DirectoryChildrenContext.Provider value={directoryChildren}>
    {children}
  </DirectoryChildrenContext.Provider>
);

export const useDirectoryChildren = (): DirectoryChildProfile[] =>
  React.useContext(DirectoryChildrenContext);

export const getSortedDirectoryChildren = (
  directoryChildren: unknown
): DirectoryChildProfile[] => {
  if (
    !Array.isArray(directoryChildren) ||
    !isDirectoryGrid(directoryChildren)
  ) {
    return [];
  }

  return sortAlphabetically(directoryChildren, "name");
};

export const createDirectoryChildReference = (
  child: DirectoryChildProfile | undefined,
  childIndex: number
): DirectoryChildReference => ({
  childIndex,
  ...(typeof child?.id === "string" ? { childId: child.id } : {}),
});

export const matchesDirectoryChildReference = (
  childReference: DirectoryChildReference | undefined,
  child: DirectoryChildProfile | undefined,
  childIndex: number
): boolean => {
  if (!childReference || childReference.childIndex !== childIndex) {
    return false;
  }

  if (childReference.childId && childReference.childId !== child?.id) {
    return false;
  }

  return true;
};

export const resolveDirectoryChildFromReference = (
  directoryChildren: DirectoryChildProfile[],
  childReference: DirectoryChildReference | undefined
): DirectoryChildProfile | undefined => {
  if (!childReference) {
    return undefined;
  }

  const childAtIndex = directoryChildren[childReference.childIndex];
  if (
    matchesDirectoryChildReference(
      childReference,
      childAtIndex,
      childReference.childIndex
    )
  ) {
    return childAtIndex;
  }

  if (childReference.childId) {
    return directoryChildren.find(
      (child) => child?.id === childReference.childId
    );
  }

  return childAtIndex;
};
