import type { CodegenConfig } from "@graphql-codegen/cli";

/*
  Generates typed GraphQL documents from AniList's schema.
  `documentMode: "string"` emits TypedDocumentString values that carry result +
  variable types and stringify to the raw query — ideal for a native fetch client
  that uses Next's built-in cache.
*/
const config: CodegenConfig = {
  schema: "https://graphql.anilist.co",
  documents: ["src/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "src/lib/anilist/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
      },
    },
  },
};

export default config;
