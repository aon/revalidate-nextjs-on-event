export const parseApiPath = (originalPath: string, eventArgs: any[]) => {
  const PATH_ARGS_REGEX = /\[(\d*)\]/g;
  const path = originalPath.replace(PATH_ARGS_REGEX, (_, argPos) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    eventArgs[argPos].toString()
  );
  return path;
};
