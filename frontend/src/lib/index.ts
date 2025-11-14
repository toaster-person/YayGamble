// export const urlOrigin = "http://localhost:5912";
export const urlOrigin = "https://yayblaze.com";
export const backendUrl = "https://yayblaze.com/api";
//  export const backendUrl = "http://71.238.74.210:5300";

export function myRedirect(destination: string) {
  window.location.href = urlOrigin + destination;
}
