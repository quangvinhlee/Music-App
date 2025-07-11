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
      googleId
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
      googleId
      playlists {
        id
        name
        description
        isPublic
        genre
        userId
        createdAt
        updatedAt
        tracks {
          id
          trackId
          title
          artistId
          artist {
            id
            username
            avatarUrl
            verified
            city
            countryCode
            followersCount
          }
          artwork
          duration
          genre
          addedAt
          playlistId
          Track {
            id
            title
            description
            artwork
            duration
            genre
            streamUrl
            userId
            createdAt
            updatedAt
          }
        }
      }
      recentPlayed {
        id
        trackId
        title
        artistId
        artist {
          id
          username
          avatarUrl
          verified
          city
          countryCode
          followersCount
        }
        artwork
        duration
        genre
        playedAt
        createdAt
        userId
      }
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
      googleId
      playlists {
        id
        name
        description
        isPublic
        genre
        userId
        createdAt
        updatedAt
        tracks {
          id
          trackId
          title
          artistId
          artist {
            id
            username
            avatarUrl
            verified
            city
            countryCode
            followersCount
          }
          artwork
          duration
          genre
          addedAt
          playlistId
          Track {
            id
            title
            description
            artwork
            duration
            genre
            streamUrl
            userId
            createdAt
            updatedAt
          }
        }
      }
      recentPlayed {
        id
        trackId
        title
        artistId
        artist {
          id
          username
          avatarUrl
          verified
          city
          countryCode
          followersCount
        }
        artwork
        duration
        genre
        playedAt
        createdAt
        userId
      }
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
      googleId
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
      googleId
    }
  }
`;

export const DELETE_AVATAR = gql`
  mutation deleteAvatar {
    deleteAvatar {
      id
      email
      username
      avatar
      role
      isVerified
      isOurUser
      googleId
    }
  }
`;
