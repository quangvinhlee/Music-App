import { useQuery } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/ultils/graphqlRequest";
import { GET_USER_QUERY, GET_COUNTRY_CODE_QUERY } from "app/mutations/auth";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await graphQLRequest(print(GET_USER_QUERY));
      return response.getUser;
    },
  });
}

export function useGeoInfo() {
  return useQuery({
    queryKey: ["geoInfo"],
    queryFn: async () => {
      const response = await graphQLRequest(print(GET_COUNTRY_CODE_QUERY), {});
      if (!response?.getCountryCodeByIp)
        throw new Error("Failed to get country information");
      return {
        countryCode: response.getCountryCodeByIp.countryCode || "US",
        countryName: response.getCountryCodeByIp.countryName || "United States",
      };
    },
  });
}
