"use client";
import { DocumentNode, gql } from "@apollo/client";

export const CREATE_RECENT_PLAYED: DocumentNode = gql`
  mutation createRecentPlayed($input: CreateRecentPlayedDto!) {
    createRecentPlayed(input: $input) {
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
      playedAt
      createdAt
      userId
    }
  }
`;
