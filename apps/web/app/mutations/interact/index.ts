"use client";
import { DocumentNode, gql } from "@apollo/client";

export const CREATE_RECENT_PLAYED: DocumentNode = gql`
  mutation createRecentPlayed($input: CreateRecentPlayedDto!) {
    createRecentPlayed(input: $input) {
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
`;

export const FETCH_RECENT_PLAYED: DocumentNode = gql`
  query getRecentPlayed {
    getRecentPlayed {
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
      streamUrl
      playedAt
      createdAt
      userId
    }
  }
`;

// Playlist mutations
export const CREATE_PLAYLIST: DocumentNode = gql`
  mutation createPlaylist($input: CreatePlaylistDto!) {
    createPlaylist(input: $input) {
      id
      name
      description
      isPublic
      genre
      userId
      artist {
        id
        username
        avatarUrl
        verified
        city
        countryCode
        followersCount
      }
      createdAt
      updatedAt
    }
  }
`;

export const ADD_TRACK_TO_PLAYLIST: DocumentNode = gql`
  mutation addTrackToPlaylist(
    $playlistId: String!
    $input: CreatePlaylistTrackDto!
  ) {
    addTrackToPlaylist(playlistId: $playlistId, input: $input) {
      id
      trackId
      title
      artistId
      artwork
      duration
      genre
      addedAt
      playlistId
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
`;

export const GET_PLAYLISTS: DocumentNode = gql`
  query getPlaylists {
    getPlaylists {
      id
      name
      description
      isPublic
      genre
      userId
      artist {
        id
        username
        avatarUrl
        verified
        city
        countryCode
        followersCount
      }
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artistId
        artwork
        duration
        streamUrl
        genre
        addedAt
        playlistId
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

export const GET_PLAYLIST: DocumentNode = gql`
  query getPlaylist($playlistId: String!) {
    getPlaylist(playlistId: $playlistId) {
      id
      name
      description
      isPublic
      genre
      userId
      artist {
        id
        username
        avatarUrl
        verified
        city
        countryCode
        followersCount
      }
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artistId
        artwork
        duration
        streamUrl
        genre
        addedAt
        playlistId
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

export const UPDATE_PLAYLIST: DocumentNode = gql`
  mutation updatePlaylist($playlistId: String!, $data: UpdatePlaylistDto!) {
    updatePlaylist(playlistId: $playlistId, data: $data) {
      id
      name
      description
      isPublic
      genre
      userId
      artist {
        id
        username
        avatarUrl
        verified
        city
        countryCode
        followersCount
      }
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artistId
        artwork
        duration
        streamUrl
        genre
        addedAt
        playlistId
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

export const DELETE_PLAYLIST: DocumentNode = gql`
  mutation deletePlaylist($playlistId: String!) {
    deletePlaylist(playlistId: $playlistId)
  }
`;

// Track mutations
export const CREATE_TRACK: DocumentNode = gql`
  mutation createTrack($input: CreateTrackDto!) {
    createTrack(input: $input) {
      id
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
      genre
      artwork
      duration
      streamUrl
      playbackCount
      createdAt
    }
  }
`;

export const UPDATE_TRACK: DocumentNode = gql`
  mutation updateTrack($trackId: String!, $input: UpdateTrackDto!) {
    updateTrack(trackId: $trackId, input: $input) {
      id
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
      genre
      artwork
      duration
      streamUrl
      playbackCount
      createdAt
    }
  }
`;

export const DELETE_TRACK: DocumentNode = gql`
  mutation deleteTrack($trackId: String!) {
    deleteTrack(trackId: $trackId)
  }
`;

export const LIKE_TRACK: DocumentNode = gql`
  mutation likeTrack($trackId: String!) {
    likeTrack(trackId: $trackId)
  }
`;

export const UNLIKE_TRACK: DocumentNode = gql`
  mutation unlikeTrack($trackId: String!) {
    unlikeTrack(trackId: $trackId)
  }
`;

export const SEARCH_TRACKS: DocumentNode = gql`
  query searchTracks($query: String!, $limit: Int) {
    searchTracks(query: $query, limit: $limit) {
      id
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
      genre
      artwork
      duration
      streamUrl
      playbackCount
      createdAt
    }
  }
`;

export const GET_LIKED_TRACKS: DocumentNode = gql`
  query getLikedTracks {
    getLikedTracks {
      id
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
      genre
      artwork
      duration
      streamUrl
      playbackCount
      createdAt
    }
  }
`;

export const IS_TRACK_LIKED: DocumentNode = gql`
  query isTrackLiked($trackId: String!) {
    isTrackLiked(trackId: $trackId)
  }
`;
