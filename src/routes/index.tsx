import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useKv } from "@/cloud";

async function readCount(kv: ReturnType<typeof useKv>) {
  return parseInt((await kv.getItem("count")) as string, 10);
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  const kv = useKv();

  return readCount(kv);
});

const updateCount = createServerFn({ method: "POST" })
  .inputValidator((d: number) => d)
  .handler(async ({ data }) => {
    const kv = useKv();

    const count = await readCount(kv);
    await kv.setItem("count", `${count + data}`);
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  return (
    <button
      type="button"
      onClick={() => {
        updateCount({ data: 1 }).then(() => {
          router.invalidate();
        });
      }}
    >
      Add 1 to {state}?
    </button>
  );
}
