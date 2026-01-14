export async function uploadMealImage(mealId: number, file: File) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${base}/meals/${mealId}/image/`, {
    method: "POST",
    body: form,

  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed ${res.status}: ${text}`);
  }

  return res.json();
}
