import { gql } from '@apollo/client';

export const UPDATE_USER_PROFILE = gql`
  mutation updateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      id
      email
      username
      avatar
      role
      isVerified
      isOurUser
    }
  }
`; 