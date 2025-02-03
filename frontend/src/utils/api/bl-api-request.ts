// Unpack data that is encapsulated in a BlApiResponse
export default function unpack<T>(response: unknown) {
  return (response as { data: { data: T } }).data.data;
}
