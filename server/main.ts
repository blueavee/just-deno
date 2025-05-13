import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { join } from "https://deno.land/std@0.177.0/path/mod.ts";

const staticFilesDir = join(Deno.cwd(), "frontend");

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const filePath = join(
    staticFilesDir,
    url.pathname === "/" ? "index.html" : url.pathname,
  );
  try {
    const file = await Deno.open(filePath);
    const extension = filePath.substring(filePath.lastIndexOf("."));
    let contentType = "application/octet-stream";
    if (extension === ".html") {
      contentType = "text/html";
    } else if (extension === ".css") {
      contentType = "text/css";
    } else if (extension === ".js") {
      contentType = "application/javascript";
    }

    return new Response(file.readable, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch {
    if (url.pathname === "/tweets") {
      const tweets = await Deno.readTextFile("./tweets.json");

      return new Response(tweets);
    }
    return new Response("Not Found", { status: 404 });
  }
};

const server = serve(handler);

console.log("Server is running on http://localhost:8000");
await server;
