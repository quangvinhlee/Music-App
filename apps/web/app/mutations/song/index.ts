"use client";
import { DocumentNode, gql } from "@apollo/client";

export const FETCH_HOT_SONG_BY_GENRE: DocumentNode = gql`
  query fetchHotSoundCloudTracks($fetchHotSongInput: FetchSongDto!) {
    fetchHotSoundCloudTracks(fetchHotSongInput: $fetchHotSongInput) {
      id
      title
      artist
      genre
      artwork
      streamUrl
      duration
    }
  }
`;

export const FETCH_TRENDING_SONG: DocumentNode = gql`
  query fetchTrendingSong($fetchTrendingSongInput: FetchTrendingSongDto!) {
    fetchTrendingSong(fetchTrendingSongInput: $fetchTrendingSongInput) {
      id
      username
    }
  }
`;

export const FETCH_TRENDING_SONG_PLAYLISTS: DocumentNode = gql`
  query fetchTrendingSongPlaylists(
    $fetchTrendingSongPlaylistsInput: FetchTrendingSongPlaylistsDto!
  ) {
    fetchTrendingSongPlaylists(
      fetchTrendingSongPlaylistsInput: $fetchTrendingSongPlaylistsInput
    ) {
      id
      title
      genre
      artwork
    }
  }
`;

export const FETCH_TRENDING_PLAYLIST_SONGS: DocumentNode = gql`
  query fetchTrendingPlaylistSongs(
    $fetchTrendingPlaylistSongsInput: FetchTrendingPlaylistSongsDto!
  ) {
    fetchTrendingPlaylistSongs(
      fetchTrendingPlaylistSongsInput: $fetchTrendingPlaylistSongsInput
    ) {
      id
      title
      artist
      genre
      artwork
      streamUrl
      duration
    }
  }
`;

export const FETCH_RELATED_SONGS: DocumentNode = gql`
  query fetchRelatedSongs($fetchRelatedSongsInput: FetchRelatedSongsDto!) {
    fetchRelatedSongs(fetchRelatedSongsInput: $fetchRelatedSongsInput) {
      id
      title
      artist
      genre
      artwork
      streamUrl
      duration
    }
  }
`;

export const SEARCH_TRACKS: DocumentNode = gql`
  query searchTracks($searchTracksInput: SearchDto!) {
    searchTracks(searchTracksInput: $searchTracksInput) {
      tracks {
        id
        title
        artist
        artistId
        genre
        artwork
        duration
        streamUrl
        playbackCount
      }
      nextHref
    }
  }
`;

export const SEARCH_USERS: DocumentNode = gql`
  query searchUsers($searchUsersInput: SearchDto!) {
    searchUsers(searchUsersInput: $searchUsersInput) {
      users {
        id
        username
        avatarUrl
        followersCount
      }
      nextHref
    }
  }
`;

export const SEARCH_ALBUMS: DocumentNode = gql`
  query searchAlbums($searchAlbumsInput: SearchDto!) {
    searchAlbums(searchAlbumsInput: $searchAlbumsInput) {
      albums {
        id
        title
        artist
        artistId
        genre
        artwork
        duration
        trackCount
      }
      nextHref
    }
  }
`;
