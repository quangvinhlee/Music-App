import { gql } from "@apollo/client";

export const GET_MY_PLAYLISTS = gql`
  query getMyPlaylists {
    getMyPlaylists {
      id
      name
      description
      isPublic
      userId
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
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
      }
    }
  }
`;

export const GET_PLAYLIST = gql`
  query getPlaylist($playlistId: String!) {
    getPlaylist(playlistId: $playlistId) {
      id
      name
      description
      isPublic
      userId
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
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
      }
    }
  }
`;

export const CREATE_PLAYLIST = gql`
  mutation createPlaylist($input: CreatePlaylistInput!) {
    createPlaylist(input: $input) {
      id
      name
      description
      isPublic
      userId
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artist {
          id
          username
        }
        artwork
        duration
        genre
        addedAt
      }
    }
  }
`;

export const UPDATE_PLAYLIST = gql`
  mutation updatePlaylist($playlistId: String!, $input: UpdatePlaylistInput!) {
    updatePlaylist(playlistId: $playlistId, input: $input) {
      id
      name
      description
      isPublic
      userId
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artist {
          id
          username
        }
        artwork
        duration
        genre
        addedAt
      }
    }
  }
`;

export const DELETE_PLAYLIST = gql`
  mutation deletePlaylist($playlistId: String!) {
    deletePlaylist(playlistId: $playlistId) {
      success
      message
    }
  }
`;

export const ADD_TRACK_TO_PLAYLIST = gql`
  mutation addTrackToPlaylist($input: AddTrackToPlaylistInput!) {
    addTrackToPlaylist(input: $input) {
      id
      name
      tracks {
        id
        trackId
        title
        artist {
          id
          username
        }
        artwork
        duration
        genre
        addedAt
      }
    }
  }
`;

export const REMOVE_TRACK_FROM_PLAYLIST = gql`
  mutation removeTrackFromPlaylist($playlistId: String!, $trackId: String!) {
    removeTrackFromPlaylist(playlistId: $playlistId, trackId: $trackId) {
      id
      name
      tracks {
        id
        trackId
        title
        artist {
          id
          username
        }
        artwork
        duration
        genre
        addedAt
      }
    }
  }
`;
