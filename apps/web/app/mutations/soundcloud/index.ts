"use client";
import { DocumentNode, gql } from "@apollo/client";

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
      name
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
      tracks {
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
        createdAt
      }
    }
  }
`;

export const FETCH_GLOBAL_TRENDING_SONGS: DocumentNode = gql`
  query fetchGlobalTrendingSongs(
    $fetchGlobalTrendingSongsInput: FetchGlobalTrendingSongsDto!
  ) {
    fetchGlobalTrendingSongs(
      fetchGlobalTrendingSongsInput: $fetchGlobalTrendingSongsInput
    ) {
      tracks {
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
        playbackCount
        createdAt
      }
      nextHref
    }
  }
`;

export const FETCH_RELATED_SONGS: DocumentNode = gql`
  query fetchRelatedSongs($fetchRelatedSongsInput: FetchRelatedSongsDto!) {
    fetchRelatedSongs(fetchRelatedSongsInput: $fetchRelatedSongsInput) {
      tracks {
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
        streamUrl
        artwork
        duration
        createdAt
      }
    }
  }
`;

export const SEARCH_TRACKS: DocumentNode = gql`
  query searchTracks($searchTracksInput: SearchDto!) {
    searchTracks(searchTracksInput: $searchTracksInput) {
      tracks {
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
        playbackCount
        createdAt
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
        verified
        city
        countryCode
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
        trackCount
        createdAt
        tracks {
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
          playbackCount
          createdAt
        }
      }
      nextHref
    }
  }
`;

export const FETCH_STREAM_URL: DocumentNode = gql`
  query fetchStreamUrl($fetchStreamUrlInput: FetchStreamUrlDto!) {
    fetchStreamUrl(fetchStreamUrlInput: $fetchStreamUrlInput)
  }
`;

export const FETCH_RECOMMENDED_ARTISTS: DocumentNode = gql`
  query fetchRecommendedArtists(
    $fetchRecommendedArtistsInput: FetchRecommendedArtistsDto!
  ) {
    fetchRecommendedArtists(
      fetchRecommendedArtistsInput: $fetchRecommendedArtistsInput
    ) {
      artists {
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

export const RECOMMEND_SONGS: DocumentNode = gql`
  query recommendSongs {
    recommendSongs {
      tracks {
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
        playbackCount
        createdAt
      }
    }
  }
`;

export const FETCH_ARTIST_DATA = gql`
  query fetchArtistData($fetchArtistDataInput: FetchArtistDataDto!) {
    fetchArtistData(fetchArtistDataInput: $fetchArtistDataInput) {
      tracks {
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
        playbackCount
        createdAt
      }
      playlists {
        id
        artwork
        userId
        name
        genre
        createdAt
        artist {
          id
          username
          avatarUrl
          verified
          city
          countryCode
          followersCount
        }
        tracks {
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
      likes {
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
        playbackCount
        trackCount
        createdAt
        streamUrl
      }
      reposts {
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
        playbackCount
        trackCount
        createdAt
        streamUrl
      }
      nextHref
    }
  }
`;

export const FETCH_ARTIST_INFO = gql`
  query fetchArtistInfo($fetchArtistInfoInput: FetchArtistInfoDto!) {
    fetchArtistInfo(fetchArtistInfoInput: $fetchArtistInfoInput) {
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

export const FETCH_ALBUM_TRACKS = gql`
  query fetchAlbumTracks($fetchAlbumTracksInput: FetchAlbumTracksDto!) {
    fetchAlbumTracks(fetchAlbumTracksInput: $fetchAlbumTracksInput) {
      playlist {
        id
        title
        artwork
        artist {
          id
          username
          avatarUrl
          verified
          city
          countryCode
          followersCount
        }
        trackCount
        duration
        genre
        createdAt
        tracks {
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
          playbackCount
          createdAt
        }
      }
    }
  }
`;
