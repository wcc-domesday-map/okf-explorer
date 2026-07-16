import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        'base-uri': ['none'],
        'object-src': ['none'],
        'form-action': ['self'],
        'script-src': ['self'],
        'worker-src': ['self'],
        'connect-src': ['self'],
        'img-src': ['self', 'data:', 'blob:'],
        'style-src': ['self', 'unsafe-inline'],
        'font-src': ['self'],
        'manifest-src': ['self'],
        'media-src': ['none'],
        'frame-src': ['none']
      }
    },
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      strict: true
    }),
    paths: {
      relative: true
    },
    prerender: {
      entries: ['*']
    }
  }
};

export default config;
