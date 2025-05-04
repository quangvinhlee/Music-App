"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "app/store/store";
import { fetchUser, getGeoInfo } from "app/store/auth";
import { fetchTrendingIdByCountry } from "app/store/song";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();
  const { countryCode } = useSelector((state: RootState) => state.auth);
  const { trendingId } = useSelector((state: RootState) => state.song);

  // Load user if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!countryCode) {
      dispatch(getGeoInfo()).then((res) => {
        if (
          res.meta.requestStatus === "fulfilled" &&
          typeof res.payload === "object" &&
          "countryCode" in res.payload
        ) {
          const country = res.payload.countryCode;
          console.log("Fetched country code:", country);

          dispatch(fetchTrendingIdByCountry({ countryCode: country }))
            .then((result) => {
              if (result.meta.requestStatus === "fulfilled") {
                console.log(
                  "Trending ID fetched successfully:",
                  result.payload
                );
              } else {
                console.error("Failed to fetch trending ID:", result.error);
              }
            })
            .catch((error) => {
              console.error("Error in fetchTrendingIdByCountry:", error);
            });
        } else {
          console.error("Failed to get country code", res);
        }
      });
    } else if (countryCode && !trendingId) {
      console.log("Using existing country code:", countryCode);
      dispatch(fetchTrendingIdByCountry({ countryCode }));
    }
  }, [countryCode, trendingId, dispatch]);

  return null; // Just performs logic
}
