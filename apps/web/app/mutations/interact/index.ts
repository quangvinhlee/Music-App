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
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artistId
        artwork
        duration
        genre
        trackType
        addedAt
        playlistId
        internalTrackId
      }
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
      trackType
      addedAt
      playlistId
      internalTrackId
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
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artistId
        artwork
        duration
        genre
        trackType
        addedAt
        playlistId
        internalTrackId
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
      createdAt
      updatedAt
      tracks {
        id
        trackId
        title
        artistId
        artwork
        duration
        genre
        trackType
        addedAt
        playlistId
        internalTrackId
      }
    }
  }
`;
