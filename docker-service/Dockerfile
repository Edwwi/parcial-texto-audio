
FROM denoland/deno:alpine

WORKDIR /app

COPY main.ts .

EXPOSE 3000

USER deno

CMD ["run", "--allow-net", "--allow-env", "main.ts"]
