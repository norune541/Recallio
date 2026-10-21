export type CreateUserInput = {
  readonly id: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly username: string | null;
  readonly imageUrl: string;
  readonly emailAddresses: readonly { emailAddress: string }[];
};
