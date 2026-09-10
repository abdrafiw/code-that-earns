export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  companyLists: () => [...submissionKeys.lists(), 'company'] as const,
  companyList: (companyUid: string | undefined) =>
    [...submissionKeys.companyLists(), companyUid] as const,
  developerLists: () => [...submissionKeys.lists(), 'developer'] as const,
  developerList: (developerUid: string | undefined) =>
    [...submissionKeys.developerLists(), developerUid] as const,
};
