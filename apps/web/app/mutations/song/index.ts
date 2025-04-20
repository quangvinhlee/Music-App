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
