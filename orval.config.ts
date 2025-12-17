import { defineConfig } from 'orval';

export default defineConfig({
  doctaura: {
    input: {
      target: './swagger.json',
      filters: {
        tags: ['Patients'], // Only generate patients API
      },
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/types/generated',
      client: 'react-query',
      httpClient: 'fetch',
      urlEncodeParameters: true,

      override: {
        mutator: {
          path: './src/api/mutator/customInstance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          useInfinite: false,
          signal: true,
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
