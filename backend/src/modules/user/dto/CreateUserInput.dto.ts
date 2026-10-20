import type { User } from '@clerk/express';

export type CreateUserInput = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'username' | 'emailAddresses' | 'imageUrl'
>;
