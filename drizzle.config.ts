import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/main/database/schema/index.ts',
  dialect: 'sqlite'
})
