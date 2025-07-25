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
      tracks {
        id
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
        genre
        artwork
        duration
        description
        streamUrl
        playbackCount
        trackCount
        createdAt
      }
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
      likes {
        userId
        trackId
        track {
          id
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
          createdAt
        }
      }
      followers {
        followerId
        artist {
          id
          username
          avatarUrl
          verified
          city
          countryCode
          followersCount
        }
      }
      following {
        followingId
        artist {
          id
          username
          avatarUrl
          verified
          city
          countryCode
          followersCount
        }
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
      tracks {
        id
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
        genre
        artwork
        duration
        streamUrl
        playbackCount
        trackCount
        createdAt
      }
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
        }
        likes {
          userId
          trackId
          track {
            id
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
            createdAt
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

export const FOLLOW_USER = gql`
  mutation followUser($followingId: String!) {
    followUser(followingId: $followingId)
  }
`;

export const UNFOLLOW_USER = gql`
  mutation unfollowUser($followingId: String!) {
    unfollowUser(followingId: $followingId)
  }
`;

export const IS_FOLLOWING = gql`
  query isFollowing($followingId: String!) {
    isFollowing(followingId: $followingId)
  }
`;

export const GET_FOLLOWERS = gql`
  query getFollowers($userId: String!) {
    getFollowers(userId: $userId) {
      id
      username
      avatar
      isVerified
      followersCount
    }
  }
`;

export const GET_FOLLOWING = gql`
  query getFollowing($userId: String!) {
    getFollowing(userId: $userId) {
      id
      username
      avatar
      isVerified
      followersCount
    }
  }
`;
