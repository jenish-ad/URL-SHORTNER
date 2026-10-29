import axiosInstance from "../utils/axiosInstance";

export async function createShortUrl(url: string, slug?: string): Promise<string> {
  const { data } = await axiosInstance.post<{ shortUrl: string }>("/api/create", {
    url,
    slug,
  });
  return data.shortUrl;
}
