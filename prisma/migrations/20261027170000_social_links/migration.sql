-- CreateTable
CREATE TABLE IF NOT EXISTS "social_links" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT,
    "icon" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "show_in_header" BOOLEAN NOT NULL DEFAULT false,
    "show_in_footer" BOOLEAN NOT NULL DEFAULT true,
    "show_in_contact" BOOLEAN NOT NULL DEFAULT true,
    "show_in_about" BOOLEAN NOT NULL DEFAULT true,
    "show_in_hero" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "social_links_platform_key" ON "social_links"("platform");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "social_links_is_enabled_idx" ON "social_links"("is_enabled");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "social_links_is_published_idx" ON "social_links"("is_published");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "social_links_sort_order_idx" ON "social_links"("sort_order");
