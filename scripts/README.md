# Thoughtworks Capable API Crawler

This script crawls data from the Thoughtworks Capable API and stores it in your `knowledge_chunks` table with embeddings for RAG functionality.

## Setup

1. **Enable pgvector in Supabase**:

   - Go to Database → Extensions
   - Enable the `vector` extension

2. **Run the migration**:

   ```bash
   pnpm db:migrate
   ```

3. **Get your cookies**:

   - Go to https://capable.thoughtworks.net/
   - Login with your Thoughtworks account
   - Open browser Dev Tools (F12)
   - Go to Network tab
   - Make any request to the site
   - Copy the `Cookie` header value

4. **Set environment variables**:
   ```bash
   export CAPABLE_COOKIES="your-cookie-string-here"
   export OPENAI_API_KEY="your-openai-key"  # Optional, for embeddings
   ```

## Usage

```bash
# Run the crawler
pnpm crawl
```

## What it does

1. **Fetches data** from all Capable API endpoints:

   - `/api/services`
   - `/api/service_lines`
   - `/api/capability_types`
   - `/api/competency_groups`
   - `/api/archetype_families`
   - `/api/capabilities`
   - `/api/competencies`
   - `/api/archetypes`

2. **Generates embeddings** for each item using OpenAI

3. **Saves to database** in the `knowledge_chunks` table

## Table Structure

The crawler populates your RAG table with:

- `type`: competency, capability, service, offering, archetype
- `title`: Name/title of the item
- `content`: Full descriptive text for embedding
- `embedding`: Vector embedding (1536 dimensions)
- `archetype`, `capability`, `service`, `offering`: Hierarchical relationships
- `source`: API endpoint URL

## Embedding Options

### Option 1: OpenAI (Recommended)

- Set `OPENAI_API_KEY`
- Uses `text-embedding-3-small` model
- High quality embeddings

### Option 2: Fallback

- If OpenAI fails, creates dummy embeddings
- You can later update with proper embeddings

## Querying Your RAG Data

```sql
-- Find similar items using vector similarity
SELECT title, content,
       embedding <-> '[your-query-embedding]' as distance
FROM knowledge_chunks
ORDER BY distance
LIMIT 5;

-- Filter by type and hierarchy
SELECT * FROM knowledge_chunks
WHERE type = 'competency'
  AND archetype = 'Product Manager';
```
