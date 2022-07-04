# Revalidate NextJS on event
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aon/revalidate-nextjs-on-event/docker-ci)
![Docker Image Size (latest semver)](https://img.shields.io/docker/image-size/agustinaon/revalidate-nextjs-on-event)
![GitHub](https://img.shields.io/github/license/aon/revalidate-nextjs-on-event)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/aon/revalidate-nextjs-on-event)

This is a small docker-deployable app that listens for contract events and revalidates static pages on Next.js.

## How it works

Starting with `v12.2.0` Next.js supports [On-Demand Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation). This app takes advantage of that and allows to regenerate a given path on contract events. You can grab the event args to generate the path, or use a static one.

The app assumes you have set up and endpoint allowing POST requests on Next.js, and will a request with the following body:

```json
{
  "secret": "<REVALIDATE_TOKEN>",
  "path": "<path_to_revalidate>"
}
```

## Configuration

On the app side, you'll need to provide:

- A config file `config.json`
- The contracts ABIs
- The revalidate token `REVALIDATE_TOKEN`

On the Next.js side, you'll need to set up the API endpoint to revalidate, as we'll see below.

### Config file

Most configuration is done adding a folder `config` on the root and putting inside a `config.json` file. If running from docker, you'll need to add a volume on `/config`.

Sample `config.json`:

```json
{
  "provider": "<provider_url>",
  "events": [
    {
      "signature": "PostCreated(uint256)",
      "contract": {
        "address": "0x03c626D63410e79Aa31329e8Afb270A7c3C823A7",
        "name": "Blog"
      },
      "api": {
        "url": "<website_url>/api/revalidate",
        "path": "/[0]"
      }
    }
  ]
}
```

In this sample config file, we'll be revalidating the path `/[0]` where `[0]` will be replaced by the first argument of the event. So if the event was

```
PostCreated(1)
```

then the path to revalidate will be

```
/1
```

This can be extended to as many events you want and form the path with as many args you want.

### ABIs

The contract ABIs must be put inside a `abi` folder on the root. They must have the same name as the contract name defined in the config file. In the sample given, we should provide an abi with the name `Blog.json`.

The ABI should follow the following format:

```json
{
  "abi": ["..."]
}
```

### Revalidate token

The revaldation token or secret is provided through an env variable `REVALIDATE_TOKEN`.

### Next.js

On the Next.js side, you'll need to create an API endpoint that allows to send a body with a `secret` and a `path` to revalidate.

Sample:

```ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as { path?: string; secret?: string };

  if (body.secret === undefined) {
    return res.status(400).json({ message: "Missing token" });
  }
  if (body.secret !== process.env.REVALIDATE_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }
  if (body.path === undefined) {
    return res.status(400).json({ message: "Missing path" });
  }

  try {
    await res.revalidate(body.path);
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send("Error revalidating");
  }
}
```

## Docker

To run this app as a docker container you can use for example the following command:

```sh
docker run \
  -e REVALIDATE_TOKEN=<my_token> \
  -v <my_config_folder>:/app/config \
  -v <my_abis_folder>:/app/abi \
  revalidate-on-event
```

Or on docker-compose:

```yaml
version: "3"
services:
  revalidate-on-event:
    image: revalidate-on-event
    environment:
     - REVALIDETE_TOKEN=<my_token>
    volumes:
     - <my_config_folder>:/app/config
     - <my_abis_folder>:/app/abi
    restart: unless-stopped
```

## Collaboration

Collaborating is welcomed! This was done in a short period of time, when I found I needed this feature on a project I was building. There are probably a lot of edge cases I haven't thought of, but I think this is a good start point.
