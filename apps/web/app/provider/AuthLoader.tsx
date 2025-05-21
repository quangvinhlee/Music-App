"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "app/store/store";
import { useGeoInfo, useUser } from "app/query/useAuthQueries";
import { useTrendingIdByCountry } from "app/query/useSongQueries";
import { setCurrentSong } from "app/store/song";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();
  // Use TanStack Query hooks
  const { data: geoInfo, isSuccess: geoSuccess } = useGeoInfo();
  const { data: user } = useUser();
  const countryCode = geoInfo?.countryCode;
  const { data: trendingIdData, isSuccess: trendingIdSuccess } =
    useTrendingIdByCountry(countryCode);

  // Optionally, you can store trendingId in localStorage if needed
  useEffect(() => {
    if (trendingIdSuccess && trendingIdData?.id) {
      localStorage.setItem("trendingId", trendingIdData.id);
    }
  }, [trendingIdSuccess, trendingIdData]);

  // Optionally, you can store geoInfo in Redux if you want to keep it in state
  useEffect(() => {
    if (geoSuccess && geoInfo?.countryCode) {
      // dispatch(setCountryCode(geoInfo.countryCode)); // If you want to store it in Redux
    }
  }, [geoSuccess, geoInfo, dispatch]);

  // Optionally, you can store user in Redux if you want to keep it in state
  useEffect(() => {
    if (user) {
      // dispatch(setUser(user)); // If you want to store it in Redux
    }
  }, [user, dispatch]);

  return null; // Just performs logic
}
