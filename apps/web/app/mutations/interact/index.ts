"use client";
import { DocumentNode, gql } from "@apollo/client";

export const CREATE_RECENT_PLAYED: DocumentNode = gql`
  mutation createRecentPlayed($input: CreateRecentPlayedDto!) {
    createRecentPlayed(input: $input) {
      id
      trackId
      title
      artist
      artwork
      duration
      playedAt
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
      artist
      artwork
      duration
      playedAt
      userId
    }
  }
`;
