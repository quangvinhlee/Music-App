import { gql } from "@apollo/client";

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

export const GET_CURRENT_USER = gql`
  query getUser {
    getUser {
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

export const GET_USER_BY_ID = gql`
  query getUserById($userId: String!) {
    getUserById(userId: $userId) {
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

export const UPDATE_USER_BY_ID = gql`
  mutation updateUserById($userId: String!, $input: UpdateUserInput!) {
    updateUserById(userId: $userId, input: $input) {
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

export const UPLOAD_AVATAR = gql`
  mutation uploadAvatar($input: UploadAvatarInput!) {
    uploadAvatar(input: $input) {
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
