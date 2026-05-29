import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Cross-feature boundary guards (Phase 1.8G).
// The public catalog (features/digital-menu) and the owner dashboard
// (features/owner) ship as separate production app surfaces — see
// docs/production-app-boundaries.md. Direct imports between them blur that
// boundary. Shared code belongs in src/lib or src/components.
const CATALOG_FORBIDS_OWNER_MESSAGE =
  'Public catalog must not import owner dashboard code. Move shared code to src/lib or src/components/shared.'

const OWNER_FORBIDS_CATALOG_MESSAGE =
  'Owner dashboard must not import public catalog internals. Move shared code to src/lib or src/components/shared.'

const OWNER_PATH_PATTERNS = [
  '@/features/owner',
  '@/features/owner/**',
  '../owner',
  '../owner/**',
  '../../owner',
  '../../owner/**',
  '../../../owner',
  '../../../owner/**',
]

const CATALOG_PATH_PATTERNS = [
  '@/features/digital-menu',
  '@/features/digital-menu/**',
  '../digital-menu',
  '../digital-menu/**',
  '../../digital-menu',
  '../../digital-menu/**',
  '../../../digital-menu',
  '../../../digital-menu/**',
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/features/digital-menu/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: OWNER_PATH_PATTERNS,
              message: CATALOG_FORBIDS_OWNER_MESSAGE,
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/owner/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: CATALOG_PATH_PATTERNS,
              message: OWNER_FORBIDS_CATALOG_MESSAGE,
            },
          ],
        },
      ],
    },
  },
])
